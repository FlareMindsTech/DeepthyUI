// Chakra imports
import {
  Portal,
  useDisclosure,
  Stack,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import Footer from "../components/Footer/Footer";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";
// Layout components
import UserNavbar from "../components/Navbars/UserNavbar.js"; // <-- User navbar
import Sidebar from "../components/Sidebar/Sidebar.js";
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes.js"; // make sure this includes /user/* routes
import MainPanel from "../components/Layout/MainPanel";
import PanelContainer from "../components/Layout/PanelContainer";
import PanelContent from "../components/Layout/PanelContent";

import { Helmet } from "react-helmet-async";

// ✅ Updated imports for background images
import bgLight from "../assets/img/admin-backgroud-red.png";
import bgDark from "../assets/img/admin-background-dark.png";

export default function UserDashboard(props) {
  const { ...rest } = props;
  const [fixed, setFixed] = useState(false);
  const { colorMode } = useColorMode();

  const getRoute = () => window.location.pathname !== "/user/full-screen-maps";

  const getActiveRoute = (routes) => {
    let activeRoute = "User Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) return collapseActiveRoute;
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) return categoryActiveRoute;
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        )
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
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
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
      if (prop.layout === "/user")
        // <-- change admin to user
        return <Route path={prop.path} element={prop.element} key={key} />;
      return null;
    });
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  document.documentElement.dir = "ltr";

  return (
    <>
      <Helmet>
        <title>User Dashboard | Deepthy Fenishers</title>
      </Helmet>
      <Box>
        {/* ✅ Background box for light/dark mode */}
        <Box
          minH="15vh"
          w="100%"
          position="fixed"
          top="0"
          bgImage={colorMode === "light" ? `url(${bgLight})` : `url(${bgDark})`}
          bgColor={colorMode === "dark" ? "navy.900" : "transparent"}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          zIndex="0" // ⚡ Lower background
        />

        {/* ✅ Sidebar under header */}
        <Sidebar
          routes={routes}
          logo={
            <Stack
              direction="row"
              spacing="12px"
              align="center"
              justify="center"
            >
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
          zIndex="10" // ⚡ Sidebar below header
          {...rest}
        />

        <MainPanel
          w={{ base: "100%", xl: "calc(100% - 275px)" }}
          zIndex="-5"
          marginTop="10"
        >
          <Portal>
            <UserNavbar
              onOpen={onOpen}
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
              fixed={fixed}
              zIndex="20" // ⚡ Navbar on top of everything except modals
              {...rest}
            />
          </Portal>

          {getRoute() ? (
            <PanelContent zIndex="5" position="relative">
              <PanelContainer>
                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/user"
                    element={<Navigate to="/user/dashboard" replace />}
                  />
                </Routes>
              </PanelContainer>
            </PanelContent>
          ) : null}

          {/* <Footer zIndex="5" /> */}
        </MainPanel>
      </Box>
    </>
  );
}
