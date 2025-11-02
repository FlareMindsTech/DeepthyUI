// Chakra imports
import {
  Portal,
  useDisclosure,
  Stack,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";

import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js";
import { Helmet } from "react-helmet-async";

// Components
import Sidebar, { SidebarResponsive } from "components/Sidebar/Sidebar.js";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import MainPanel from "components/Layout/MainPanel";
import PanelContainer from "components/Layout/PanelContainer";
import PanelContent from "components/Layout/PanelContent";
import Footer from "components/Footer/Footer.js";

// ✅ Your logos (NO CHANGE to header logos)
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";

// ✅ Background images
import bgLight from "../assets/img/admin-backgroud-red.png";
import bgDark from "../assets/img/admin-background-dark.png";

export default function Dashboard(props) {
  const { ...rest } = props;
  const [fixed, setFixed] = useState(false);
  const { colorMode } = useColorMode();

  // Drawer states
  const {
    isOpen: isSidebarOpen,
    onOpen: onSidebarOpen,
    onClose: onSidebarClose,
  } = useDisclosure();

  document.documentElement.dir = "ltr";

  // ROUTES
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) return getRoutes(prop.views);
      if (prop.category === "account") return getRoutes(prop.views);
      if (prop.layout === "/auth") return null;
      if (prop.layout === "/admin") {
        return <Route path={prop.path} element={prop.element} key={key} />;
      }
      return null;
    });
  };

  const getRoute = () =>
    window.location.pathname !== "/admin/full-screen-maps";

  const getActiveRoute = (routes) => {
    let activeRoute = "Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) return collapseActiveRoute;
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) return categoryActiveRoute;
      } else if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].name;
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views);
        if (categoryActiveNavbar !== activeNavbar) return categoryActiveNavbar;
      } else if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        if (routes[i].secondaryNavbar) return routes[i].secondaryNavbar;
      }
    }
    return activeNavbar;
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Deepthy Fenishers</title>
      </Helmet>

      {/* ✅ Top Background bar */}
      <Box
        minH="15vh"
        w="100%"
        position="fixed"
        top="0"
        bgImage={colorMode === "light" ? `url(${bgLight})` : `url(${bgDark})`}
        bgSize="cover"
        bgRepeat="no-repeat"
        zIndex="0"
      />

      {/* ✅ Mobile Sidebar */}
      <SidebarResponsive
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            {colorMode === "dark" ? (
              <ArgonLogoLight w="74px" h="27px" />
            ) : (
              <ArgonLogoDark w="74px" h="27px" />
            )}
          </Stack>
        }
        routes={routes}
        isOpen={isSidebarOpen}
        onOpen={onSidebarOpen}
        onClose={onSidebarClose}
      />

      {/* ✅ Desktop Sidebar */}
      <Sidebar
        routes={routes}
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            {colorMode === "dark" ? (
              <ArgonLogoLight w="74px" h="27px" />
            ) : (
              <ArgonLogoDark w="74px" h="27px" />
            )}
            <Box w="1px" h="20px" bg="gray.500" />
          </Stack>
        }
        {...rest}
      />

      {/* ✅ Main Content */}
      <MainPanel
        w={{ base: "100%", xl: "calc(100% - 275px)" }}
        ml={{ base: "0px", xl: "275px" }}
        transition="all 0.3s ease"
      >
        <Portal>
          <AdminNavbar
            onOpen={onSidebarOpen}
            brandText={getActiveRoute(routes)}
            secondary={getActiveNavbar(routes)}
            fixed={fixed}
            {...rest}
          />
        </Portal>

        <Box mt="90px">
          {getRoute() ? (
            <PanelContent>
              <PanelContainer>
                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/admin"
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                </Routes>
              </PanelContainer>
            </PanelContent>
          ) : null}

          <Footer />
        </Box>
      </MainPanel>
    </>
  );
}
