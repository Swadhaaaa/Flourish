import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { SchedulePage } from "./pages/dashboard/SchedulePage";
import { ToneShieldPage } from "./pages/dashboard/ToneShieldPage";
import { WorkloadPage } from "./pages/dashboard/WorkloadPage";
import { WellnessPage } from "./pages/dashboard/WellnessPage";
import { BurnoutAssessment } from "./pages/BurnoutAssessment";
import { ProfilePage } from "./pages/dashboard/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="workload" element={<WorkloadPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="shield" element={<ToneShieldPage />} />
          <Route path="wellness" element={<WellnessPage />} />
          <Route path="assessment" element={<BurnoutAssessment />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<div className="text-white p-8">Settings Page Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
