
import { useSchool } from '@/contexts/SchoolContext';

const Header = () => {
  const { state } = useSchool();
  const { schoolLogo, schoolNameImage, schoolName } = state.data;

  return (
    <header className="bg-gradient-to-r from-school-blue via-school-blue to-school-orange text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex-shrink-0">
            <img 
              src={schoolLogo} 
              alt="School Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain bg-white rounded-full p-1 shadow-lg"
            />
          </div>
          <div className="text-center flex-1 min-w-0">
            {schoolNameImage ? (
              <img 
                src={schoolNameImage} 
                alt={schoolName || "School Name"} 
                className="h-8 sm:h-12 md:h-16 lg:h-20 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl object-contain mx-auto"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide break-words">
                {schoolName || "NEW NARAYANA SCHOOL"}
              </h1>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
