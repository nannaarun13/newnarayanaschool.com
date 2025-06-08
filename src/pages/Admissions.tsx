
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSchool } from '@/contexts/SchoolContext';

const Admissions = () => {
  const { toast } = useToast();
  const { state, dispatch } = useSchool();
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
    
    // Convert text inputs to uppercase
    if (name === 'studentName' || name === 'fatherName' || name === 'motherName') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.classApplied || !formData.fatherName || !formData.primaryContact) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Add to admission inquiries
    const inquiryData = {
      id: Date.now().toString(),
      ...formData,
      submittedAt: new Date().toISOString()
    };

    dispatch({
      type: 'ADD_ADMISSION_INQUIRY',
      payload: inquiryData
    });
    
    toast({
      title: "Application Submitted!",
      description: "Thank you for your admission inquiry. We will contact you soon.",
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
    <div className="page-background min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Page Header */}
        <section className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
            Admissions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our school community and embark on a journey of academic excellence
          </p>
        </section>

        {/* Admission Process */}
        <section className="animate-fade-in">
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-school-blue">Admission Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-school-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Submit Inquiry</h3>
                  <p className="text-gray-600">Fill out the admission inquiry form below</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-school-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Document Review</h3>
                  <p className="text-gray-600">Our team will review your application</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-school-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Admission Confirmation</h3>
                  <p className="text-gray-600">Receive confirmation and next steps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Admission Form */}
        <section className="animate-fade-in">
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-school-blue">Admission Inquiry Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student's Name *</Label>
                    <Input
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student's full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classApplied">Class Applied For *</Label>
                    <Input
                      id="classApplied"
                      name="classApplied"
                      value={formData.classApplied}
                      onChange={handleInputChange}
                      placeholder="e.g., Class 1, Class 10"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="presentClass">Present Class</Label>
                    <Input
                      id="presentClass"
                      name="presentClass"
                      value={formData.presentClass}
                      onChange={handleInputChange}
                      placeholder="Current class studying"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousClass">Previous Class</Label>
                    <Input
                      id="previousClass"
                      name="previousClass"
                      value={formData.previousClass}
                      onChange={handleInputChange}
                      placeholder="Last class completed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input
                    id="previousSchool"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleInputChange}
                    placeholder="Name of previous school"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name *</Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryContact">Primary Contact Number *</Label>
                    <Input
                      id="primaryContact"
                      name="primaryContact"
                      type="tel"
                      value={formData.primaryContact}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryContact">Secondary Contact Number</Label>
                    <Input
                      id="secondaryContact"
                      name="secondaryContact"
                      type="tel"
                      value={formData.secondaryContact}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location/Address</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your location/address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional information you'd like to share"
                    rows={4}
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
