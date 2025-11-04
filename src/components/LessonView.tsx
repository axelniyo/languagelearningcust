
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { apiGet } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from './seo/Seo';
import { generateSeoConfig } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


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

// Exercise interfaces for interactive exercises
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

// Original Exercise interface for API data
interface Exercise {
  id: string;
  exercise_type: string;
  question: string;
  correct_answer: string;
  options?: string[];
  explanation?: string;
}

// Type guard for exercises content
const isExercisesContent = (content: any): content is { exercises: Exercise[] } => {
  return content && Array.isArray(content.exercises);
};

// Type guard for array of LessonContent
const isLessonContentArray = (content: any): content is LessonContent[] => {
  return Array.isArray(content);
};

// Helper function to extract string from object or return as is
const extractString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value);
    if (values.length > 0 && typeof values[0] === 'string') {
      return values[0];
    }
    return JSON.stringify(value);
  }
  return String(value);
};

// Helper function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to get language-specific wrong options
const getLanguageSpecificWrongOptions = (language: string, excludeText: string, count: number = 3): string[] => {
  const languageOptions: Record<string, string[]> = {
    'spanish': [
      'Hola', 'Adiós', 'Por favor', 'De nada', 'Lo siento', 'Buenos días', 
      'Buenas tardes', 'Buenas noches', 'Gracias', 'Perdón', '¿Cómo estás?',
      'Mucho gusto', 'Hasta luego', '¿Qué tal?', 'Bien', 'Mal', 'Regular'
    ],
    'japanese': [
      'こんにちは', 'さようなら', 'お願いします', 'ありがとう', 'すみません', 'おはようございます',
      'こんばんは', 'おやすみなさい', 'はい', 'いいえ', 'お元気ですか', 'はじめまして',
      'またね', '大丈夫です', 'もちろん', 'すごい', '分かりません'
    ],
    'german': [
      'Hallo', 'Auf Wiedersehen', 'Bitte', 'Danke', 'Entschuldigung', 'Guten Morgen',
      'Guten Tag', 'Guten Abend', 'Gute Nacht', 'Ja', 'Nein', 'Vielleicht',
      'Wie geht es dir?', 'Es freut mich', 'Tschüss', 'Bis bald', 'Alles klar'
    ],
    'french': [
      'Bonjour', 'Au revoir', 'S\'il vous plaît', 'Merci', 'Excusez-moi', 'Bonne nuit',
      'Bonsoir', 'De rien', 'Pardon', 'Comment ça va?', 'Enchanté', 'À bientôt',
      'Ça va?', 'Bien', 'Mal', 'Comme ci comme ça', 'Comment vous appelez-vous?'
    ],
    'english': [
      'Hello', 'Goodbye', 'Please', 'Thank you', 'Sorry', 'Good morning',
      'Good afternoon', 'Good evening', 'Good night', 'Yes', 'No', 'Maybe',
      'How are you?', 'Nice to meet you', 'See you later', 'Okay', 'Of course'
    ]
  };

  // Convert language to lowercase and handle variations
  const langKey = language.toLowerCase();
  const options = languageOptions[langKey] || languageOptions.english;
  
  // Filter out the correct answer and empty options, then shuffle and select the requested number
  const filteredOptions = options.filter(option => 
    option && option !== excludeText && option.length > 0
  );
  
  return shuffleArray(filteredOptions).slice(0, count);
};
  
export function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user, userXP, updateUserProgress } = useAuth(); // userXP and updateUserProgress
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
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const BASE_URL = 'https://languagelearningcustbac.onrender.com';

  const handleExerciseResponse = (exerciseId: string, response: any) => {
    setExerciseResponses(prev => ({
      ...prev,
      [exerciseId]: response
    }));
  };

  const toggleFeedback = (exerciseId: string) => {
    setShowFeedback(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const isAnswerCorrect = (exercise: InteractiveExercise, response: any): boolean => {
    if (!response) return false;
    
    const selectedOption = exercise.options.find(
      opt => opt.id === response.selectedOptionId
    );
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

        console.log('API Response:', response);

        // ✅ Check if user has already completed this lesson
        if (user?.id) {
          try {
           const progressResponse = await apiGet(`${BASE_URL}/api/lessons/progress/lesson/${user.id}/${lessonId}`);
            console.log('Completion status:', progressResponse);
            if (progressResponse.completed) {
              setIsCompleted(true);
              setEarnedXP(response.xp_reward || 20);
              console.log('Lesson already completed, setting state');
            }
          } catch (progressError) {
            console.error('Error checking lesson completion:', progressError);
          }
        }

        // Load exercises if lesson type is exercises
        if (response.lesson_type === 'exercises') {
          try {
            console.log('[LessonView] Fetching exercises from API...');
            const exercisesResponse = await fetch(`${BASE_URL}/api/exercises?lesson_id=${lessonId}`);
            if (exercisesResponse.ok) {
              let data = await exercisesResponse.json();
              console.log('[LessonView][DEBUG] Raw exercises response:', data);
              
              // Filter exercises for this lesson
              const filteredData = (data || []).filter((v: any) =>
                String(v.lesson_id) === String(lessonId) ||
                Number(v.lesson_id) === Number(lessonId)
              );
              console.log('[LessonView][DEBUG] Filtered exercises:', filteredData);
              
              if (filteredData.length > 0) {
                // Detect language from URL
// Update the language detection to include Japanese
let language = 'english'; // default
const path = location.pathname.toLowerCase();

if (path.includes('japanese') || path.includes('japan') || path.includes('jp') || path.includes('日本語')) {
  language = 'japanese';
} else if (path.includes('german') || path.includes('deutsch') || path.includes('de')) {
  language = 'german';
} else if (path.includes('french') || path.includes('français') || path.includes('fr')) {
  language = 'french';
} else if (path.includes('spanish') || path.includes('español') || path.includes('es')) {
  language = 'spanish';
}
                // Convert API exercises to interactive exercise format
                const convertedExercises = filteredData.map((item: any, index: number) => {
                  const question = extractString(item.question);
                  const correctAnswer = extractString(item.correct_answer);
                  
                  // Get language-specific wrong options
                  const wrongOptions = getLanguageSpecificWrongOptions(language, correctAnswer, 3);

                  console.log(`[LessonView] Exercise ${index} - Language: ${language}, Correct: "${correctAnswer}", Wrong options:`, wrongOptions);

                  // Create interactive multiple choice exercise
                  const interactiveExercise: InteractiveExercise = {
                    id: item.id || `ex-${index}`,
                    type: 'multiple_choice',
                    question: question,
                    points: 10,
                    explanation: item.explanation ? extractString(item.explanation) : undefined,
                    options: []
                  };

                  // Add the correct answer
                  interactiveExercise.options.push({
                    id: `correct-${index}`,
                    text: correctAnswer,
                    isCorrect: true
                  });

                  // Add wrong options
                  wrongOptions.forEach((wrongOption, wrongIndex) => {
                    interactiveExercise.options.push({
                      id: `wrong-${index}-${wrongIndex}`,
                      text: wrongOption,
                      isCorrect: false
                    });
                  });

                  // Shuffle options
                  interactiveExercise.options = shuffleArray(interactiveExercise.options);

                  return interactiveExercise;
                });

                setInteractiveExercises(convertedExercises);
                console.log('[LessonView] Converted interactive exercises:', convertedExercises);
              } else {
                console.log('[LessonView] No exercises found for this lesson');
                setInteractiveExercises([]);
              }
            } else {
              console.log('[LessonView] Exercises API response not OK:', exercisesResponse.status);
              setInteractiveExercises([]);
            }
          } catch (error) {
            console.error('Error loading exercises:', error);
            setInteractiveExercises([]);
          }
        }

        // Set lesson data
        setLesson(response);
        
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [lessonId, location.pathname, user?.id]); 
  
  const handleCompleteLesson = async () => {
  if (!user || !lessonId) return;
  
  try {
    setSubmitting(true);
    
    // Mark lesson as complete
        const result = await api.markLessonCompleted(lessonId, user.id);
      if (result.success) {
        setIsCompleted(true);
        
        // ✅ Show immediate XP feedback
        const xpReward = lesson?.xp_reward || 20;
        setEarnedXP(xpReward);
        
        console.log(`Lesson marked as completed - earned ${xpReward} XP`);
        
        // Show success message
        toast.success(`Lesson completed! +${xpReward} XP earned!`);
        
        // ✅ UPDATE GLOBAL USER XP
        const newTotalXP = userXP + xpReward;
        const newLevel = Math.floor(newTotalXP / 100) + 1; // Level up every 100 XP
        updateUserProgress(newTotalXP, newLevel);
        
        console.log(`Updated global XP: ${userXP} + ${xpReward} = ${newTotalXP}, Level: ${newLevel}`);
        
        if (lesson?.course?.id) {
          // Optional: Add a small delay to show the XP message
          setTimeout(() => {
            navigate(`/course/${lesson.course.id}`);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setSubmitting(false);
    }
  };
    
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Seo {...generateSeoConfig('loading', { title: 'Loading...' })} />
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="mt-8">
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Seo {...generateSeoConfig('error', { title: 'Error' })} />
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Error Loading Lesson</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }
  
  if (!lesson) {
    return (
      <div className="container mx-auto p-4">
        <Seo {...generateSeoConfig('not_found', { title: 'Lesson Not Found' })} />
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
          <p className="mb-4">The requested lesson could not be found.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }
  
  const seoConfig = generateSeoConfig('lesson', {
    title: lesson.name,
    description: lesson.description,
    type: 'article',
    publishedTime: lesson.created_at,
    modifiedTime: lesson.updated_at,
    section: lesson.course?.language?.name,
    tags: [lesson.lesson_type],
  });

  return (
    <div className="container mx-auto p-4">
      <Seo {...seoConfig} />
      
      <div className="mb-8">
        {lesson.course && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button 
              onClick={() => lesson.course?.id && navigate(`/course/${lesson.course.id}`)}
              className="hover:text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>←</span>
              <span>Back to {lesson.course.name}</span>
            </button>
          </div>
        )}
        
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{lesson.name}</h1>
            {lesson.course?.language?.flag_emoji && (
              <span className="text-2xl">{lesson.course.language.flag_emoji}</span>
            )}
          </div>
          
               {isCompleted ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Completed
              </span>
              {earnedXP > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  +{earnedXP} XP
                </span>
              )}
            </div>
          ) : null}
        </div>
          
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>
          
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : lesson.lesson_type === 'exercises' ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Practice Exercises</h3>
                {lesson.content && !Array.isArray(lesson.content) && (
                  <div className="prose max-w-none mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      {lesson.content.instructions || 'Complete the following exercises to practice what you\'ve learned.'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                {interactiveExercises.length > 0 ? (
                  interactiveExercises.map((exercise, index) => (
                    <Card key={exercise.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-medium">Exercise {index + 1}</h4>
                        <span className="text-sm text-gray-500">{exercise.points} points</span>
                      </div>
                      
                      <p className="mb-4">{exercise.question}</p>
                      
                      <div className="space-y-2">
                        {exercise.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <input
                              type="radio"
                              id={`option-${option.id}`}
                              name={`question-${exercise.id}`}
                              className="h-4 w-4 text-blue-600"
                              onChange={() => handleExerciseResponse(exercise.id, { selectedOptionId: option.id })}
                            />
                            <label htmlFor={`option-${option.id}`} className="flex-1">
                              {option.text}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleFeedback(exercise.id)}
                        >
                          {showFeedback[exercise.id] ? 'Hide Feedback' : 'Show Feedback'}
                        </Button>
                        
                        {showFeedback[exercise.id] && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium">
                              {isAnswerCorrect(exercise, exerciseResponses[exercise.id]) 
                                ? '✅ Correct! ' 
                                : '❌ Incorrect. '}
                              {exercise.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <div className="text-yellow-600">
                      <p>No exercises available for this lesson yet.</p>
                      <p className="text-sm mt-2">Check back later for practice exercises.</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ) : Array.isArray(lesson.content) && lesson.content.length > 0 ? (
            lesson.lesson_type === 'vocabulary' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Vocabulary</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lesson.content.map((item) => (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-lg">{item.word}</h4>
                          <p className="text-gray-600">{item.translation}</p>
                          {item.pronunciation && (
                            <p className="text-sm text-gray-500">/ {item.pronunciation} /</p>
                          )}
                          {item.word_type && (
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mt-1">
                              {item.word_type}
                            </span>
                          )}
                        </div>
                        {item.audio_url && (
                          <button 
                            onClick={() => new Audio(item.audio_url).play()}
                            className="p-2 rounded-full hover:bg-gray-100"
                            aria-label="Play pronunciation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 000-7.072m-2.828 9.9a9 9 0 010-12.728" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {item.example_sentence && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm italic">"{item.example_sentence}"</p>
                          {item.example_translation && (
                            <p className="text-xs text-gray-500 mt-1">"{item.example_translation}"</p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ) : lesson.lesson_type === 'phrases' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Common Phrases</h3>
                <div className="space-y-4">
                  {lesson.content.map((item) => (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg">{item.phrase}</p>
                          <p className="text-gray-600">{item.translation}</p>
                          {item.pronunciation && (
                            <p className="text-sm text-gray-500 mt-1">/ {item.pronunciation} /</p>
                          )}
                        </div>
                        {item.audio_url && (
                          <button 
                            onClick={() => new Audio(item.audio_url).play()}
                            className="p-2 rounded-full hover:bg-gray-100"
                            aria-label="Play pronunciation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 000-7.072m-2.828 9.9a9 9 0 010-12.728" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {item.context && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Context: {item.context}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ) : lesson.lesson_type === 'grammar' ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Grammar Rules</h3>
                <div className="space-y-6">
                  {lesson.content.map((item) => (
                    <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-medium mb-3">{item.title}</h4>
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: item.explanation }} />
                        
                        {item.examples && item.examples.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h5 className="font-medium">Examples:</h5>
                            <ul className="space-y-2">
                              {item.examples.map((example: any, index: number) => (
                                <li key={index} className="pl-4 border-l-4 border-blue-100">
                                  <p className="font-medium">{example.sentence}</p>
                                  <p className="text-gray-600 text-sm">{example.translation}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p>This lesson type is not yet supported.</p>
              </div>
            )
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No content available for this lesson yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!isCompleted && user && (
          <div className="mt-8">
            <Button 
              size="lg" 
              onClick={handleCompleteLesson}
              disabled={submitting}
            >
              {submitting ? 'Marking as Complete...' : 'Mark as Complete'}
            </Button>
          </div>
        )}
        
        {!user && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="mb-4">Sign in to track your progress and earn XP!</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonView;
