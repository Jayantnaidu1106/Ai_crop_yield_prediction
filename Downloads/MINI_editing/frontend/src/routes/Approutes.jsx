import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Project from '../screens/Project';
import SocketTest from '../screens/SocketTest';
import UserAuth from '../auth/userAuth';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<UserAuth><Home /></UserAuth>} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Project routes */}
        <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
        <Route path="/project/:id" element={<UserAuth><Project /></UserAuth>} />

        {/* Socket.IO Test route */}
        <Route path="/socket-test" element={<UserAuth><SocketTest /></UserAuth>} />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;