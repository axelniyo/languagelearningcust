import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { api, type Course, type Unit, type Language } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from './seo/Seo';
import { generateSeoConfig } from '@/utils/seoUtils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingState } from './course/LoadingState';
import { CourseNotFound } from './course/CourseNotFound';
import { CourseHeader } from './course/CourseHeader';
import { ProgressOverview } from './course/ProgressOverview';
import { UnitCard } from './course/UnitCard';
import { EmptyState } from './course/EmptyState';

// Debug: Test if console is available and create fallback if needed
if (typeof console === 'undefined' || typeof console.log !== 'function') {
  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-console';
  debugDiv.style.position = 'fixed';
  debugDiv.style.bottom = '0';
  debugDiv.style.left = '0';
  debugDiv.style.background = 'rgba(0,0,0,0.8)';
  debugDiv.style.color = 'white';
  debugDiv.style.padding = '10px';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.width = '100%';
  debugDiv.style.maxHeight = '200px';
  debugDiv.style.overflow = 'auto';
  debugDiv.style.fontFamily = 'monospace';
  debugDiv.style.fontSize = '12px';
  document.body.appendChild(debugDiv);
  
  // Create a partial implementation of the Console interface
  const customConsole: Partial<Console> = {
    log: (message?: any, ...optionalParams: any[]) => {
      const div = document.createElement('div');
      div.textContent = `[LOG] ${message} ${optionalParams.join(' ')}`;
      debugDiv.appendChild(div);
      debugDiv.scrollTop = debugDiv.scrollHeight;
    },
    warn: (message?: any, ...optionalParams: any[]) => {
      const div = document.createElement('div');
      div.textContent = `[WARN] ${message} ${optionalParams.join(' ')}`;
      div.style.color = 'orange';
      debugDiv.appendChild(div);
      debugDiv.scrollTop = debugDiv.scrollHeight;
    },
    error: (message?: any, ...optionalParams: any[]) => {
      const div = document.createElement('div');
      div.textContent = `[ERROR] ${message} ${optionalParams.join(' ')}`;
      div.style.color = 'red';
      debugDiv.appendChild(div);
      debugDiv.scrollTop = debugDiv.scrollHeight;
    },
    info: (message?: any, ...optionalParams: any[]) => {
      const div = document.createElement('div');
      div.textContent = `[INFO] ${message} ${optionalParams.join(' ')}`;
      div.style.color = 'lightblue';
      debugDiv.appendChild(div);
      debugDiv.scrollTop = debugDiv.scrollHeight;
    },
    debug: (message?: any, ...optionalParams: any[]) => {
      const div = document.createElement('div');
      div.textContent = `[DEBUG] ${message} ${optionalParams.join(' ')}`;
      div.style.color = 'lightgreen';
      debugDiv.appendChild(div);
      debugDiv.scrollTop = debugDiv.scrollHeight;
    },
    // Add other console methods as no-ops to satisfy the interface
    assert: () => {},
    clear: () => { debugDiv.innerHTML = ''; },
    count: () => 0,
    countReset: () => {},
    dir: () => {},
    dirxml: () => {},
    group: () => {},
    groupCollapsed: () => {},
    groupEnd: () => {},
    table: () => {},
    time: () => {},
    timeEnd: () => {},
    timeLog: () => {},
    timeStamp: () => {},
    trace: () => {},
  };

  // Merge with the existing console to maintain any existing methods
  window.console = {
    ...window.console,
    ...customConsole
  } as Console;
}

// Test logging immediately
console.log('Initial console test - CourseLearning.tsx loading');
console.warn('This is a test warning');
console.error('This is a test error');
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
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseWithDates | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{total: number; completed: number; xp: number} | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [apiAvailable, setApiAvailable] = useState(true);

  // Clean up the language parameter to remove any 'learn-' prefix if present
  const cleanLanguage = language ? language.replace(/^learn-?/i, '') : '';

  // Clean up the language name for display and API calls
  const normalizedLanguage = cleanLanguage ? cleanLanguage.toLowerCase() : '';

  // Check if API is available
  const checkApiAvailability = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://languagelearningcustbac.onrender.com'}/health`);
      return response.ok;
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
        // Fetch course data
        const courses = await api.getCourses();
        
        // Find course by language name or ID
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

        // Fetch units for the course using the correct method
        const unitsData = await api.getCourseUnits(courseData.id);
        
        // Fetch user progress if logged in
        let userProgress = null;
        let lessonsCompleted = {};
        
        if (user) {
          try {
            // Use the correct method name for getting course progress
            userProgress = await api.getCourseProgress(user.id, courseData.id);
            lessonsCompleted = await loadCompletedLessons(courseData.id);
          } catch (error) {
            console.error('Error fetching user progress:', error);
            // Continue without progress data if there's an error
          }
        }

        if (isMounted) {
          setCourse(courseData);
          setUnits(unitsData);
          setProgress(userProgress);
          setCompletedLessons(lessonsCompleted);
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
  }, [language, user]);

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
          <h1 className="2xl font-bold text-red-600 mb-4">Error Loading Course</h1>
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
                <strong>Note:</strong> The learning service appears to be offline. Please make sure your backend server is running at {import.meta.env.VITE_API_URL || 'https://languagelearningcustbac.onrender.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generate SEO config with course data
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

        <ProgressOverview />

        {/* Display all units in a vertical list, expanded */}
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
      <button 
        onClick={() => {
          console.log('=== TEST BUTTON CLICKED ===');
          console.log('Current state:', { 
            language, 
            loading, 
            error,
            hasCourse: !!course,
            unitsCount: units?.length || 0 
          });
          console.log('Window.console test:', window.console !== undefined);
          alert('Check the console for debug information!');
        }}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '10px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Test Console
      </button>
    </div>
  );
}

// Helper function to normalize language names for comparison
const normalizeLanguageName = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase().trim();
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`Attempt ${3 - retries + 1} failed:`, error);
    if (retries <= 0) {
      throw new Error(`Failed after ${3} attempts: ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000 * (3 - retries + 1)));
    return fetchWithRetry(fn, retries - 1);
  }
};

const loadCompletedLessons = async (courseId: string) => {
  if (!courseId) return;
  try {
    const unitsData = await api.getCourseUnits(courseId);
    const allLessons = unitsData.flatMap((unit: Unit) => unit.lessons);
    const completedLessonsMap: Record<string, boolean> = {};
    for (const lesson of allLessons) {
      try {
        const res = await fetch(`https://languagelearningcustbac.onrender.com/lessons/progress/lesson/${lesson.id}`);
        if (res.ok) {
          const d = await res.json();
          if (d.completed) completedLessonsMap[lesson.id] = true;
        }
      } catch (e) {
        // Fail silently
      }
    }
    return completedLessonsMap;
  } catch (e) {
    return {};
  }
};
