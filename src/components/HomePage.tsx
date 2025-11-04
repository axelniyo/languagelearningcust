import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Globe, Users, Award } from 'lucide-react';
import { api, type Course, type Language } from '@/services/api';
import { LanguagePreferenceDialog } from '@/components/LanguagePreferenceDialog';
import { translationService } from '@/services/translationService';
import { Seo } from './seo/Seo';
import { generateSeoConfig } from '@/utils/seoUtils';

interface HomePageProps {
  openAuthModal?: (mode: 'signin' | 'signup') => void;
}

export function HomePage({ openAuthModal }: HomePageProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Array<{
    id: string;
    name: string;
    description: string;
    language: { name: string; flag_emoji: string; code: string };
  }>>([]);
  const [languages, setLanguages] = useState<Array<{
    id: string;
    name: string;
    code: string;
    flag_emoji: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  // Generate SEO configuration for the home page
  const seoConfig = generateSeoConfig('home', {
    description: 'Start your language learning journey with our interactive courses and lessons. Learn at your own pace with our comprehensive language learning platform.',
    additionalKeywords: [
      'language learning',
      'online courses',
      'learn languages',
      'interactive lessons',
      'language exercises',
      ...languages.map(lang => `learn ${lang.name}`),
      ...courses.map(course => `${course.language.name} course`)
    ].filter(Boolean) as string[],
    canonicalUrl: import.meta.env.VITE_APP_SITE_URL || 'https://languagementor.site'
  });

  // Retry function for API calls
  const fetchWithRetry = async (apiCall: () => Promise<any>, retryCount = 0): Promise<any> => {
    try {
      return await apiCall();
    } catch (err) {
      if (retryCount < 3) {
        console.log(`API call failed, retrying... (${retryCount + 1}/3)`);
        const delay = 1000 * Math.pow(2, retryCount); // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(apiCall, retryCount + 1);
      }
      throw err;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use retry wrapper for both API calls
      const [coursesData, languagesData] = await Promise.all([
        fetchWithRetry(() => api.getCourses()),
        fetchWithRetry(() => api.getLanguages())
      ]);
      
      setCourses(coursesData);
      setLanguages(languagesData);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // load stored preferred language if there is any
    translationService.loadStoredLanguage();
  }, []);

  const handleStartCourse = (course: { id: string; language: { name: string } }) => {
    // If language is already set, navigate directly, else open dialog
    const lang = translationService.getCurrentLanguage();
    if (lang && lang.code) {
      const languagePath = course.language.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/learn/${languagePath}`);

    } else {
      setPendingCourseId(course.id);
      setShowLangDialog(true);
    }
  };

  const handleLanguageSelect = (languageCode: string, languageName: string) => {
    translationService.setLanguage(languageCode, languageName);
    setShowLangDialog(false);
    if (pendingCourseId) {
      // Find the course to get its language name
      const course = courses.find(c => c.id === pendingCourseId);
      if (course) {
        const languagePath = course.language.name.toLowerCase().replace(/\s+/g, '-');
        navigate(`/learn/${languagePath}`);

      } else {
        // Fallback to course ID if language name is not available
        navigate(`/course/${pendingCourseId}`);
      }
      setPendingCourseId(null);
    }
  };

  const handleLangDialogClose = () => {
    setShowLangDialog(false);
    setPendingCourseId(null);
  };

  const handleChangeLanguage = () => {
    setShowLangDialog(true);
    setPendingCourseId(null); // Not tied to a specific course
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Seo {...seoConfig} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Seo {...generateSeoConfig('error', { title: 'Error' })} />
        <div className="py-10">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={() => {
            setError(null);
            setLoading(true);
            fetchData();
          }}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo 
        {...seoConfig}
        type="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">

        </div>

        {/* NEW: Change Language Button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="duolingoSecondary"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleChangeLanguage}
          >
            <Globe className="w-4 h-4" />
            Change Language
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="flex items-center p-6">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{languages.length}</p>
                <p className="text-gray-600">Languages</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                <p className="text-gray-600">Courses</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Students</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Award className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Badge Level</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{course.language.flag_emoji}</span>
                    <div>
                      <CardTitle className="text-lg">{course.language.name}</CardTitle>
                      <p className="text-sm text-gray-600">{course.language.code.toUpperCase()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <Button 
                    onClick={() => handleStartCourse(course)} 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}

      </div>
      
      {/* Language Preference Popup */}
      <LanguagePreferenceDialog 
        isOpen={showLangDialog}
        onLanguageSelect={handleLanguageSelect}
        onClose={handleLangDialogClose}
      />
    </div>
  );
}
