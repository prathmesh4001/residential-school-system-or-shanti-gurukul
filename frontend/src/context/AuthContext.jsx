/* ============================================================
   Auth Context — Global auth state + helpers
   ============================================================ */

import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sgUser')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('sgToken', data.token);
      localStorage.setItem('sgUser', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, role: data.user.role };
    } catch (err) {
      // If server is unreachable / offline (network error), provide seamless demo fallback
      if (!err.response) {
        const u = (username || '').toLowerCase().trim();
        const DEMO_ACCOUNTS = {
          admin:                 { passwords: ['admin123', 'admin', 'gurukul@2024'], role: 'admin', name: 'Administrator' },
          'admin@gmail.com':     { passwords: ['admin123', 'admin', 'gurukul@2024'], role: 'admin', name: 'Administrator' },
          principal:             { passwords: ['admin123', 'principal@123'], role: 'principal', name: 'Dr. Ramesh Pawar' },
          'principal@gmail.com': { passwords: ['admin123', 'principal@123'], role: 'principal', name: 'Dr. Ramesh Pawar' },
          teacher:               { passwords: ['teacher123', 'teacher@123'], role: 'teacher', name: 'Mr. Ramesh Gupta' },
          teacher1:              { passwords: ['teacher123', 'teacher@123'], role: 'teacher', name: 'Mr. Ramesh Gupta' },
          'teacher@gmail.com':   { passwords: ['teacher123', 'teacher@123'], role: 'teacher', name: 'Mr. Ramesh Gupta' },
          mentor:                { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)' },
          'mentor@gmail.com':    { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)' },
          'mentor1@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)' },
          'mentor2@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Ramesh Shinde (Residential Mentor)' },
          'mentor3@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Suresh Jadhav (Residential Mentor)' },
          'mentor4@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Deepak Kadam (Residential Mentor)' },
          parent:                { passwords: ['parent123', 'parent@123'], role: 'parent', name: 'Mr. Rajesh Sharma' },
          parent1:               { passwords: ['parent123', 'parent@123'], role: 'parent', name: 'Mr. Rajesh Sharma' },
          'parent@gmail.com':    { passwords: ['parent123', 'parent@123'], role: 'parent', name: 'Mr. Rajesh Sharma' },
        };
        const demo = DEMO_ACCOUNTS[u];
        if (demo && demo.passwords.includes(password)) {
          const fallbackUser = { username: u, role: demo.role, name: demo.name };
          localStorage.setItem('sgToken', 'demo-token-' + demo.role);
          localStorage.setItem('sgUser', JSON.stringify(fallbackUser));
          setUser(fallbackUser);
          return { success: true, role: demo.role };
        }
      }
      return { success: false, error: err.response?.data?.error || 'Login failed. Please check credentials or ensure backend is running.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sgToken');
    localStorage.removeItem('sgUser');
    setUser(null);
  }, []);

  /* Role-based access — mirrors legacy APP.auth.canAccess() */
  const canAccess = useCallback((module) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'principal') return true;
    const teacherModules = ['dashboard','attendance','results','timetable','students','notices','achievements','medical','expenses','mess','teacher-leave','mentor','parent'];
    const mentorModules  = ['dashboard','mentor','attendance','hostel','students','achievements','medical','expenses','mess','teacher-leave','notices','parent'];
    const wardenModules  = mentorModules;
    if (user.role === 'teacher') return teacherModules.includes(module);
    if (user.role === 'mentor')  return mentorModules.includes(module);
    if (user.role === 'warden')  return wardenModules.includes(module);
    if (user.role === 'parent')  return ['parent'].includes(module);
    return false;
  }, [user]);

  const canWrite = useCallback((module) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const principalWrite = ['notices','results','timetable','attendance','achievements','medical','expenses','mess','teacher-leave','mentor','parent'];
    const teacherWrite   = ['attendance','results','achievements','medical','expenses','teacher-leave','mentor'];
    const mentorWrite    = ['mentor','attendance','medical','expenses','mess','teacher-leave','hostel'];
    const wardenWrite    = mentorWrite;
    if (user.role === 'principal') return principalWrite.includes(module);
    if (user.role === 'teacher')   return teacherWrite.includes(module);
    if (user.role === 'mentor')    return mentorWrite.includes(module);
    if (user.role === 'warden')    return wardenWrite.includes(module);
    if (user.role === 'parent')    return ['parent'].includes(module);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canAccess, canWrite, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
