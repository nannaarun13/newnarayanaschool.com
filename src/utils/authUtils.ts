
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
  try {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    const adminEmail = localStorage.getItem('adminEmail');
    console.log('Auth check - isAuthenticated:', isAuthenticated, 'adminEmail:', adminEmail);
    return isAuthenticated === 'true' && !!adminEmail;
  } catch (error) {
    console.error('Error checking admin auth:', error);
    return false;
  }
};

export const setAdminAuth = (email: string): void => {
  try {
    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('adminEmail', email);
    console.log('Admin auth set for:', email);
  } catch (error) {
    console.error('Error setting admin auth:', error);
  }
};

export const clearAdminAuth = (): void => {
  try {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminEmail');
    console.log('Admin auth cleared');
  } catch (error) {
    console.error('Error clearing admin auth:', error);
  }
};

export const getAdminEmail = (): string | null => {
  try {
    return localStorage.getItem('adminEmail');
  } catch (error) {
    console.error('Error getting admin email:', error);
    return null;
  }
};

export const getAdminRequests = (): AdminUser[] => {
  try {
    const requests = localStorage.getItem('adminRequests');
    return requests ? JSON.parse(requests) : [];
  } catch (error) {
    console.error('Error getting admin requests:', error);
    return [];
  }
};

export const saveAdminRequest = (request: AdminUser): void => {
  try {
    const requests = getAdminRequests();
    requests.push(request);
    localStorage.setItem('adminRequests', JSON.stringify(requests));
    console.log('Admin request saved for:', request.email);
  } catch (error) {
    console.error('Error saving admin request:', error);
  }
};

export const updateAdminRequestStatus = (email: string, status: 'approved' | 'rejected', approvedBy?: string): void => {
  try {
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
    console.log('Admin request status updated for:', email, 'to:', status);
  } catch (error) {
    console.error('Error updating admin request status:', error);
  }
};

export const isEmailApproved = (email: string): boolean => {
  try {
    // Grant access to specific email
    if (email === 'arunnanna3@gmail.com') {
      console.log('Pre-approved email detected:', email);
      return true;
    }
    
    const requests = getAdminRequests();
    const request = requests.find(req => req.email === email);
    const isApproved = request?.status === 'approved';
    console.log('Email approval check for:', email, 'result:', isApproved);
    return isApproved;
  } catch (error) {
    console.error('Error checking email approval:', error);
    return false;
  }
};

export const isValidAdminCredentials = (email: string, password: string): boolean => {
  try {
    // Check if email is approved
    if (!isEmailApproved(email)) {
      console.log('Email not approved:', email);
      return false;
    }
    
    // Specific credentials for approved email
    if (email === 'arunnanna3@gmail.com' && password === 'Arun@2004') {
      console.log('Valid credentials for pre-approved email');
      return true;
    }
    
    console.log('Invalid credentials for:', email);
    return false;
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return false;
  }
};
