// Chakra imports
import {
  Portal,
  useDisclosure,
  Stack,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import Footer from "components/Footer/Footer.js";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";
// Layout components
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js";
import MainPanel from "components/Layout/MainPanel";
import PanelContainer from "components/Layout/PanelContainer";
import PanelContent from "components/Layout/PanelContent";
import { Helmet } from "react-helmet-async";

// ✅ Background images
import bgLight from "../assets/img/admin-backgroud-red.png";
import bgDark from "../assets/img/admin-background-dark.png";

export default function Dashboard(props) {
  const { ...rest } = props;
  const [fixed, setFixed] = useState(false);
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ Route helpers
  const getRoute = () => window.location.pathname !== "/admin/full-screen-maps";

  const getActiveRoute = (routes) => {
    let activeRoute = "Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) return collapseActiveRoute;
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) return categoryActiveRoute;
      } else {
        if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1)
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
      } else {
        if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
          if (routes[i].secondaryNavbar) return routes[i].secondaryNavbar;
        }
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) return getRoutes(prop.views);
      if (prop.category === "account") return getRoutes(prop.views);
      if (prop.layout === "/admin")
        return <Route path={prop.path} element={prop.element} key={key} />;
      return null;
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Deepthy Fenishers</title>
      </Helmet>
      <Box position="relative" minH="100vh">
        {/* ✅ Background layer */}
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100%"
          minH="15vh"
          bgImage={colorMode === "light" ? `url(${bgLight})` : `url(${bgDark})`}
          bgColor={colorMode === "dark" ? "navy.900" : "transparent"}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          zIndex="0"
        />

        {/* ✅ Sidebar (above background) */}
        <Sidebar
          routes={routes.filter((r) => r.name !== "Settings")}
          logo={
            <Stack direction="row" spacing="12px" align="center" justify="center">
              {colorMode === "dark" ? (
                <ArgonLogoLight w="74px" h="27px" />
              ) : (
                <ArgonLogoDark w="74px" h="27px" />
              )}
              <Box
                w="1px"
                h="20px"
                bg={colorMode === "dark" ? "white" : "gray.700"}
              />
              {colorMode === "dark" ? (
                <ChakraLogoLight w="82px" h="21px" />
              ) : (
                <ChakraLogoDark w="82px" h="21px" />
              )}
            </Stack>
          }
          zIndex="10"
          {...rest}
        />

        {/* ✅ Main Panel */}
        <MainPanel w={{ base: "100%", xl: "calc(100% - 275px)" }} zIndex="-5">
          <Portal>
            <AdminNavbar
              onOpen={onOpen}
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
              fixed={fixed}
              zIndex="20"
              {...rest}
            />
          </Portal>

          {/* ✅ Push content below navbar */}
          <Box mt="90px" zIndex="5" position="relative">
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
          </Box>

          <Footer zIndex="5" />
        </MainPanel>
      </Box>
    </>
  );
}
