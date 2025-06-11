
import { useSchool } from '@/contexts/SchoolContext';
import { MapPin, Phone, Mail, MapPinIcon } from 'lucide-react';

const Footer = () => {
  const { state } = useSchool();
  const { contactInfo } = state.data;

  const handleMapClick = () => {
    // Redirect to the specific school location on Google Maps
    const mapUrl = 'https://www.google.com/maps/place/17%C2%B018\'33.1%22N+78%C2%B030\'33.9%22E/@17.3091944,78.5069444,17z/data=!3m1!4b1!4m4!3m3!8m2!3d17.3091944!4d78.5094722';
    window.open(mapUrl, '_blank');
  };

  // Use contactInfo safely with fallbacks
  const contactNumbers = contactInfo?.contactNumbers || [];
  const address = contactInfo?.address || '8G49+HFJ, Sri Laxmi Nagar Colony, Badangpet, Hyderabad, Telangana 500058';
  const email = contactInfo?.email || 'info@newnarayanaschool.edu';

  return (
    <footer className="bg-school-blue text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Address */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <MapPin className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Address</h4>
                <p className="text-sm opacity-90 whitespace-pre-line leading-relaxed">
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Phone Numbers */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <Phone className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Phone Numbers</h4>
                <div className="space-y-1">
                  {contactNumbers.length > 0 ? (
                    contactNumbers.map((contact) => (
                      <p key={contact.id} className="text-sm opacity-90">
                        {contact.number}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm opacity-90">+91 98765 43210</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <Mail className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Email</h4>
                <p className="text-sm opacity-90">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <MapPinIcon className="h-6 w-6 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Location</h4>
                <button 
                  onClick={handleMapClick}
                  className="bg-school-orange text-white px-4 py-2 rounded hover:bg-school-orange-dark transition-colors text-sm font-medium"
                >
                  View on Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 border-t border-white/20">
          <p className="text-sm opacity-70">© 2025 New Narayana School. All copyright reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
