// 📌 Imports
import React from "react";
import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import Billing from "views/Dashboard/Billing.js";
import Profile from "views/Dashboard/Profile.js";
import SignIn from "views/Pages/SignIn.js";
import SignUp from "views/Pages/SignUp.js";
import UserDashboard from "views/UserDashboard/UserDashboard.js";
import FabricProcessPage from "./components/FabricProcessForm/FabricProcessPage"; 
import UserProfile from "views/UserDashboard/UserProfile.js";

import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
} from "components/Icons/Icons";

// 🌟 Admin Routes
export const adminRoutes = [
  {
    path: "/dashboard",
    name: "Admin Dashboard",
    icon: <HomeIcon color="inherit" />,
    element: <Dashboard />,
    layout: "/admin",
    roles: ["admin"],
  },
  {
    path: "/tables",
    name: "Tables",
    icon: <StatsIcon color="inherit" />,
    element: <Tables />,
    layout: "/admin",
    roles: ["admin"],
  },
  {
    path: "/billing",
    name: "Billing",
    icon: <CreditIcon color="inherit" />,
    element: <Billing />,
    layout: "/admin",
    roles: ["admin"],
  },
  {
    name: "ACCOUNT PAGES",
    category: "account",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Profile",
        icon: <PersonIcon color="inherit" />,
        element: <Profile />,
        layout: "/admin",
        roles: ["admin"],
      },
    ],
  },
];

// 🌟 User Routes (Separate)
export const userRoutes = [
  {
    path: "/dashboard",
    name: "User Dashboard",
    icon: <HomeIcon color="inherit" />,
    element: <UserDashboard />,
    layout: "/user",
    roles: ["user"],
  },
  {
    path: "/fabric-process",
    name: "Fabric Process",
    icon: <StatsIcon color="inherit" />,
    element: <FabricProcessPage />,
    layout: "/user",
    roles: ["user"],
  },
  {
    path: "/billing",
    name: "Billing",
    icon: <CreditIcon color="inherit" />,
    element: <Billing />,
    layout: "/user",
    roles: ["user"],
  },
  {
    name: "ACCOUNT PAGES",
    category: "account",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Profile",
        icon: <PersonIcon color="inherit" />,
        element: <UserProfile />,  // 👈 Updated to use UserProfile
        layout: "/user",
        roles: ["user"],
      },
    ],
  },
];

// 🌟 Auth Routes
export const authRoutes = [
  {
    path: "/signin",
    name: "Sign In",
    icon: <DocumentIcon color="inherit" />,
    element: <SignIn />,
    layout: "/auth",
    roles: ["guest"],
  },
  {
    path: "/signup",
    name: "Sign Up",
    icon: <RocketIcon color="inherit" />,
    element: <SignUp />,
    layout: "/auth",
    roles: ["guest"],
  },
];

// ✅ Combine all routes if needed
const allRoutes = [...adminRoutes, ...userRoutes, ...authRoutes];
export default allRoutes;
