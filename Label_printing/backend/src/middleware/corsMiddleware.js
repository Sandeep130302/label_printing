// ============================================
// CORS MIDDLEWARE CONFIGURATION
// ============================================
// Allows frontend to communicate with backend
// Configures allowed origins and methods
// Sets security headers

// CORS configuration for development
export const corsOptions = {
  origin: [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',      // Alternative port
    'http://127.0.0.1:5173',      // Local IP
    'https://label-printing-5qu6.onrender.com',
    
    'https://labelprinting-three.vercel.app'       // Same origin (during testing)
  ],
  credentials: true,              // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'Content-Length',
    'X-JSON-Response'
  ],
  maxAge: 86400                   // Cache preflight for 24 hours
};

// CORS configuration for production
export const corsOptionsProduction = {
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  maxAge: 86400
};

// ============================================
// CORS CUSTOM MIDDLEWARE
// ============================================
// Handles CORS manually if needed

export function customCorsMiddleware(req, res, next) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  const origin = req.get('origin');

  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

// ============================================
// SECURITY HEADERS MIDDLEWARE
// ============================================
// Adds security headers to responses

export function securityHeadersMiddleware(req, res, next) {
  // Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.set('X-XSS-Protection', '1; mode=block');

  // Prevent referrer leakage
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.set('Content-Security-Policy', "default-src 'self'");

  next();
}

// ============================================
// SELECT CORS OPTIONS BASED ON ENVIRONMENT
// ============================================

export function getCorsOptions() {
  if (process.env.NODE_ENV === 'production') {
    return corsOptionsProduction;
  }
  return corsOptions;
}
