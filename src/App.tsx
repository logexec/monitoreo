import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster as ToasterToast } from "react-hot-toast";
// import { Navigation } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
import { AddPage } from "./pages/AddPage";
import { UploadPage } from "./pages/UploadPage";
import { TripList } from "./components/TripList";
import { UpdatesPage } from "./pages/UpdatesPage";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./components/Sidebar";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  const { session } = useAuth();

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <ToasterToast position="top-right" />
        {/* {session && <Navigation />} */}

        <Routes>
          <Route path="/" element={session ? <Sidebar /> : <HomePage />}>
            <Route index element={<TripList />} />
            <Route
              path="/new-trip"
              element={
                <PrivateRoute>
                  <AddPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/updates"
              element={
                <PrivateRoute>
                  <UpdatesPage />
                </PrivateRoute>
              }
            />
            {/* <Route
              path="/mysql"
              element={
                <PrivateRoute>
                  <MySQLConnectionPage />
                </PrivateRoute>
              }
            /> */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
