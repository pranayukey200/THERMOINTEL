import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ThreatProfilesPage from './pages/ThreatProfilesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import ContactPage from './pages/ContactPage';
import ReportPage from './pages/ReportPage';
import { LanguageProvider } from './context/LanguageContext';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="territory" element={<MapPage />} />
            <Route path="threat-profiles" element={<ThreatProfilesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="explainability" element={<ExplainabilityPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
