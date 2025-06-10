import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (['studentName', 'fatherName', 'motherName', 'location'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const inquiryData = {
      id: Date.now().toString(),
      ...formData,
      presentClass: formData.previousClass, // Map for backward compatibility
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
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
                  </div>
                  <div>
                    <Label htmlFor="classApplied">Class Applied For *</Label>
                    <Input
                      id="classApplied"
                      name="classApplied"
                      value={formData.classApplied}
                      onChange={handleInputChange}
                      placeholder="e.g., Class 5, Class 10"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousClass">Previous Class *</Label>
                    <Input
                      id="previousClass"
                      name="previousClass"
                      value={formData.previousClass}
                      onChange={handleInputChange}
                      placeholder="Previous class of the student"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousSchool">Previous School</Label>
                    <Input
                      id="previousSchool"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                      placeholder="Enter previous school name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
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
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
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
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
                  </div>
                  <div>
                    <Label htmlFor="primaryContact">Primary Contact Number *</Label>
                    <Input
                      id="primaryContact"
                      name="primaryContact"
                      type="tel"
                      value={formData.primaryContact}
                      onChange={handleInputChange}
                      placeholder="Enter primary contact number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryContact">Secondary Contact Number</Label>
                    <Input
                      id="secondaryContact"
                      name="secondaryContact"
                      type="tel"
                      value={formData.secondaryContact}
                      onChange={handleInputChange}
                      placeholder="Enter secondary contact number"
                    />
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
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
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
