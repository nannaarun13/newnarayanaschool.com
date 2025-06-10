
import { useSchool } from '@/contexts/SchoolContext';

const Header = () => {
  const { state } = useSchool();
  const { schoolLogo, schoolNameImage, schoolName } = state.data;

  return (
    <header className="bg-gradient-to-r from-school-blue via-school-blue to-school-orange text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4">
          <img 
            src={schoolLogo} 
            alt="School Logo" 
            className="h-16 w-16 object-contain bg-white rounded-full p-1"
          />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
              NEW NARAYANA SCHOOL
            </h1>
            <p className="text-white/90 text-lg italic">School of Excellence...</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
