import Carousel from './Carousel';
import "../styles/home.css";

import MeetingPanel from './MeetingPanel';

const Home = ({ onMeetingAdd }) => (
  <main className="content">
      <MeetingPanel onMeetingAdd={onMeetingAdd} />
      <Carousel />
  </main>
);

export default Home;
