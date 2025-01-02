// List of allowed origins for CORS
export const allowedOrigins = [
  'http://localhost:5173',  // Frontend dev server
  'http://localhost:5000',  // Backend dev server
  'http://localhost:3000',  // Alternative dev port
  ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
].filter(Boolean);

// Helper to check if origin is allowed
export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};