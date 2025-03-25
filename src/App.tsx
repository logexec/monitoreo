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
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";

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
                <Route index element={<TripList />} />
                <Route path="/new-trip" element={<AddPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/updates" element={<UpdatesPage />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
