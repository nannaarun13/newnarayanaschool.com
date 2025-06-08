
import { useSchool } from '@/contexts/SchoolContext';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const { state } = useSchool();
  const { contactInfo } = state.data;

  const handleMapClick = () => {
    if (contactInfo.mapEmbed) {
      // Extract coordinates or use a generic Google Maps link
      window.open('https://maps.google.com', '_blank');
    }
  };

  // Add safety check for contactNumbers
  const contactNumbers = contactInfo?.contactNumbers || [];

  return (
    <footer className="bg-gradient-to-r from-school-blue to-school-orange text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Address */}
          <div className="flex items-start space-x-3">
            <MapPin className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Address</h4>
              <p className="text-sm opacity-90 whitespace-pre-line">
                {contactInfo?.address || 'Address not available'}
              </p>
              <button 
                onClick={handleMapClick}
                className="text-sm underline opacity-90 hover:opacity-100 mt-2"
              >
                View on Google Maps
              </button>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="flex items-start space-x-3">
            <Phone className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Contact Numbers</h4>
              <div className="space-y-1">
                {contactNumbers.map((contact) => (
                  <div key={contact.id} className="text-sm opacity-90">
                    <span className="font-medium">{contact.label}:</span> {contact.number}
                  </div>
                ))}
                {contactNumbers.length === 0 && contactInfo?.phone && (
                  <p className="text-sm opacity-90">{contactInfo.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-3">
            <Mail className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Email</h4>
              <p className="text-sm opacity-90">{contactInfo?.email || 'Email not available'}</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-4 border-t border-white/20">
          <p className="text-xs opacity-70">All copyright reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
