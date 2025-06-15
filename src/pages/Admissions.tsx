
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Building, Trophy } from 'lucide-react';

const Admissions = () => {
  const { dispatch } = useSchool();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentName: '',
    classApplied: '',
    previousClass: '',
    previousSchool: '',
    fatherName: '',
    motherName: '',
    primaryContact: '',
    secondaryContact: '',
    location: '',
    additionalInfo: ''
  });

  const classOptions = [
    'NURSERY',
    'LKG',
    'UKG',
    'CLASS 1',
    'CLASS 2',
    'CLASS 3',
    'CLASS 4',
    'CLASS 5',
    'CLASS 6',
    'CLASS 7',
    'CLASS 8',
    'CLASS 9',
    'CLASS 10'
  ];

  const getClassIndex = (className: string) => {
    return classOptions.indexOf(className);
  };

  const getAvailableClassesForApplication = () => {
    if (!formData.previousClass) return classOptions;
    
    const previousIndex = getClassIndex(formData.previousClass);
    if (previousIndex === -1) return classOptions;
    
    return classOptions.slice(previousIndex + 1);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 91, remove it
    const cleanDigits = digits.startsWith('91') ? digits.slice(2) : digits;
    
    // Limit to 10 digits
    const limitedDigits = cleanDigits.slice(0, 10);
    
    // Format as 98480 47368
    if (limitedDigits.length <= 5) {
      return limitedDigits;
    } else {
      return `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (['studentName', 'fatherName', 'motherName', 'location', 'previousSchool'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (['primaryContact', 'secondaryContact'].includes(name)) {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset class applied if previous class changes and it's no longer valid
      if (name === 'previousClass' && prev.classApplied) {
        const previousIndex = getClassIndex(value);
        const appliedIndex = getClassIndex(prev.classApplied);
        if (appliedIndex <= previousIndex) {
          newData.classApplied = '';
        }
      }
      
      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.previousClass || !formData.classApplied) {
      toast({
        title: "Validation Error",
        description: "Please select both previous class and class applied for.",
        variant: "destructive"
      });
      return false;
    }

    const previousIndex = getClassIndex(formData.previousClass);
    const appliedIndex = getClassIndex(formData.classApplied);
    
    if (appliedIndex <= previousIndex) {
      toast({
        title: "Validation Error",
        description: "Class applied for must be higher than previous class.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.primaryContact.replace(/\s/g, '').length !== 10) {
      toast({
        title: "Validation Error",
        description: "Primary contact number must be exactly 10 digits.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.secondaryContact && formData.secondaryContact.replace(/\s/g, '').length !== 10) {
      toast({
        title: "Validation Error",
        description: "Secondary contact number must be exactly 10 digits.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const inquiryData = {
      id: Date.now().toString(),
      ...formData,
      presentClass: formData.previousClass,
      primaryContact: `+91 ${formData.primaryContact}`,
      secondaryContact: formData.secondaryContact ? `+91 ${formData.secondaryContact}` : '',
      submittedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_ADMISSION_INQUIRY', payload: inquiryData });
    
    toast({
      title: "Application Submitted",
      description: "Your admission inquiry has been submitted successfully. We will contact you soon.",
    });

    setFormData({
      studentName: '',
      classApplied: '',
      previousClass: '',
      previousSchool: '',
      fatherName: '',
      motherName: '',
      primaryContact: '',
      secondaryContact: '',
      location: '',
      additionalInfo: ''
    });
  };

  const features = [
    {
      icon: GraduationCap,
      title: "Quality Education",
      description: "Comprehensive curriculum designed for holistic development"
    },
    {
      icon: Users,
      title: "Experienced Faculty",
      description: "Dedicated teachers committed to student success"
    },
    {
      icon: Building,
      title: "Modern Facilities",
      description: "Well-equipped classrooms and laboratories"
    },
    {
      icon: Trophy,
      title: "Excellence Record",
      description: "Proven track record of academic achievements"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Page Header */}
        <section className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
            Admissions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of learners and embark on a journey of academic excellence
          </p>
        </section>

        {/* Features Section */}
        <section className="animate-fade-in">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <feature.icon className="h-12 w-12 text-school-blue mx-auto" />
                  <h3 className="font-semibold text-lg text-school-blue">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Admission Form */}
        <section className="animate-fade-in">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="bg-school-blue text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">
                Admission Inquiry Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="studentName">Student Name *</Label>
                    <Input
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student name"
                      required
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically converted to uppercase</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="classApplied">Class Applied For *</Label>
                    <Select value={formData.classApplied} onValueChange={(value) => handleSelectChange('classApplied', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class applied for" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableClassesForApplication().map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Must be higher than previous class</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="previousClass">Previous Class *</Label>
                    <Select value={formData.previousClass} onValueChange={(value) => handleSelectChange('previousClass', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select previous class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="previousSchool">Previous School</Label>
                    <Input
                      id="previousSchool"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                      placeholder="Enter previous school name"
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional, automatically converted to uppercase</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="fatherName">Father's Name *</Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                      required
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically converted to uppercase</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="motherName">Mother's Name *</Label>
                    <Input
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                      required
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically converted to uppercase</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryContact">Primary Contact Number *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                        +91
                      </span>
                      <Input
                        id="primaryContact"
                        name="primaryContact"
                        value={formData.primaryContact}
                        onChange={handleInputChange}
                        placeholder="98480 47368"
                        required
                        className="rounded-l-none"
                        maxLength={11}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">10 digit Indian mobile number</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryContact">Secondary Contact Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                        +91
                      </span>
                      <Input
                        id="secondaryContact"
                        name="secondaryContact"
                        value={formData.secondaryContact}
                        onChange={handleInputChange}
                        placeholder="98480 47368"
                        className="rounded-l-none"
                        maxLength={11}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional 10 digit number</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location/Address *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location/address"
                      required
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically converted to uppercase</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any additional information you'd like to share"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-school-blue hover:bg-school-blue/90 text-white py-3 text-lg"
                >
                  Submit Admission Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Admissions;
