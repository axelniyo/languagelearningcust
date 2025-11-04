import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { generateSeoConfig } from '@/utils/seoUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';

interface SeoPageProps {
  pageType: 'exercises' | 'grammar' | 'languages' | 'phrases' | 'units';
  title?: string;
  description?: string;
  children?: React.ReactNode;
  data?: any;
  loading?: boolean;
}

export function SeoPage({
  pageType,
  title,
  description,
  children,
  data,
  loading = false,
}: SeoPageProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const id = pathSegments[pathSegments.length - 1];
  
  // Generate SEO configuration
  const seoConfig = generateSeoConfig(pageType, {
    title,
    description,
    ...(data || {})
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Seo {...seoConfig} />
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <div className="grid gap-4 mt-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Seo {...seoConfig} />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {title || seoConfig.title}
          </CardTitle>
          <p className="text-muted-foreground">
            {description || seoConfig.description}
          </p>
        </CardHeader>
        <CardContent>
          {children || (
            <div className="prose max-w-none">
              <p>Content for {pageType} page will be displayed here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Individual page components
export function ExercisesPage() {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    // Fetch exercises data
    const fetchData = async () => {
      try {
        // Replace with actual API call
        // const data = await api.getExercises();
        // setExercises(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading exercises:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SeoPage 
      pageType="exercises"
      title="Language Exercises"
      description="Practice and improve your language skills with our interactive exercises."
      loading={loading}
    >
      <div className="grid gap-4">
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <h3 className="text-xl font-semibold">{exercise.title}</h3>
              </CardHeader>
              <CardContent>
                <p>{exercise.description}</p>
                {/* Add exercise content here */}
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No exercises available at the moment.</p>
        )}
      </div>
    </SeoPage>
  );
}

// Similar components for other page types
export function GrammarPage() {
  return (
    <SeoPage 
      pageType="grammar"
      title="Grammar Guides"
      description="Comprehensive grammar guides and explanations for language learners."
    />
  );
}

export function LanguagesPage() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await api.getLanguages();
        setLanguages(data);
      } catch (error) {
        console.error('Error loading languages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return (
    <SeoPage 
      pageType="languages"
      title="Available Languages"
      description="Choose from our selection of languages and start your learning journey today."
      loading={loading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language) => (
          <Card key={language.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag_emoji}</span>
                <h3 className="text-xl font-semibold">{language.name}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{language.code.toUpperCase()}</p>
              {/* Add more language details here */}
            </CardContent>
          </Card>
        ))}
      </div>
    </SeoPage>
  );
}

export function PhrasesPage() {
  return (
    <SeoPage 
      pageType="phrases"
      title="Common Phrases"
      description="Learn common phrases and expressions in different languages."
    />
  );
}

export function UnitsPage() {
  return (
    <SeoPage 
      pageType="units"
      title="Course Units"
      description="Explore the units in our language courses."
    />
  );
}
