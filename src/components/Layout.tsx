
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { useSchool } from '@/contexts/SchoolContext';

const Layout = () => {
  const location = useLocation();
  const { dispatch } = useSchool();
  
  useEffect(() => {
    // Increment visitor count on page visits
    dispatch({ type: 'INCREMENT_VISITORS' });
  }, [location.pathname, dispatch]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
