
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

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

export const getAdminRequests = (): AdminUser[] => {
  const requests = localStorage.getItem('adminRequests');
  return requests ? JSON.parse(requests) : [];
};

export const saveAdminRequest = (request: AdminUser): void => {
  const requests = getAdminRequests();
  requests.push(request);
  localStorage.setItem('adminRequests', JSON.stringify(requests));
};

export const updateAdminRequestStatus = (email: string, status: 'approved' | 'rejected', approvedBy?: string): void => {
  const requests = getAdminRequests();
  const updatedRequests = requests.map(request => 
    request.email === email 
      ? { 
          ...request, 
          status, 
          approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
          approvedBy 
        }
      : request
  );
  localStorage.setItem('adminRequests', JSON.stringify(updatedRequests));
};

export const isEmailApproved = (email: string): boolean => {
  // Grant access to specific email
  if (email === 'arunnanna3@gmail.com') {
    return true;
  }
  
  const requests = getAdminRequests();
  const request = requests.find(req => req.email === email);
  return request?.status === 'approved';
};

export const isValidAdminCredentials = (email: string, password: string): boolean => {
  // Check if email is approved
  if (!isEmailApproved(email)) {
    return false;
  }
  
  // Specific credentials for approved email
  if (email === 'arunnanna3@gmail.com' && password === 'Arun@2004') {
    return true;
  }
  
  // For other approved users, you would check against stored passwords
  // This is a simplified version - in production, use proper password hashing
  return false;
};
