
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken || typeof token !== 'string' || typeof expectedToken !== 'string') {
    return false;
  }
  
  // Enhanced validation for token format
  if (token.length !== expectedToken.length || token.length < 16) {
    return false;
  }
  
  // Check for valid token format (hexadecimal)
  if (!/^[a-f0-9]+$/i.test(token) || !/^[a-f0-9]+$/i.test(expectedToken)) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};
