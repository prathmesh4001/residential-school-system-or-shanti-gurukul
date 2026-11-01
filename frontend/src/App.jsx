/* ============================================================
   App.jsx — Root Router
   ============================================================ */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LoginPage        from './pages/LoginPage';
import DashboardPage    from './pages/DashboardPage';
import StudentsPage     from './pages/StudentsPage';
import StaffPage        from './pages/StaffPage';
import AttendancePage   from './pages/AttendancePage';
import FeesPage         from './pages/FeesPage';
import ResultsPage      from './pages/ResultsPage';
import HostelPage       from './pages/HostelPage';
import MentorPage       from './pages/MentorPage';
import ParentPage       from './pages/ParentPage';
import TeacherLeavePage from './pages/TeacherLeavePage';
import TimetablePage    from './pages/TimetablePage';
import AchievementsPage from './pages/AchievementsPage';
import MedicalPage      from './pages/MedicalPage';
import ExpensesPage     from './pages/ExpensesPage';
import MessPage         from './pages/MessPage';
import NoticesPage      from './pages/NoticesPage';

/* Protected route wrapper */
function ProtectedRoute({ children, module }) {
  const { isLoggedIn, canAccess } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (module && !canAccess(module)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { isLoggedIn, user } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={isLoggedIn ? <Navigate to={user?.role === 'parent' ? '/parent' : '/dashboard'} replace /> : <LoginPage />} />

      {/* Protected Pages */}
      <Route path="/dashboard"     element={<ProtectedRoute module="dashboard">    <DashboardPage />    </ProtectedRoute>} />
      <Route path="/students"      element={<ProtectedRoute module="students">     <StudentsPage />     </ProtectedRoute>} />
      <Route path="/staff"         element={<ProtectedRoute module="staff">        <StaffPage />        </ProtectedRoute>} />
      <Route path="/attendance"    element={<ProtectedRoute module="attendance">   <AttendancePage />   </ProtectedRoute>} />
      <Route path="/fees"          element={<ProtectedRoute module="fees">         <FeesPage />         </ProtectedRoute>} />
      <Route path="/results"       element={<ProtectedRoute module="results">      <ResultsPage />      </ProtectedRoute>} />
      <Route path="/hostel"        element={<ProtectedRoute module="hostel">       <HostelPage />       </ProtectedRoute>} />
      <Route path="/mentor"        element={<ProtectedRoute module="mentor">       <MentorPage />       </ProtectedRoute>} />
      <Route path="/parent"        element={<ProtectedRoute module="parent">       <ParentPage />       </ProtectedRoute>} />
      <Route path="/teacher-leave" element={<ProtectedRoute module="teacher-leave"><TeacherLeavePage /> </ProtectedRoute>} />
      <Route path="/timetable"     element={<ProtectedRoute module="timetable">    <TimetablePage />    </ProtectedRoute>} />
      <Route path="/achievements"  element={<ProtectedRoute module="achievements"> <AchievementsPage /> </ProtectedRoute>} />
      <Route path="/medical"       element={<ProtectedRoute module="medical">      <MedicalPage />      </ProtectedRoute>} />
      <Route path="/expenses"      element={<ProtectedRoute module="expenses">     <ExpensesPage />     </ProtectedRoute>} />
      <Route path="/mess"          element={<ProtectedRoute module="mess">         <MessPage />         </ProtectedRoute>} />
      <Route path="/notices"       element={<ProtectedRoute module="notices">      <NoticesPage />      </ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
