import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  language: string;
  onReturnHome: () => void;
}

export function EmptyState({ language, onReturnHome }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No content available</h3>
      <p className="text-gray-600 mb-6">
        The {language} course doesn't have any units yet. Please check back later or contact support.
      </p>
      <Button 
        onClick={onReturnHome} 
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Return to Dashboard
      </Button>
    </div>
  );
}
