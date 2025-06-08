
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSchool } from '@/contexts/SchoolContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const Navigation = () => {
  const { state } = useSchool();
  const { navigationItems } = state.data;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Add safety check for navigationItems
  const visibleItems = navigationItems ? navigationItems.filter(item => item.visible) : [];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {visibleItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
            location.pathname === item.path
              ? 'bg-school-blue text-white'
              : 'text-school-blue hover:bg-school-blue-light'
          } ${mobile ? 'block w-full text-left' : ''}`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center space-x-2 py-4">
          <NavLinks />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-4">
          <div className="flex-1"></div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="text-school-blue">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-3 mt-6">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
