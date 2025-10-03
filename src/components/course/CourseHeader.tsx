import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Course } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface CourseHeaderProps {
  course: Course & {
    language?: {
      name: string;
      flag_emoji: string;
    };
  };
  language: string;
  onBack: () => void;
}

export function CourseHeader({ course, language, onBack }: CourseHeaderProps) {
  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">
          {course.language?.flag_emoji || '🌐'}
        </span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {course.name || `Learn ${language.charAt(0).toUpperCase() + language.slice(1)}`}
          </h1>
          {course.language?.name && (
            <p className="text-gray-600">{course.language.name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
