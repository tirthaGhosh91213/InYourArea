export const config = {
  runtime: 'edge',
};

const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN;

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect social media crawlers
  const isCrawler = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp/i.test(userAgent);
  
  // Skip static files
  const isStatic = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp4|webm)$/i.test(request.nextUrl.pathname);
  
  // If crawler detected and has token, use Prerender
  if (isCrawler && !isStatic && PRERENDER_TOKEN) {
    const prerenderUrl = `https://service.prerender.io/${request.nextUrl.href}`;
    
    try {
      return fetch(prerenderUrl, {
        headers: { 
          'X-Prerender-Token': PRERENDER_TOKEN 
        },
      });
    } catch (error) {
      console.error('Prerender error:', error);
      // Fallback to normal page if Prerender fails
      return;
    }
  }
  
  // Regular users get normal React app
  return;
}
