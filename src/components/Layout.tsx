
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import SyncStatusIndicator from './SyncStatusIndicator';
import SecurityHeadersV2 from './security/SecurityHeadersV2';

const Layout = () => {
  return (
    <>
      <SecurityHeadersV2 />
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <SyncStatusIndicator />
      </div>
    </>
  );
};

export default Layout;
