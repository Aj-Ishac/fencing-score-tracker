import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import StudentRegistration from './pages/StudentRegistration';
import BoutTracker from './pages/BoutTracker';
import Statistics from './pages/Statistics';
import { DataProvider } from './context/DataContext';
import './App.css';

function App() {
  return (
    <DataProvider>
      <div className="App">
        <Navigation />
        <div className="content">
          <Routes>
            <Route path="/" element={<StudentRegistration />} />
            <Route path="/bout-tracker" element={<BoutTracker />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </div>
    </DataProvider>
  );
}

export default App; 