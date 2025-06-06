import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AddPage } from "./pages/AddPage";
import { UploadPage } from "./pages/UploadPage";
import { TripList } from "./components/TripList";
import { UpdatesPage } from "./pages/UpdatesPage";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./components/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/Login";
import { RequireAuth } from "./components/RequireAuth";
import UsersPage from "./pages/UsersPage";
import GPSHistoryPage from "./pages/GPSHistoryPage";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import { GlobalFilterProvider } from "./contexts/GlobalFilterContext";

export function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalFilterProvider>
          <Toaster position="top-center" duration={4500} richColors={true} />
          <div className="min-h-screen">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Sidebar />
                    </RequireAuth>
                  }
                >
                  <Route path="/" element={<Dashboard />} index />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Administración */}
                  <Route path="/users" element={<UsersPage />} />

                  {/* Viajes */}
                  <Route path="/trips" element={<TripList />} />
                  <Route path="/new-trip" element={<AddPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/updates" element={<UpdatesPage />} />

                  {/* GPS */}
                  <Route path="/gps-history" element={<GPSHistoryPage />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </GlobalFilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
