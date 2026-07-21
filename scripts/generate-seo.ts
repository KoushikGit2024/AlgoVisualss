import fs from 'fs';
import path from 'path';
import ALGODATA from '../src/Pages/algorithms/data/AlgoData';

const DOMAIN = 'https://algovisuals-na1c.onrender.com';

function generateSitemap() {
  const staticRoutes = [
    '/',
    '/algorithms',
  ];

  const dynamicRoutes: string[] = [];

  ALGODATA.forEach((category: any) => {
    if (category.href) {
      dynamicRoutes.push(category.href);
    }
    if (category.items && Array.isArray(category.items)) {
      category.items.forEach((item: any) => {
        if (item.href) {
          dynamicRoutes.push(item.href);
        }
      });
    }
  });

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${DOMAIN}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemapContent;
}

function generateRobots() {
  return `User-agent: *
Allow: /

Host: ${DOMAIN}
Sitemap: ${DOMAIN}/sitemap.xml
`;
}

function main() {
  const distPath = path.resolve(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  const sitemapPath = path.join(distPath, 'sitemap.xml');
  const robotsPath = path.join(distPath, 'robots.txt');

  fs.writeFileSync(sitemapPath, generateSitemap(), 'utf-8');
  fs.writeFileSync(robotsPath, generateRobots(), 'utf-8');

  console.log('✅ Generated sitemap.xml and robots.txt successfully.');
}

main();
