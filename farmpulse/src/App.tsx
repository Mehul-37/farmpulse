import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import FarmMap from './pages/FarmMap';
import FarmProfiles from './pages/FarmProfiles';
import RiskAnalysis from './pages/RiskAnalysis';
import Alerts from './pages/Alerts';
import InstitutionalReport from './pages/InstitutionalReport';
import Simulator from './pages/Simulator';
import VisionAI from './pages/VisionAI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="map" element={<FarmMap />} />
          <Route path="profiles" element={<FarmProfiles />} />
          <Route path="risk" element={<RiskAnalysis />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="report" element={<InstitutionalReport />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="vision" element={<VisionAI />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
