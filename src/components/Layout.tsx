
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <main className="pt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
