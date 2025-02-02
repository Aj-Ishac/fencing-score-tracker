import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import StudentRegistration from './pages/StudentRegistration';
import BoutTracker from './pages/BoutTracker';
import Statistics from './pages/Statistics';
import Leaderboards from './pages/Leaderboards';
import Auth from './components/Auth';
import { DataProvider } from './context/DataContext';
import SetPassword from './components/SetPassword';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import NameRegistration from './components/NameRegistration';
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
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/name-registration" element={<NameRegistration />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </DataProvider>
  );
}

export default App; 