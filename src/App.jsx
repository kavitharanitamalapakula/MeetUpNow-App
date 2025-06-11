import { Suspense, lazy } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Loader from './components/LandingPage/Loader';
import { Route, Routes } from 'react-router-dom';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AuthPage = lazy(() => import('./components/LandingPage/AuthPage'));
const MeetingRoom = lazy(() => import('./components/MeetingRoom'));

// export const baseUrl = "http://localhost:5000";
export const baseUrl = "https://meetupnow-server.onrender.com"

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:id" element={<MeetingRoom />} />
      </Routes>
    </Suspense>
  );
}

export default App;
