// Only disable console logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// API service for connecting to Node.js backend with XAMPP MariaDB
const BASE_URL = import.meta.env.VITE_API_URL || 'https://languagelearningcustbac.onrender.com/api';

interface Language {
  id: string;
  name: string;
  code: string;
  flag_emoji: string;
  description: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  language: Language;
}

interface Lesson {
  id: string;
  name: string;
  description: string;
  lesson_type: 'vocabulary' | 'phrases' | 'grammar' | 'exercises';
  order_index: number;
  xp_reward: number;
  created_at?: string;
  updated_at?: string;
  unit_name?: string;
  course_name?: string;
  course_id?: string;
  content?: Array<{
    id: string;
    [key: string]: any;
  }>;
}

interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  xp_reward: number;
  lessons: Lesson[];
}

// Helper function to log API calls
const logApiCall = (endpoint: string, params: Record<string, any> = {}) => {
  console.log(`API Call: ${endpoint}`, { params });
};

// Helper function to handle responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text();
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error: errorData
    });
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

// API functions - now connecting to real Node.js backend
export const api = {
  // Get all languages
  async getLanguages(): Promise<Language[]> {
    try {
      logApiCall('/languages');
      const response = await fetch(`${BASE_URL}/languages`);
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error in getLanguages:', error);
      throw error;
    }
  },

  

  // Get all courses
  async getCourses(): Promise<Course[]> {
    try {
      logApiCall('/courses');
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${BASE_URL}/courses`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

      
        
        clearTimeout(timeoutId);
        const data: Course[] = await handleResponse(response) as Course[];
        console.log(`API: Fetched ${data.length} courses in ${Date.now() - startTime}ms`);
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('API: getCourses request timed out after 10 seconds');
          throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        throw error;
      }
    } catch (error) {
      console.error('API Error in getCourses:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      });
      throw error;
    }
  },

  // Get course by ID
  async getCourse(courseId: string): Promise<Course | null> {
    try {
      logApiCall(`/courses/${courseId}`, { courseId });
      const response = await fetch(`${BASE_URL}/courses/${courseId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error in getCourse:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  // Get course by language name or ID with fallback
  async getCourseWithFallback(language: string): Promise<Course | null> {
    console.log(`Fetching course for language: ${language}`);
    
    // Try direct course ID first
    let course = await api.getCourse(language);
    
    // If not found, try language name
    if (!course) {
      console.log('Course not found by ID, trying by language name...');
      course = await api.getCourseByLanguage(language);
    }
    
    // If still not found, try with different casing
    if (!course && language !== language.toLowerCase()) {
      console.log('Trying with lowercase...');
      course = await api.getCourse(language.toLowerCase());
    }
    
    if (!course) {
      console.error(`No course found for: ${language}`);
      return null;
    }
    
    console.log('Found course:', course);
    return course;
  },

  // Get course by language name (alternative endpoint)
  async getCourseByLanguage(language: string): Promise<Course | null> {
    try {
      logApiCall(`/courses?language=${language}`, { language });
      const response = await fetch(`${BASE_URL}/courses?language=${encodeURIComponent(language)}`);
      const data = await handleResponse(response);
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('API Error in getCourseByLanguage:', error);
      return null;
    }
  },

  // Get units for a course
  async getCourseUnits(courseId: string): Promise<Unit[]> {
    try {
      logApiCall(`/courses/${courseId}/units`, { courseId });
      const response = await fetch(`${BASE_URL}/courses/${courseId}/units`);
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error in getCourseUnits:', error);
      throw error;
    }
  },

  // Get lesson by ID
  async getLesson(lessonId: string): Promise<Lesson | null> {
    try {
      logApiCall(`/lessons/${lessonId}`, { lessonId });
      const response = await fetch(`${BASE_URL}/lessons/${lessonId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error in getLesson:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  // Enroll in a course (NEW)
  async enrollInCourse(courseId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      logApiCall('/courses/enrollments', { courseId, userId });
      const response = await fetch(`${BASE_URL}/courses/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error in enrollInCourse:', error);
      throw error;
    }
  },

  // Mark a lesson as completed for a user
  async markLessonCompleted(lessonId: string, userId: string): Promise<{ success: boolean }> {
    try {
      logApiCall('/lessons/progress', { lessonId, userId });
      const response = await fetch('https://languagelearningcustbac.onrender.com/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, userId }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error in markLessonCompleted:', error);
      throw error;
    }
  },

  // Get user progress for a course
  async getCourseProgress(userId: string, courseId: string): Promise<{ total:number, completed:number, xp:number }> {
    try {
      logApiCall('/lessons/progress/:userId/:courseId', { userId, courseId });
      const response = await fetch(`${BASE_URL}/lessons/progress/${userId}/${courseId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('API Error in getCourseProgress:', error);
      throw error;
    }
  }
};

export type { Language, Course, Unit, Lesson };
