import { Routes, Route } from "react-router-dom";
import { UploadPage } from "./pages/UploadPage";
import { TripList } from "./components/TripList";
import { UpdatesPage } from "./pages/UpdatesPage";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/Login";
import { RequireAuth } from "@/contexts/AuthContext";
import UsersPage from "./pages/UsersPage";
import GPSHistoryPage from "./pages/GPSHistoryPage";
import Dashboard from "./pages/Dashboard";
import { GlobalFilterProvider } from "./contexts/GlobalFilterContext";

export function App() {
  return (
    <GlobalFilterProvider>
      <Toaster position="top-center" duration={4500} richColors />
      <div className="min-h-screen">
        <Routes>
          {/* PUBLIC */}
          <Route path="/login" element={<LoginPage />} />

          {/* PROTECTED */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Sidebar />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Administración */}
            <Route path="users" element={<UsersPage />} />

            {/* Viajes */}
            <Route path="trips" element={<TripList />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="updates" element={<UpdatesPage />} />

            {/* GPS */}
            <Route path="gps-history" element={<GPSHistoryPage />} />
          </Route>
        </Routes>
      </div>
    </GlobalFilterProvider>
  );
}

export default App;
