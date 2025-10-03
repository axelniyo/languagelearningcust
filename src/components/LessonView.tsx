import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from './seo/Seo';
import { generateSeoConfig } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Keep all the interface definitions from your original file
interface Lesson {
  id: string;
  name: string;
  description: string;
  lesson_type: 'vocabulary' | 'phrases' | 'grammar' | 'exercises';
  xp_reward: number;
  unit_name?: string;
  course_name?: string;
  created_at?: string;
  updated_at?: string;
  course?: {
    id: string;
    name: string;
    language: {
      name: string;
      flag_emoji: string;
    };
  };
  content?: {
    exercises?: Exercise[];
    instructions?: string;
    [key: string]: any;
  } | LessonContent[] | null;
}

interface LessonContent {
  id: string;
  [key: string]: any;
}

interface ExerciseOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface InteractiveExercise {
  id: string;
  type: 'multiple_choice';
  question: string;
  points: number;
  explanation?: string;
  options: ExerciseOption[];
}

interface Exercise {
  id: string;
  exercise_type: string;
  question: string;
  correct_answer: string;
  options?: string[];
  explanation?: string;
}

// Keep all the helper functions
const extractString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value);
    if (values.length > 0 && typeof values[0] === 'string') return values[0];
    return JSON.stringify(value);
  }
  return String(value);
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getLanguageSpecificWrongOptions = (language: string, excludeText: string, count: number = 3): string[] => {
  const languageOptions: Record<string, string[]> = {
    'spanish': ['Hola', 'Adiós', 'Por favor', 'Gracias', 'Bien', 'Mal'],
    'german': ['Hallo', 'Danke', 'Bitte', 'Ja', 'Nein', 'Gut'],
    'french': ['Bonjour', 'Merci', 'Oui', 'Non', 'Bien', 'Mal'],
    'english': ['Hello', 'Thank you', 'Yes', 'No', 'Good', 'Bad']
  };
  const options = languageOptions[language.toLowerCase()] || languageOptions.english;
  const filteredOptions = options.filter(option => option && option !== excludeText);
  return shuffleArray(filteredOptions).slice(0, count);
};

export function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interactiveExercises, setInteractiveExercises] = useState<InteractiveExercise[]>([]);
  const [exerciseResponses, setExerciseResponses] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const handleExerciseResponse = (exerciseId: string, response: any) => {
    setExerciseResponses(prev => ({ ...prev, [exerciseId]: response }));
  };

  const toggleFeedback = (exerciseId: string) => {
    setShowFeedback(prev => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  };

  const isAnswerCorrect = (exercise: InteractiveExercise, response: any): boolean => {
    if (!response) return false;
    const selectedOption = exercise.options.find(opt => opt.id === response.selectedOptionId);
    return selectedOption ? selectedOption.isCorrect : false;
  };

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        const response = await api.getLesson(lessonId) as Lesson;
        
        if (!response) {
          setError('Lesson not found');
          return;
        }

        if (response.lesson_type === 'exercises') {
          try {
            const exercisesData = await api.getExercises(lessonId);
            const filteredData = (exercisesData || []).filter((v: any) => String(v.lesson_id) === String(lessonId));
            
            if (filteredData.length > 0) {
              let language = 'english';
              const path = location.pathname;
              if (path.includes('german')) language = 'german';
              if (path.includes('french')) language = 'french';
              if (path.includes('spanish')) language = 'spanish';

              const convertedExercises = filteredData.map((item: any, index: number) => {
                const correctAnswer = extractString(item.correct_answer);
                const wrongOptions = getLanguageSpecificWrongOptions(language, correctAnswer, 3);
                return {
                  id: item.id || `ex-${index}`,
                  type: 'multiple_choice',
                  question: extractString(item.question),
                  points: 10,
                  explanation: item.explanation ? extractString(item.explanation) : undefined,
                  options: shuffleArray([
                    { id: `correct-${index}`, text: correctAnswer, isCorrect: true },
                    ...wrongOptions.map((wrongOption, wrongIndex) => ({
                      id: `wrong-${index}-${wrongIndex}`,
                      text: wrongOption,
                      isCorrect: false
                    }))
                  ])
                };
              });
              setInteractiveExercises(convertedExercises);
            } else {
              setInteractiveExercises([]);
            }
          } catch (error) {
            console.error('Error loading exercises:', error);
            setInteractiveExercises([]);
          }
        }
        setLesson(response);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [lessonId, location.pathname]);
  
  const handleCompleteLesson = async () => {
    if (!user || !lessonId) return;
    try {
      setSubmitting(true);
      const result = await api.markLessonCompleted(lessonId, user.id);
      if (result.success) {
        setIsCompleted(true);
        if (lesson?.course?.id) {
          navigate(`/learn/${lesson.course.language.name.toLowerCase()}`);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Keep the rest of your component's JSX rendering logic
  if (loading) return <div className="container mx-auto p-4"><Skeleton className="h-10 w-1/2 mb-4" /></div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!lesson) return <div className="container mx-auto p-4">Lesson not found.</div>;

  const seoConfig = generateSeoConfig('lesson', { title: lesson.name, description: lesson.description });

  return (
    <div className="container mx-auto p-4">
      <Seo {...seoConfig} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{lesson.name}</h1>
        <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>
        
        {lesson.lesson_type === 'exercises' && (
          <div className="space-y-8">
            {interactiveExercises.length > 0 ? (
              interactiveExercises.map((exercise, index) => (
                <Card key={exercise.id} className="p-6">
                  <h4 className="text-lg font-medium">Exercise {index + 1}</h4>
                  <p className="mb-4">{exercise.question}</p>
                  <div className="space-y-2">
                    {exercise.options.map((option) => (
                      <div key={option.id}>
                        <input
                          type="radio"
                          id={`option-${option.id}`}
                          name={`question-${exercise.id}`}
                          onChange={() => handleExerciseResponse(exercise.id, { selectedOptionId: option.id })}
                        />
                        <label htmlFor={`option-${option.id}`} className="ml-2">{option.text}</label>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : <p>No exercises available for this lesson.</p>}
          </div>
        )}

        {/* Add rendering for other lesson types (vocabulary, phrases, etc.) here */}

        {!isCompleted && user && (
          <div className="mt-8">
            <Button size="lg" onClick={handleCompleteLesson} disabled={submitting}>
              {submitting ? 'Completing...' : 'Mark as Complete'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonView;
