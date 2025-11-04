// server/middleware/prerender.js
const isBot = (userAgent) => {
  if (!userAgent) return false;
  
  const bots = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 
    'baiduspider', 'yandexbot', 'facebot', 
    'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
    'google-structured-data-testing-tool',
    'google page speed', 'lighthouse'
  ];
  
  return bots.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
};

const prerenderMiddleware = async (req, res, next) => {
  // Skip for API routes, assets, and health checks
  if (req.path.startsWith('/api/') || 
      req.path.includes('.') || 
      req.path === '/health') {
    return next();
  }

  const userAgent = req.get('User-Agent');
  
  if (isBot(userAgent)) {
    console.log(`🤖 Bot detected: ${userAgent} - Prerendering: ${req.path}`);
    try {
      const rendertron = require('rendertron');
      const botMiddleware = rendertron.makeMiddleware({
        proxyUrl: 'https://render-tron.appspot.com/render',
        userAgentPattern: /googlebot|bingbot|slurp|baiduspider|yandexbot|facebookexternalhit|twitterbot/i,
        timeout: 10000, // 10 second timeout
        cache: 'memory'
      });
      
      return botMiddleware(req, res, next);
    } catch (error) {
      console.log('❌ Rendertron failed, serving normal app:', error.message);
      next();
    }
  } else {
    // Human user - serve normal SPA
    next();
  }
};

module.exports = { prerenderMiddleware, isBot };