import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Issues from './pages/Issues';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import IssueDetail from './pages/IssueDetail';
import MapView from './pages/MapView';
import Auth from './pages/Auth';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Auth page — no navbar */}
            <Route path="/auth" element={<Auth />} />

            {/* All other pages — with navbar */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/issues" element={<Issues />} />
                  <Route path="/issues/:id" element={<IssueDetail />} />
                  <Route path="/report" element={<ReportIssue />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                </Routes>
                <footer className="border-t border-gray-200 bg-white mt-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">© 2026 CityResolve. All rights reserved.</span>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
                      <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
                      <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
                    </div>
                  </div>
                </footer>
              </>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
