import { Suspense } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Dashboard from './components/Dashboard'
import AuthPage from './components/LandingPage/AuthPage'
import Loader from './components/LandingPage/Loader'
import { Route, Routes } from 'react-router-dom'
import MeetingRoom from './components/MeetingRoom'

export const baseUrl = "http://localhost:5000"

function App() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:id" element={<MeetingRoom />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
