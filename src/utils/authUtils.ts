
export const checkAdminAuth = (): boolean => {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
  const adminEmail = localStorage.getItem('adminEmail');
  return isAuthenticated === 'true' && !!adminEmail;
};

export const setAdminAuth = (email: string): void => {
  localStorage.setItem('isAdminAuthenticated', 'true');
  localStorage.setItem('adminEmail', email);
};

export const clearAdminAuth = (): void => {
  localStorage.removeItem('isAdminAuthenticated');
  localStorage.removeItem('adminEmail');
};

export const getAdminEmail = (): string | null => {
  return localStorage.getItem('adminEmail');
};
