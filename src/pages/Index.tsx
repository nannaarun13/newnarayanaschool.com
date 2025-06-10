
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { state } = useSchool();
  const { welcomeMessage, welcomeImage, latestUpdates, galleryImages } = state.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header with Logo and Navigation */}
      <div className="relative">
        {/* School Logo and Title Overlay */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 text-center">
          <div className="bg-white rounded-full p-4 mb-4 mx-auto w-20 h-20 flex items-center justify-center shadow-lg">
            <div className="w-12 h-12 bg-school-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </div>
          <h1 className="text-school-blue text-2xl md:text-3xl font-bold">NEW NARAYANA SCHOOL</h1>
        </div>

        {/* Main Hero Section */}
        <section className="relative h-screen flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={welcomeImage}
              alt="School Welcome"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-32">
            <div className="bg-white rounded-full p-6 mb-6 mx-auto w-32 h-32 flex items-center justify-center shadow-xl">
              <div className="w-20 h-20 bg-school-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {welcomeMessage}
            </h2>
          </div>
        </section>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Latest Updates */}
        <section className="animate-fade-in">
          <h3 className="text-4xl font-bold text-school-blue mb-8 text-center">
            Latest Updates
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {latestUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-lg transition-shadow duration-300 bg-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-school-orange text-white font-medium px-3 py-1">New</Badge>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium leading-relaxed">{update.content}</p>
                      <p className="text-sm text-gray-500 mt-3">{update.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Gallery */}
        <section className="animate-fade-in">
          <h3 className="text-4xl font-bold text-school-blue mb-8 text-center">
            Our Gallery
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {galleryImages.slice(0, 6).map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white border-0">
                <div className="h-48 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 font-medium">{image.caption}</p>
                  <Badge variant="outline" className="mt-2 text-xs border-school-blue text-school-blue">
                    {image.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-white/80 backdrop-blur-sm text-school-blue py-16 px-8 rounded-lg animate-fade-in shadow-lg border border-blue-200">
          <h3 className="text-3xl font-bold mb-4">Join Our School Community</h3>
          <p className="text-xl mb-8 opacity-90">
            Discover excellence in education with our dedicated faculty and modern facilities
          </p>
          <div className="space-x-4">
            <a
              href="/admissions"
              className="inline-block bg-school-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-school-orange-dark transition-colors duration-200 shadow-lg"
            >
              Apply Now
            </a>
            <a
              href="/about"
              className="inline-block border-2 border-school-blue text-school-blue px-8 py-3 rounded-lg font-semibold hover:bg-school-blue hover:text-white transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
