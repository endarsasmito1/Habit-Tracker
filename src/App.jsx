import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import HabitDetail from './pages/HabitDetail';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import Auth from './pages/Auth';
import RequireAuth from './components/RequireAuth';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="habits" element={<Habits />} />
            <Route path="habits/:id" element={<HabitDetail />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="insights" element={<Insights />} />
            <Route path="profile" element={<Profile />} />
            <Route path="analytics" element={<Navigate to="/insights" replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
