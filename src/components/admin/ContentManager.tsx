
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, Shield } from 'lucide-react';
import LatestUpdatesManager from './LatestUpdatesManager';
import FoundersManager from './FoundersManager';
import SchoolInfoSection from './sections/SchoolInfoSection';
import AboutSection from './sections/AboutSection';
import MissionVisionSection from './sections/MissionVisionSection';
import HistoryFounderSection from './sections/HistoryFounderSection';
import { useContentManager } from '@/hooks/useContentManager';

const ContentManager = () => {
  const { formData, handleInputChange, handleSave } = useContentManager();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <Shield className="h-4 w-4 mr-1" />
          XSS Protection Active
        </div>
      </div>

      <SchoolInfoSection 
        formData={formData} 
        onInputChange={handleInputChange} 
      />

      <AboutSection 
        formData={formData} 
        onInputChange={handleInputChange} 
      />

      <MissionVisionSection 
        formData={formData} 
        onInputChange={handleInputChange} 
      />

      <HistoryFounderSection 
        formData={formData} 
        onInputChange={handleInputChange} 
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-school-blue hover:bg-school-blue/90">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Additional Managers */}
      <LatestUpdatesManager />
      <FoundersManager />
    </div>
  );
};

export default ContentManager;
