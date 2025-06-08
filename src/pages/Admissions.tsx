
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
    // Convert to uppercase for specific fields
    const uppercaseFields = ['studentName', 'fatherName', 'motherName', 'previousSchool', 'location'];
    const processedValue = uppercaseFields.includes(name) ? value.toUpperCase() : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const inquiryData = {
      ...formData,
      id: Date.now().toString(),
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Page Header */}
        <section className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
            Admissions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of learners and embark on an educational journey of excellence
          </p>
        </section>

        {/* Admission Process */}
        <section className="animate-fade-in">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl text-school-blue text-center">Admission Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 bg-school-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                  <h3 className="text-lg font-semibold text-school-blue mb-2">Submit Application</h3>
                  <p className="text-gray-600">Fill out the admission inquiry form below</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-school-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                  <h3 className="text-lg font-semibold text-school-blue mb-2">Document Review</h3>
                  <p className="text-gray-600">Our admissions team reviews your application</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-school-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                  <h3 className="text-lg font-semibold text-school-blue mb-2">Interview & Assessment</h3>
                  <p className="text-gray-600">Student interview and assessment if required</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-school-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                  <h3 className="text-lg font-semibold text-school-blue mb-2">Admission Decision</h3>
                  <p className="text-gray-600">Receive admission decision and enrollment details</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Admission Inquiry Form */}
        <section className="animate-fade-in">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl text-school-blue text-center">Admission Inquiry Form</CardTitle>
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
                    <Label htmlFor="presentClass">Present Class</Label>
                    <Input
                      id="presentClass"
                      name="presentClass"
                      value={formData.presentClass}
                      onChange={handleInputChange}
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
                    <Label htmlFor="primaryContact">Primary Contact Number *</Label>
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
                    <Label htmlFor="secondaryContact">Secondary Contact Number</Label>
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
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                <div className="text-center">
                  <Button 
                    type="submit" 
                    className="bg-school-blue hover:bg-school-blue/90 text-white px-8 py-3 text-lg"
                  >
                    Submit Inquiry
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Admissions;
