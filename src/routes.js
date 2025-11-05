// 📌 Imports
import React from "react";

import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import Billing from "views/Dashboard/Billing.js";
import Profile from "views/Dashboard/Profile.js";
import SignIn from "views/Pages/SignIn.js";
import SignUp from "views/Pages/SignUp.js";
import UserDashboard from "views/UserDashboard/UserDashboard.js";
import UserProfile from "views/UserDashboard/UserProfile.js";
import UserManage from "views/Dashboard/UserManage.js"; 
import AdminManage from "views/Dashboard/AdminManage"; 
import FabricProcessPage from "./components/FabricProcessForm/FabricProcessForm";
import FabricProcessWatercost from "./components/FabricProcessForm/FabricProcessWatercost";
import FabricManagement from "./components/FabricProcessForm/FabricProcessList";

// ✅ Sidebar Icons
import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
  SettingsIcon,
  CartIcon,  
} from "components/Icons/Icons";


// 🌟 Admin & Owner Routes
export const adminRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    element: <Dashboard />,
    layout: "/admin",
    roles: ["admin", "owner"],
  },

  {
    path: "/users-manage",
    name: "User Management",
    icon: <PersonIcon color="inherit" />,
    element: <UserManage />,
    layout: "/admin",
    roles: ["admin", "owner"],
  },

  {
    path: "/admin-manage",
    name: "Admin Management",
    icon: <SettingsIcon color="inherit" />,
    element: <AdminManage />,
    layout: "/admin",
    roles: ["owner"],
  },

  {
    path: "/tables",
    name: "Tables",
    icon: <StatsIcon color="inherit" />,
    element: <Tables />,
    layout: "/admin",
    roles: ["admin", "owner"],
  },

  {
    path: "/billing",
    name: "Billing",
    icon: <CreditIcon color="inherit" />,
    element: <Billing />,
    layout: "/admin",
    roles: ["admin", "owner"],
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
        roles: ["admin", "owner"],
      },
    ],
  },
];


// 🌟 User Routes
export const userRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color="inherit" />,
    element: <UserDashboard />,
    layout: "/user",
    roles: ["user"],
  },

  {
    path: "/fabric-watercost",
    name: "Water Cost",
    icon: <StatsIcon color="inherit" />,
    element: <FabricProcessWatercost />,
    layout: "/user",
    roles: ["user","owner","admin"],
  },

  {
    path: "/fabric-mangement",
    name: "Fabric List",
    icon: <CartIcon color="inherit" />,
    element: <FabricManagement />,
    layout: "/user",
    roles: ["user","owner","admin"],
  },

  {
    path: "/fabric-process",
    name: "Fabric Process",
    icon: <RocketIcon color="inherit" />,
    element: <FabricProcessPage />,
    layout: "/user",
    roles: ["user","owner","admin"],
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
        path: "/user-profile",
        name: "Profile",
        icon: <PersonIcon color="inherit" />,
        element: <UserProfile />,
        layout: "/user",
        roles: ["user"],
      },
    ],
  },
];


// ✅ Auth Routes
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
    layout: "/admin",
    roles: [],
  },
];

// ✅ Export all
const allRoutes = [...adminRoutes, ...userRoutes, ...authRoutes];
export default allRoutes;
