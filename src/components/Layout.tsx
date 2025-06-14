
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import SyncStatusIndicator from './SyncStatusIndicator';
import { useSchool } from '@/contexts/SchoolContext';

const Layout = () => {
  const location = useLocation();
  const { dispatch } = useSchool();
  
  // Don't show header, navigation, and footer on admin pages and login
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  
  useEffect(() => {
    // Increment visitor count on page visits (except admin pages and login)
    if (!isAdminPage && !isLoginPage) {
      dispatch({ type: 'INCREMENT_VISITORS' });
    }
  }, [location.pathname, dispatch, isAdminPage, isLoginPage]);

  // For login and admin pages, render without layout
  if (isAdminPage || isLoginPage) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* Global sync status indicator for public pages */}
      <div className="fixed bottom-4 right-4 z-50">
        <SyncStatusIndicator />
      </div>
    </div>
  );
};

export default Layout;
