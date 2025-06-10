
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const { state } = useSchool();
  const { contactInfo } = state.data;
  const contactNumbers = contactInfo?.contactNumbers || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-school-blue-light via-white to-school-orange-light">
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
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border border-school-blue/20">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-school-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-school-blue mb-2">Address</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {contactInfo?.address || 'Address not available'}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border border-school-blue/20">
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-school-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-school-blue mb-2">Phone</h3>
                <div className="space-y-1">
                  {contactNumbers.map((contact) => (
                    <p key={contact.id} className="text-gray-600 text-sm">
                      {contact.number}
                    </p>
                  ))}
                  {contactNumbers.length === 0 && (
                    <p className="text-gray-600">+91 98765 43210</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border border-school-blue/20">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-school-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-school-blue mb-2">Email</h3>
                <p className="text-gray-600">
                  {contactInfo?.email || 'Email not available'}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border border-school-blue/20">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-school-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-school-blue mb-2">School Times</h3>
                <p className="text-gray-600">
                  Mon - Sat: 8:00 AM - 4:00 PM
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map */}
        <section className="animate-fade-in">
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm border border-school-blue/20">
            <CardContent className="p-6">
              <div className="h-96 rounded-lg overflow-hidden">
                <div className="embed-map-responsive">
                  <div className="embed-map-container">
                    <iframe 
                      className="embed-map-frame" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src="https://maps.google.com/maps?width=600&height=600&hl=en&q=17%C2%B018%2733.1%22N%2078%C2%B030%2733.9%22E&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                      title="School Location"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Contact;
