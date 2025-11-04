import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { SSRContext } from './SSRContext';

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  canonicalUrl?: string;
  children?: React.ReactNode;
  openGraph?: Record<string, string>;
  twitter?: Record<string, string>;
  additionalMetaTags?: Array<{ name: string; content: string }>;
}

export const Seo = ({
  title = 'Language Mentor',
  description = 'Learn new languages through interactive courses, exercises, and lessons.',
  keywords = ['language learning', 'online courses', 'language exercises'],
  image = '/images/og-image.jpg',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  canonicalUrl,
  children,
  openGraph = {},
  twitter = {},
  additionalMetaTags = []
}: SeoProps) => {
  const location = useLocation();
  const { isSSR } = useContext(SSRContext);

  // Get the full canonical URL
  const fullCanonicalUrl = canonicalUrl 
    ? new URL(canonicalUrl, window.location.origin).toString()
    : window.location.href;

  // Default OpenGraph tags
  const defaultOpenGraph = {
    'og:title': title,
    'og:description': description,
    'og:type': type,
    'og:image': image,
    'og:url': fullCanonicalUrl,
    'og:site_name': 'Language Learning Platform',
    ...(type === 'article' && publishedTime && { 'article:published_time': publishedTime }),
    ...(type === 'article' && modifiedTime && { 'article:modified_time': modifiedTime }),
    ...(type === 'article' && author && { 'article:author': author }),
    ...(type === 'article' && section && { 'article:section': section }),
    ...(type === 'article' && tags.length > 0 && { 'article:tag': tags.join(', ') }),
    ...openGraph
  };

  // Default Twitter Card tags
  const defaultTwitter = {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    ...twitter
  };

  // Combine all meta tags
  const metaTags = [
    // Standard meta tags
    { name: 'description', content: description },
    { name: 'keywords', content: Array.isArray(keywords) ? keywords.join(', ') : keywords },
    
    // OpenGraph meta tags
    ...Object.entries(defaultOpenGraph).map(([property, content]) => ({
      property,
      content: typeof content === 'string' ? content : JSON.stringify(content)
    })),
    
    // Twitter Card meta tags
    ...Object.entries(defaultTwitter).map(([name, content]) => ({
      name: name.replace('twitter:', 'twitter:'),
      content: typeof content === 'string' ? content : JSON.stringify(content)
    })),
    
    // Additional meta tags
    ...additionalMetaTags
  ];

  // Add viewport meta tag if not already present
  if (!additionalMetaTags.some(tag => tag.name === 'viewport')) {
    metaTags.push({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    });
  }

  // Add theme-color meta tag if not already present
  if (!additionalMetaTags.some(tag => tag.name === 'theme-color')) {
    metaTags.push({
      name: 'theme-color',
      content: '#ffffff'
    });
  }

  // Add language meta tag if not already present
  if (!additionalMetaTags.some(tag => tag.name === 'language')) {
    const language = typeof window !== 'undefined' ? window.navigator.language : 'en';
    metaTags.push({
      name: 'language',
      content: language
    });
  }

  return (
    <Helmet>
      <title>{title}</title>
      {canonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
      {children}
    </Helmet>
  );
};

export default Seo;