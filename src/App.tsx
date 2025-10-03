import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { HomePage } from "@/components/HomePage";
import { AuthModal } from "@/components/AuthModal";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CourseLearning } from "@/components/CourseLearning";
import { LessonView } from "@/components/LessonView";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { useState, useEffect } from "react";
import NotFound from "./pages/NotFound";
import LessonProgressDebugger from "@/pages/debug/LessonProgressDebugger";
import { 
  ExercisesPage, 
  GrammarPage, 
  LanguagesPage, 
  PhrasesPage, 
  UnitsPage 
} from "./pages/SeoPage";
import { apiGet } from './utils/api';

const queryClient = new QueryClient();

const CourseLearningWrapper = () => {
  const { language } = useParams<{ language: string }>();
  const cleanLanguage = language ? language.replace(/[^\w-]/g, '') : '';
  if (!cleanLanguage) return <Navigate to="/" replace />;
  console.log('CourseLearningWrapper - language:', cleanLanguage);
  return <CourseLearning language={cleanLanguage} />;
};

const App = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  useEffect(() => {
    // Example API call
    const checkRoute = async () => {
      try {
        const data = await apiGet('/api/check-route');
        console.log('API Response:', data);
      } catch (error) {
        console.error('API Error:', error);
      }
    }; 

    checkRoute();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Header openAuthModal={openAuthModal} />
              <Routes>
               <Route path="/" element={<HomePage openAuthModal={openAuthModal} />} />
              <Route path="/courses" element={<HomePage openAuthModal={openAuthModal} />} />
              <Route path="/learn/:language" element={<CourseLearningWrapper />} />
              <Route path="/:language-lesson/:lessonId" element={<LessonView />} />

                {/* SEO Optimized Pages */}
                <Route path="/exercises" element={<ExercisesPage />} />
                <Route path="/grammar" element={<GrammarPage />} />
                <Route path="/languages" element={<LanguagesPage />} />
                <Route path="/phrases" element={<PhrasesPage />} />
                <Route path="/units" element={<UnitsPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                
                {/* Auth Routes */}
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                
                {/* Debug Routes */}
                <Route path="/debug/lesson-progress" element={<LessonProgressDebugger />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <AuthModal 
                isOpen={authModal.isOpen}
                onClose={closeAuthModal}
                mode={authModal.mode}
              />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
