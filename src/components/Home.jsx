import Carousel from './Carousel';
import "../styles/home.css";

import MeetingPanel from './MeetingPanel';

const Home = ({ onMeetingAdd }) => (
  <main className="content">
    <div className='.meeting-panel-wrapper'>
      <MeetingPanel onMeetingAdd={onMeetingAdd} />
    </div>
    <div className="carousel-wrapper">
      <Carousel />
    </div>
  </main>
);

export default Home;
