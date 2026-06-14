import { useState } from 'react'
import './App.css'
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AIInterview from "./pages/AIInterview";
import InterviewSetup from './pages/InterviewSetup';
import Analytics from "./pages/Analytics";
import InterviewHistory from "./pages/InterviewHistory";
import Support from "./pages/support";
import InterviewResult from './pages/InterviewResult';
import AppLayout from "./Layouts/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Page */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App Layout Routes - Protected */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/interview" element={<InterviewSetup />} />
          <Route path="/interview/:sessionId" element={<AIInterview />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/history" element={<InterviewHistory />} />

          <Route path="/support" element={<Support />} />

          <Route path="/ResumeAnalyzer" element={<ResumeAnalyzer />} />

          <Route
            path="/interview-result/:sessionId" element={<InterviewResult />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App
