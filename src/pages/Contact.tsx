
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const { state } = useSchool();
  const { contactInfo } = state.data;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Page Header */}
      <section className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
          Contact Us
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get in touch with us for any queries, admissions, or general information
        </p>
      </section>

      {/* Contact Information Grid */}
      <section className="animate-fade-in">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <MapPin className="h-12 w-12 text-school-blue mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-school-blue mb-2">Address</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {contactInfo.address}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Phone className="h-12 w-12 text-school-blue mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-school-blue mb-2">Phone</h3>
              <p className="text-gray-600">
                {contactInfo.phone}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Mail className="h-12 w-12 text-school-blue mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-school-blue mb-2">Email</h3>
              <p className="text-gray-600">
                {contactInfo.email}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <Clock className="h-12 w-12 text-school-blue mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-school-blue mb-2">Office Hours</h3>
              <p className="text-gray-600">
                Mon - Fri: 8:00 AM - 4:00 PM<br />
                Sat: 8:00 AM - 12:00 PM
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map and Quick Contact */}
      <section className="animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Find Us</CardTitle>
            </CardHeader>
            <CardContent>
              {contactInfo.mapEmbed ? (
                <div 
                  className="h-64 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbed }}
                />
              ) : (
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Map will be displayed here<br />
                    (Admin can update location through admin panel)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-school-blue mb-2">Admissions Enquiry</h4>
                <p className="text-gray-600 mb-2">
                  For admission related queries and school visits
                </p>
                <Button className="w-full bg-school-blue hover:bg-school-blue/90">
                  Contact Admissions Office
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold text-school-blue mb-2">General Information</h4>
                <p className="text-gray-600 mb-2">
                  For general queries about school facilities and programs
                </p>
                <Button variant="outline" className="w-full border-school-blue text-school-blue hover:bg-school-blue hover:text-white">
                  Contact Main Office
                </Button>
              </div>

              <div>
                <h4 className="font-semibold text-school-blue mb-2">Academic Support</h4>
                <p className="text-gray-600 mb-2">
                  For academic queries and student support services
                </p>
                <Button variant="outline" className="w-full border-school-orange text-school-orange hover:bg-school-orange hover:text-white">
                  Contact Academic Office
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Directions */}
      <section className="animate-fade-in">
        <Card className="bg-school-blue-light">
          <CardHeader>
            <CardTitle className="text-3xl text-school-blue text-center">How to Reach Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="font-semibold text-school-blue mb-2">By Car</h4>
                <p className="text-gray-700">
                  Take the main highway exit at Education District. 
                  Free parking available on campus.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-school-blue mb-2">By Public Transport</h4>
                <p className="text-gray-700">
                  Bus routes 12, 15, and 23 stop directly at our school gate. 
                  Metro station is 500m away.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-school-blue mb-2">School Bus</h4>
                <p className="text-gray-700">
                  We provide school bus services covering major areas. 
                  Contact us for route information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Contact;
