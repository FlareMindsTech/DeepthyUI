/*eslint-disable*/
import { Flex, Link, List, Text, Box, keyframes } from "@chakra-ui/react";
import React from "react";

export default function Footer(props) {
  // Smooth heartbeat animation
  const heartbeat = keyframes`
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1.3); }
    75% { transform: scale(1.2); }
  `;

  return (
    <Flex
      flexDirection={{ base: "column", xl: "row" }}
      alignItems={{ base: "center", xl: "start" }}
      justifyContent="space-between"
      px="30px"
      pb="20px"
    >
      <Text
        color="#C41E3A"
        textAlign={{ base: "center", xl: "start" }}
        mb={{ base: "20px", xl: "0px" }}
      >
        &copy; {1900 + new Date().getYear()}, Made with{" "}
        <Box
          as="span"
          display="inline-block"
          animation={`${heartbeat} 2s infinite`}
        >
          ❤️
        </Box>{" "}
        by{" "}
        <Link
          color="#C41E3A"
          href="https://flaremindstech.com/"
          target="_blank"
          _hover={{ color: "#FF6B81" }}
        >
          Flareminds
        </Link>
      </Text>
      <List display="flex">{/* Add additional links/items here if needed */}</List>
    </Flex>
  );
}
