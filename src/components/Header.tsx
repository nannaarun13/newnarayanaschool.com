
import { useSchool } from '@/contexts/SchoolContext';

const Header = () => {
  const { state } = useSchool();
  const { schoolName, schoolLogo } = state.data;

  return (
    <header className="school-gradient text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4">
          <img 
            src={schoolLogo} 
            alt="School Logo" 
            className="h-16 w-16 object-contain bg-white rounded-full p-1"
          />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
              {schoolName}
            </h1>
            <p className="text-sm md:text-base opacity-90 mt-1">
              Excellence in Education Since 1995
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
