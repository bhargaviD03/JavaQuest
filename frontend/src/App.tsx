import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodayInstituteTopicPage } from './pages/TodayInstituteTopicPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { ChallengeArenaPage } from './pages/ChallengeArenaPage';
import { AIMentorPage } from './pages/AIMentorPage';
import { CompanionSpacePage } from './pages/CompanionSpacePage';
import { ProjectLabPage } from './pages/ProjectLabPage';
import { ExternalPracticePage } from './pages/ExternalPracticePage';
import { ProfilePage } from './pages/ProfilePage';
import { InteractiveLabPage } from './pages/InteractiveLabPage';
import { GameHubPage } from './pages/GameHubPage';
import { JavaIDEPage } from './pages/JavaIDEPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CreatureCreatorGame } from './games/creature-creator/CreatureCreatorGame';
import { RestaurantTycoonGame } from './games/restaurant-tycoon/RestaurantTycoonGame';
import { SpaceColonyGame } from './games/space-colony/SpaceColonyGame';
import { JavaGameStudioGame } from './games/java-game-studio/JavaGameStudioGame';
import { JavaForensicsGame } from './games/java-forensics/JavaForensicsGame';
import { JavaArchitectureGame } from './games/java-architecture/JavaArchitectureGame';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ide" element={<JavaIDEPage />} />
            <Route path="/games" element={<GameHubPage />} />
            <Route path="/today-topic" element={<TodayInstituteTopicPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/questions" element={<QuestionBankPage />} />
            <Route path="/code-lab" element={<InteractiveLabPage />} />
            <Route path="/arena" element={<ChallengeArenaPage />} />
            <Route path="/mentor" element={<AIMentorPage />} />
            <Route path="/companion" element={<CompanionSpacePage />} />
            <Route path="/projects" element={<ProjectLabPage />} />
            <Route path="/external" element={<ExternalPracticePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Dedicated Fullscreen 2.5D Game Worlds */}
          <Route
            path="/games/creature-creator"
            element={
              <ProtectedRoute>
                <CreatureCreatorGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/restaurant-tycoon"
            element={
              <ProtectedRoute>
                <RestaurantTycoonGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/space-colony"
            element={
              <ProtectedRoute>
                <SpaceColonyGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/java-game-studio"
            element={
              <ProtectedRoute>
                <JavaGameStudioGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/java-forensics"
            element={
              <ProtectedRoute>
                <JavaForensicsGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/java-architecture"
            element={
              <ProtectedRoute>
                <JavaArchitectureGame />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
</ErrorBoundary>
  );
};

export default App;
