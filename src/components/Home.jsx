import Carousel from './Carousel';
import "../styles/home.css"
import MeetingPanel from './MeetingPanel';

const Home = ({ onMeetingAdd }) => (
  <main className="content">
      <MeetingPanel  onMeetingAdd={onMeetingAdd}/>
    <div className="carousel">
      <Carousel />
    </div>
  </main>
);

export default Home;
