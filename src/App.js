import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentRegistration from './pages/StudentRegistration';
import BoutTracker from './pages/BoutTracker';
import Statistics from './pages/Statistics';
import { StudentProvider } from './context/StudentContext';
import { BoutProvider } from './context/BoutContext';
import './App.css';

function App() {
  return (
    <StudentProvider>
      <BoutProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<StudentRegistration />} />
            <Route path="/bout" element={<BoutTracker />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </BoutProvider>
    </StudentProvider>
  );
}

export default App; 