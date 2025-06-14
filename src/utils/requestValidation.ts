
const ALLOWED_ORIGINS = [
  'https://newnarayanaschool-2022.firebaseapp.com',
  'https://newnarayanaschool-2022.web.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://lovable.dev'
];

export const validateRequestOrigin = (): boolean => {
  const origin = window.location.origin;
  
  // In development, allow localhost
  if (import.meta.env.DEV && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return true;
  }
  
  return ALLOWED_ORIGINS.includes(origin);
};

export const validateReferer = (referer?: string): boolean => {
  if (!referer) return false;
  
  try {
    const refererUrl = new URL(referer);
    return ALLOWED_ORIGINS.some(origin => refererUrl.origin === origin);
  } catch {
    return false;
  }
};

export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

export const validateTimestamp = (timestamp: string, maxAgeMinutes: number = 5): boolean => {
  try {
    const requestTime = new Date(timestamp).getTime();
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000;
    
    return (now - requestTime) <= maxAge;
  } catch {
    return false;
  }
};
