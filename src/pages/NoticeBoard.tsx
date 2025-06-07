
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell } from 'lucide-react';

const NoticeBoard = () => {
  const { state } = useSchool();
  const { notices } = state.data;

  const getTypeColor = (type: string = 'General') => {
    switch (type) {
      case 'Event':
        return 'bg-school-orange text-white';
      case 'Academic':
        return 'bg-school-blue text-white';
      case 'Meeting':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (notices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <section className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
            Notice Board
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest announcements and important information
          </p>
        </section>
        
        <section className="text-center bg-school-blue-light py-8 px-4 rounded-lg animate-fade-in">
          <Bell className="h-12 w-12 text-school-blue mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-school-blue mb-2">
            No Notices Available
          </h3>
          <p className="text-gray-700">
            Check back later for new announcements and updates
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <section className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-school-blue mb-4">
          Notice Board
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Stay updated with the latest announcements and important information
        </p>
      </section>

      {/* Latest Notice Highlight */}
      {notices.length > 0 && (
        <section className="animate-fade-in">
          <Card className="border-l-4 border-l-school-orange bg-school-orange-light">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-school-orange" />
                <CardTitle className="text-2xl text-school-blue">Latest Update</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-school-blue mb-2">
                    {notices[0].title}
                  </h3>
                  <p className="text-gray-700 mb-3">{notices[0].content}</p>
                  <div className="flex items-center space-x-4">
                    <Badge className={getTypeColor('General')}>
                      Notice
                    </Badge>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">{notices[0].date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* All Notices */}
      <section className="animate-fade-in">
        <h2 className="text-3xl font-bold text-school-blue mb-6">All Notices</h2>
        <div className="space-y-6">
          {notices.map((notice) => (
            <Card key={notice.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-school-blue">
                    {notice.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor('General')}>
                      Notice
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {notice.content}
                </p>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">Posted on {notice.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NoticeBoard;
