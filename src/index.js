import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { HelmetProvider } from "react-helmet-async";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import UserLayout from "layouts/User.js"; // 👈 User layout
import UserDashboard from "views/UserDashboard/UserDashboard.js"; // 👈 User dashboard
import FabricProcessPage from "./components/FabricProcessForm/FabricProcessForm";
import FabricProcessWatercost from "./components/FabricProcessForm/FabricProcessWatercost";
import FabricManagement from "./components/FabricProcessForm/FabricProcessList";



import theme from "theme/theme.js";

// Default page is login
ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HelmetProvider>
        <HashRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/auth/*" element={<AuthLayout />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<Navigate to="/admin/dashboard" replace />} />
              {/* Add other admin routes here */}
            </Route>

            {/* User routes */}
            <Route path="/user/*" element={<UserLayout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="fabric-process" element={<FabricProcessPage />} />
              <Route path="watercost" element={<FabricProcessWatercost />} /> {/* ✅ Added this */}
              <Route path="fabric-mangement" element={<FabricManagement />} /> {/* ✅ Added this */}
              {/* Add other user routes here */}

            </Route>

            {/* Default route → login */}
            <Route path="/" element={<Navigate to="/auth/signin" replace />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<Navigate to="/auth/signin" replace />} />
          </Routes>
        </HashRouter>
      </HelmetProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
