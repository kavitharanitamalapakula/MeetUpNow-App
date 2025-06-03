import { FaHome, FaVideo, FaUserCircle, FaVideoSlash } from 'react-icons/fa';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onMenuSelect, }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav>
        <ul>
          <li onClick={() => onMenuSelect('home')}>
            <div className="menu-item" style={{cursor: "pointer"}}>
              <FaHome className="icon" />
              <span className="label">Home</span>
            </div>
          </li>
          <li onClick={() => onMenuSelect('meeting')}>
            <div className="menu-item" style={{cursor: "pointer"}}>
              <FaVideo className="icon" />
              <span className="label">Meetings</span>
            </div>
          </li>
          <li onClick={() => onMenuSelect('profile')}>
            <div className="menu-item" style={{cursor: "pointer"}}>
              <FaUserCircle className="icon" />
              <span className="label">Profile</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
