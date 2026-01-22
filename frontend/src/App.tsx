import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ModeProvider } from './context/ModeContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/Landing/LandingPage';
import ModeSelection from './pages/ModeSelection';

// Home Mode Pages
import PeriodTracker from './pages/HomeMode/PeriodTracker';
import DietPlanner from './pages/HomeMode/DietPlanner';
import AppointmentScheduler from './pages/HomeMode/Appointments';

// Work Mode Pages
import ToneShield from './pages/WorkMode/ToneShield';
import AutoSchedule from './pages/WorkMode/AutoSchedule';
import BurnoutWatch from './pages/WorkMode/Burnout';
import WorkDashboard from './pages/WorkMode/Dashboard';
import Helpline from './pages/WorkMode/Helpline';
import SafeCab from './pages/WorkMode/SafeCab';
import ProfileSetup from './pages/Profile/ProfileSetup';
import ProfileDashboard from './pages/Profile/ProfileDashboard';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <ModeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="mode-select" element={<ModeSelection />} />
                <Route path="profile/setup" element={<ProfileSetup />} />
                <Route path="profile" element={<ProfileDashboard />} />

                {/* Home Mode Routes */}
                <Route path="home" element={<Navigate to="/home/period-tracker" replace />} />
                <Route path="home/dashboard" element={<PeriodTracker />} />
                <Route path="home/period-tracker" element={<PeriodTracker />} />
                <Route path="home/diet-planner" element={<DietPlanner />} />
                <Route path="home/appointments" element={<AppointmentScheduler />} />

                {/* Work Mode Routes */}
                <Route path="work" element={<Navigate to="/work/dashboard" replace />} />
                <Route path="work/dashboard" element={<WorkDashboard />} />
                <Route path="work/tone-shield" element={<ToneShield />} />
                <Route path="work/burnout" element={<BurnoutWatch />} />
                <Route path="work/auto-schedule" element={<AutoSchedule />} />
                <Route path="work/helpline" element={<Helpline />} />
                <Route path="work/cab" element={<SafeCab />} />
              </Route>
            </Routes>
          </AuthProvider>
        </ModeProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
