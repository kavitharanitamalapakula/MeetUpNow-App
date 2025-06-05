import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Home from './Home';
import "../styles/dashboard.css"
import ProfileCard from './Profile';
import MeetingSchedule from './MeetingSchedule';
import Header from './Header';
import WelcomePopup from './LandingPage/WelcomePopup';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [meetings, setMeetings] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
  };

  const handleMeetingAdd = (meeting) => {
    setMeetings(prevMeetings => [...prevMeetings, meeting]);
  };
  const now = new Date();
  const ongoingMeetings = meetings.filter(meeting => {
    const start = new Date(meeting.datetime);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return now >= start && now <= end;
  });

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar} />
      <WelcomePopup />

      <div className="dashboard-body">            
        <Sidebar
          isOpen={isSidebarOpen}
          onMenuSelect={handleMenuSelect}
          ongoingMeetings={ongoingMeetings}
        />                                   
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          {selectedMenu === 'home' && <Home onMeetingAdd={handleMeetingAdd} />}
          {selectedMenu === 'meeting' && <MeetingSchedule meetings={meetings} />}
          {selectedMenu === 'profile' && <ProfileCard />}
        </main>                        
      </div>
    </div>
  );
};

export default Dashboard;
