// ============================================
// CORS CONFIGURATION (FINAL)
// ============================================

export const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://labelprinting-three.vercel.app',
    'https://label-printing-5qu6.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  exposedHeaders: [
    'Content-Length'
  ],
  maxAge: 86400
};

// ============================================
// PRODUCTION CONFIG
// ============================================

export const corsOptionsProduction = {
  origin: [
    process.env.FRONTEND_URL,
    'https://labelprinting-three.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  maxAge: 86400
};

// ============================================
// SELECT BASED ON ENV
// ============================================

export function getCorsOptions() {
  if (process.env.NODE_ENV === 'production') {
    return corsOptionsProduction;
  }
  return corsOptions;
}