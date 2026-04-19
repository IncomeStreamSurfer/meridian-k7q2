import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || 'https://meridian-k7q2.vercel.app').replace(/\/$/, '');
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap-index.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
