
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell } from 'lucide-react';

const NoticeBoard = () => {
  const { state } = useSchool();
  
  // Mock notices data - this will be managed by admin
  const notices = [
    {
      id: 1,
      title: "Annual Sports Day 2024",
      content: "Join us for our Annual Sports Day on March 15th, 2024. All students and parents are invited to participate.",
      date: "2024-03-01",
      type: "Event"
    },
    {
      id: 2,
      title: "Mid-term Examination Schedule",
      content: "Mid-term examinations will commence from March 20th, 2024. Please check the detailed schedule in your class notice boards.",
      date: "2024-03-05",
      type: "Academic"
    },
    {
      id: 3,
      title: "Parent-Teacher Meeting",
      content: "Monthly parent-teacher meeting scheduled for March 25th, 2024 from 10:00 AM to 4:00 PM.",
      date: "2024-03-10",
      type: "Meeting"
    }
  ];

  const getTypeColor = (type: string) => {
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
                  <Badge className={getTypeColor(notices[0].type)}>
                    {notices[0].type}
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
                    <Badge className={getTypeColor(notice.type)}>
                      {notice.type}
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

      {/* Admin Notice */}
      <section className="text-center bg-school-blue-light py-8 px-4 rounded-lg animate-fade-in">
        <Bell className="h-12 w-12 text-school-blue mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-school-blue mb-2">
          Notice Management
        </h3>
        <p className="text-gray-700">
          All notices are managed through the admin panel and updated in real-time
        </p>
      </section>
    </div>
  );
};

export default NoticeBoard;
