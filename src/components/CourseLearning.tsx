import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Course, type Unit } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from './seo/Seo';
import { generateSeoConfig } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { CourseHeader } from './course/CourseHeader';
import { ProgressOverview } from './course/ProgressOverview';
import { UnitCard } from './course/UnitCard';
import { EmptyState } from './course/EmptyState';

interface CourseLearningProps {
  language: string;
}
interface CourseWithDates extends Omit<Course, 'created_at' | 'updated_at'> {
  created_at?: string;
  updated_at?: string;
  thumbnail_url?: string;
}

export function CourseLearning({ language }: CourseLearningProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseWithDates | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{total: number; completed: number; xp: number} | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [apiAvailable, setApiAvailable] = useState(true);

  const normalizedLanguage = language ? language.toLowerCase().replace(/^learn-?/i, '') : '';

  const checkApiAvailability = async () => {
    try {
      await api.getLanguages();
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      if (!language) {
        if (isMounted) {
          setError('No language specified');
          setLoading(false);
        }
        return;
      }

      const apiIsAvailable = await checkApiAvailability();
      if (!apiIsAvailable) {
        if (isMounted) {
          setApiAvailable(false);
          setError('The learning service is currently unavailable. Please try again later.');
          setLoading(false);
        }
        return;
      }

      try {
        const courses = await api.getCourses();
        
        const courseData = courses.find(
          (c: Course) => {
            const courseLanguage = c.language && typeof c.language === 'object' && 'name' in c.language 
              ? c.language.name 
              : String(c.language || '');
              
            return courseLanguage.toLowerCase() === normalizedLanguage.toLowerCase() ||
                   c.id.toLowerCase() === normalizedLanguage.toLowerCase();
          }
        );

        if (!courseData) {
          throw new Error(`No course found for language: ${language}`);
        }

        const unitsData = await api.getCourseUnits(courseData.id);
        
        let userProgress = null;
        
        if (user) {
          try {
            userProgress = await api.getCourseProgress(user.id, courseData.id);
          } catch (error) {
            console.error('Error fetching user progress:', error);
          }
        }

        if (isMounted) {
          setCourse(courseData);
          setUnits(unitsData);
          setProgress(userProgress);
          // We can derive completed lessons from the progress if the API provides it,
          // otherwise this needs a dedicated endpoint. For now, we'll rely on the overall progress.
          setCompletedLessons({});
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing course:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load course');
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [language, user, normalizedLanguage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading course content for {language}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Course</h1>
          <p className="mb-6">{error}</p>
          <div className="flex space-x-4">
            <Button onClick={() => window.location.reload()} variant="default">
              Try Again
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Return Home
            </Button>
          </div>
          {!apiAvailable && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-yellow-700">
                <strong>Note:</strong> The learning service appears to be offline. Please make sure your backend server is running.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const seoConfig = generateSeoConfig('course', {
    title: course?.name,
    description: course?.description,
    language: course?.language?.name || '',
    image: course?.thumbnail_url,
    additionalKeywords: [course?.language?.name || '']
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo 
        {...seoConfig}
        type="article"
        publishedTime={course?.created_at}
        modifiedTime={course?.updated_at}
        section={course?.language?.name || ''}
        tags={[course?.language?.name || '', 'language learning']}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseHeader
          course={course}
          language={language || ''}
          onBack={() => navigate('/')}
        />

        <ProgressOverview progress={progress} />

        <div className="space-y-8">
          {units.length > 0 ? (
            units
              .sort((a, b) => a.order_index - b.order_index)
              .map(unit => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onStartLesson={(lessonId) => navigate(`/${language}-lesson/${lessonId}`)}
                  completedLessons={completedLessons}
                />
              ))
          ) : (
            <EmptyState 
              language={course?.language?.name || language || 'this language'} 
              onReturnHome={() => navigate('/')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
