
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';

const Admissions = () => {
  const { dispatch } = useSchool();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentName: '',
    classApplied: '',
    presentClass: '',
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
    
    // Convert specific fields to uppercase
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
      submittedAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_ADMISSION_INQUIRY', payload: inquiryData });
    
    toast({
      title: "Application Submitted",
      description: "Your admission inquiry has been submitted successfully. We will contact you soon.",
    });

    // Reset form
    setFormData({
      studentName: '',
      classApplied: '',
      presentClass: '',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-school-blue-light via-white to-school-orange-light">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Page Header */}
        <section className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
            Admissions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our family of learners and embark on a journey of excellence
          </p>
        </section>

        {/* Admission Form */}
        <section className="animate-fade-in">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-school-blue/20">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue text-center">
                Admission Inquiry Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="studentName">Student Name *</Label>
                    <Input
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="classApplied">Class Applied For *</Label>
                    <Input
                      id="classApplied"
                      name="classApplied"
                      value={formData.classApplied}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="presentClass">Present Class *</Label>
                    <Input
                      id="presentClass"
                      name="presentClass"
                      value={formData.presentClass}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousClass">Previous Class</Label>
                    <Input
                      id="previousClass"
                      name="previousClass"
                      value={formData.previousClass}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousSchool">Previous School</Label>
                    <Input
                      id="previousSchool"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherName">Father's Name *</Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherName">Mother's Name *</Label>
                    <Input
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryContact">Primary Contact *</Label>
                    <Input
                      id="primaryContact"
                      name="primaryContact"
                      type="tel"
                      value={formData.primaryContact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryContact">Secondary Contact</Label>
                    <Input
                      id="secondaryContact"
                      name="secondaryContact"
                      type="tel"
                      value={formData.secondaryContact}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
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
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-school-blue hover:bg-school-blue/90 text-white"
                >
                  Submit Application
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
