
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { state } = useSchool();
  const { welcomeMessage, welcomeImage, latestUpdates, galleryImages } = state.data;

  return (
    <div className="page-background min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Welcome Section */}
        <section className="text-center animate-fade-in">
          <div className="relative h-96 rounded-lg overflow-hidden mb-8">
            <img
              src={welcomeImage}
              alt="School Welcome"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center px-4">
                {welcomeMessage}
              </h2>
            </div>
          </div>
        </section>

        {/* Latest Updates */}
        <section className="animate-fade-in">
          <h3 className="text-3xl font-bold text-school-blue mb-6 text-center">
            Latest Updates
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latestUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-lg transition-shadow duration-300 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-school-orange text-white">New</Badge>
                    <div className="flex-1">
                      <p className="text-gray-700">{update.content}</p>
                      <p className="text-sm text-gray-500 mt-2">{update.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Gallery */}
        <section className="animate-fade-in">
          <h3 className="text-3xl font-bold text-school-blue mb-6 text-center">
            Our Gallery
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryImages.slice(0, 6).map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white/90 backdrop-blur-sm">
                <div className="h-48 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">{image.caption}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {image.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-school-blue to-school-orange text-white py-16 px-8 rounded-lg animate-fade-in shadow-lg">
          <h3 className="text-3xl font-bold mb-4">Join Our School Community</h3>
          <p className="text-xl mb-8 opacity-90">
            Discover excellence in education with our dedicated faculty and modern facilities
          </p>
          <div className="space-x-4">
            <a
              href="/admissions"
              className="inline-block bg-white text-school-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Apply Now
            </a>
            <a
              href="/about"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-school-blue transition-colors duration-200"
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
