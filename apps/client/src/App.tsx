import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PracticePage from './pages/PracticePage';
import ExamPage from './pages/ExamPage';
import CurriculumPage from './pages/CurriculumPage';
import LearningPage from './pages/LearningPage';

function App() {
  return (
    <AuthProvider>
      <CurriculumProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <PracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam"
          element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/curriculum"
          element={
            <ProtectedRoute>
              <CurriculumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={['admin', 'instructor']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      </CurriculumProvider>
    </AuthProvider>
  );
}

export default App;
