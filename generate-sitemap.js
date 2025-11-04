import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://languagementor.site';
const currentDate = new Date().toISOString().split('T')[0];

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/learn/german', priority: '0.9', changefreq: 'weekly' },
  { loc: '/learn/japanese', priority: '0.9', changefreq: 'weekly' },
  { loc: '/learn/spanish', priority: '0.9', changefreq: 'weekly' },
  { loc: '/learn/french', priority: '0.8', changefreq: 'monthly' },
  { loc: '/learn/italian', priority: '0.8', changefreq: 'monthly' },
  // Your actual lesson URLs
  { loc: '/german-lesson/1', priority: '0.7', changefreq: 'monthly' },
  { loc: '/german-lesson/2', priority: '0.7', changefreq: 'monthly' },
  { loc: '/japanese-lesson/1', priority: '0.7', changefreq: 'monthly' },
  { loc: '/japanese-lesson/2049', priority: '0.7', changefreq: 'monthly' },
  { loc: '/spanish-lesson/1', priority: '0.7', changefreq: 'monthly' },
  { loc: '/spanish-lesson/2', priority: '0.7', changefreq: 'monthly' },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);
console.log('✅ Sitemap generated at:', sitemapPath);