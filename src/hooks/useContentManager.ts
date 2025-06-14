
import { useState } from 'react';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHTML, sanitizeText, validateContentLength } from '@/utils/sanitizationUtils';

export const useContentManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    schoolName: state.data.schoolName,
    welcomeMessage: state.data.welcomeMessage,
    aboutContent: state.data.aboutContent,
    missionStatement: state.data.missionStatement,
    visionStatement: state.data.visionStatement,
    welcomeImage: state.data.welcomeImage,
    schoolHistory: state.data.schoolHistory,
    founderDetails: state.data.founderDetails
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate content lengths
    if (!validateContentLength(formData.welcomeMessage, 2000)) {
      toast({
        title: "Content Too Long",
        description: "Welcome message must be under 2000 characters.",
        variant: "destructive"
      });
      return;
    }

    if (!validateContentLength(formData.aboutContent, 5000)) {
      toast({
        title: "Content Too Long", 
        description: "About content must be under 5000 characters.",
        variant: "destructive"
      });
      return;
    }

    // Sanitize all inputs before saving
    const sanitizedData = {
      schoolName: sanitizeText(formData.schoolName),
      welcomeMessage: sanitizeHTML(formData.welcomeMessage),
      aboutContent: sanitizeHTML(formData.aboutContent),
      missionStatement: sanitizeHTML(formData.missionStatement),
      visionStatement: sanitizeHTML(formData.visionStatement),
      welcomeImage: formData.welcomeImage, // Already validated by ImageUpload
      schoolHistory: sanitizeHTML(formData.schoolHistory),
      founderDetails: sanitizeHTML(formData.founderDetails)
    };

    dispatch({
      type: 'UPDATE_SCHOOL_DATA',
      payload: sanitizedData
    });

    toast({
      title: "Content Updated",
      description: "All content has been securely saved with XSS protection.",
    });
  };

  return {
    formData,
    handleInputChange,
    handleSave
  };
};
