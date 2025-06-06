
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const { state } = useSchool();
  const { 
    schoolHistory, 
    yearEstablished, 
    educationalSociety, 
    founderDetails, 
    founderImages 
  } = state.data;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Page Header */}
      <section className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
          About Our School
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn about our rich history, vision, and commitment to educational excellence
        </p>
      </section>

      {/* School History */}
      <section className="animate-fade-in">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl text-school-blue">Our History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-school-orange mb-2">
                  {yearEstablished}
                </div>
                <p className="text-gray-600">Year Established</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-school-orange mb-2">
                  25+
                </div>
                <p className="text-gray-600">Years of Excellence</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-school-orange mb-2">
                  1000+
                </div>
                <p className="text-gray-600">Alumni</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {schoolHistory}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Educational Society */}
      <section className="animate-fade-in">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl text-school-blue">Educational Society</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are proudly affiliated with the <strong>{educationalSociety}</strong>, 
              which has been dedicated to promoting quality education and holistic development 
              of students across the region. Our society believes in creating an environment 
              where every student can thrive academically, socially, and personally.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Founder Details */}
      <section className="animate-fade-in">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl text-school-blue">Our Founder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {founderDetails}
                </p>
                <p className="text-gray-600">
                  Our founder's vision continues to guide our mission of providing 
                  accessible, high-quality education that prepares students for success 
                  in an ever-changing world.
                </p>
              </div>
              <div className="space-y-4">
                {founderImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Founder ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Mission & Vision */}
      <section className="animate-fade-in">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To provide exceptional education that empowers students to become 
                confident, creative, and compassionate individuals who contribute 
                positively to society while maintaining the highest academic standards.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-school-blue">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To be a leading educational institution that nurtures future leaders, 
                innovators, and global citizens through excellence in teaching, 
                character development, and holistic growth.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
