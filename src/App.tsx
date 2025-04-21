import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster as ToasterToast } from "react-hot-toast";
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

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" duration={4500} richColors={true} />
        <div className="min-h-screen bg-gray-100">
          <ToasterToast position="top-right" />
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
                {/* Administración */}
                <Route path="/users" element={<UsersPage />} />

                {/* Viajes */}
                <Route index element={<TripList />} />
                <Route path="/new-trip" element={<AddPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/updates" element={<UpdatesPage />} />

                {/* GPS */}
                <Route path="/gps-history" element={<GPSHistoryPage />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
