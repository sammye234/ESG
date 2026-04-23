// server/src/middleware/rateLimiter.js

// Simple in-memory rate limiter
class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs; // 1 minute default
    this.maxRequests = maxRequests; // 100 requests per window
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Clean old entries
      if (!this.requests.has(ip)) {
        this.requests.set(ip, []);
      }

      const userRequests = this.requests.get(ip);
      const recentRequests = userRequests.filter(time => now - time < this.windowMs);
      
      if (recentRequests.length >= this.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(this.windowMs / 1000)} seconds`
        });
      }

      recentRequests.push(now);
      this.requests.set(ip, recentRequests);
      
      next();
    };
  }
}

// Create rate limiters for different routes
const generalLimiter = new RateLimiter(60000, 100); // 100 requests per minute
const authLimiter = new RateLimiter(900000, 5); // 5 login attempts per 15 minutes
const uploadLimiter = new RateLimiter(60000, 10); // 10 uploads per minute

module.exports = {
  generalLimiter: generalLimiter.middleware(),
  authLimiter: authLimiter.middleware(),
  uploadLimiter: uploadLimiter.middleware()
};