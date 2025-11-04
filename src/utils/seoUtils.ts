import { SeoProps } from '@/components/seo/Seo';

interface SeoConfigParams {
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
  language?: string | { name: string; code: string };
  canonicalUrl?: string;
  additionalKeywords?: string[];
}

export const generateSeoConfig = (
  pageType: string, 
  params: SeoConfigParams = {}
): SeoProps => {
  const siteName = 'Language Mentor';
const siteUrl = import.meta.env.VITE_APP_SITE_URL || 'https://languagementor.site';
  const defaultImage = `${siteUrl}/images/og-default.jpg`;
  
  // Process keywords - combine additionalKeywords with existing ones if any
  const baseKeywords = Array.isArray(params.keywords) 
    ? params.keywords 
    : typeof params.keywords === 'string' 
      ? [params.keywords] 
      : [];
      
  const additionalKeywords = params.additionalKeywords || [];
  const allKeywords = [...new Set([...baseKeywords, ...additionalKeywords])];
  
  // Process language - handle both string and object cases
  const languageName = typeof params.language === 'string' 
    ? params.language 
    : params.language?.name || '';
  
  // Default values
  const defaults: SeoProps = {
    title: siteName,
    description: 'Learn new languages through interactive courses and exercises.',
    keywords: allKeywords.length > 0 ? allKeywords : ['language learning', 'online courses', 'language exercises'],
    image: defaultImage,
    type: 'website',
  };

  // Page-specific configurations
  const pageConfigs: Record<string, Partial<SeoProps>> = {
    home: {
      title: siteName,
      description: 'Start your language learning journey with our interactive courses and lessons.',
    },
    // Add more page-specific configurations as needed
  };

  // Merge all configurations
  const config = {
    ...defaults,
    ...(pageConfigs[pageType] || {}),
    ...params,
  };

  // Generate canonical URL
  const canonical = params.canonicalUrl || `${siteUrl}${pageType === 'home' ? '' : `/${pageType}`}`;

  // Generate Open Graph tags
  const ogTags = {
    'og:title': config.title || siteName,
    'og:description': config.description || defaults.description,
    'og:type': config.type,
    'og:url': canonical,
    'og:image': config.image || defaultImage,
    'og:site_name': siteName,
    ...(config.type === 'article' && config.publishedTime ? { 'article:published_time': config.publishedTime } : {}),
    ...(config.type === 'article' && config.modifiedTime ? { 'article:modified_time': config.modifiedTime } : {}),
    ...(config.type === 'article' && config.author ? { 'article:author': config.author } : {}),
    ...(config.type === 'article' && config.section ? { 'article:section': config.section } : {}),
    ...(config.type === 'article' && config.tags ? { 'article:tag': config.tags } : {}),
  };

  // Generate Twitter Card tags
  const twitterTags = {
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title || siteName,
    'twitter:description': config.description || defaults.description,
    'twitter:image': config.image || defaultImage,
  };

  return {
    title: config.title || siteName,
    description: config.description || defaults.description,
    keywords: Array.isArray(config.keywords) ? config.keywords.join(', ') : config.keywords || '',
    canonicalUrl: canonical,
    image: config.image || defaultImage,
    type: config.type,
    publishedTime: config.publishedTime,
    modifiedTime: config.modifiedTime,
    author: config.author,
    section: config.section,
    tags: config.tags,
    children: config.children
  };
};

// Helper function to generate breadcrumb schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// Helper function to generate FAQ schema
export const generateFaqSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};
