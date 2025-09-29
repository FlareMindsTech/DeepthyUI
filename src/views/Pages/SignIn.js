import React, { useState, useEffect } from "react";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
// Assets
import signInImage from "assets/img/signInImage.png";

function Login() {
  const bgForm = useColorModeValue("white", "navy.800");
  const redColor = "#C41E3A";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const ADMIN_PHONE = "1234567890";
  const ADMIN_PASSWORD = "admin123";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      window.location.href = "/admin/dashboard";
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Phone number or password is incorrect.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      align="center"
      justify="center"
      overflow="hidden"
      px={{ base: 3, md: 0 }} // padding for mobile
    >
      {/* Login Form */}
      <Flex
        zIndex="2"
        direction="column"
        w={{ base: "90%", sm: "400px", md: "445px" }}
        borderRadius="20px"
        p={{ base: "30px", md: "40px" }}
        bg={bgForm}
        boxShadow={useColorModeValue(
          "0px 8px 30px rgba(0, 0, 0, 0.1)",
          "0px 8px 30px rgba(0, 0, 0, 0.4)"
        )}
      >
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="extrabold"
          textAlign="center"
          mb={{ base: "20px", md: "28px" }}
          bgGradient={`linear(to-r, ${redColor}, #FF6B6B)`}
          bgClip="text"
        >
          Admin Login
        </Text>

        <form onSubmit={handleLogin}>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">Phone Number</FormLabel>
            <Input
              variant="auth"
              type="tel"
              placeholder="Enter phone number"
              mb="20px"
              size="lg"
              borderRadius="12px"
              focusBorderColor={redColor}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <FormLabel fontSize="sm" fontWeight="semibold">Password</FormLabel>
            <InputGroup size="lg" mb="20px">
              <Input
                variant="auth"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                borderRadius="12px"
                focusBorderColor={redColor}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="3rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                />
              </InputRightElement>
            </InputGroup>

            <Button
              type="submit"
              fontSize="sm"
              bg={redColor}
              color="white"
              fontWeight="bold"
              w="100%"
              h="50px"
              borderRadius="12px"
              _hover={{ bg: "#FF6B6B" }}
              _active={{ bg: "#B71C1C" }}
              transition="all 0.3s"
            >
              LOGIN
            </Button>
          </FormControl>
        </form>
      </Flex>

      {/* Background */}
      <Box
        position="absolute"
        w="100%"
        h="100%"
        left="0"
        top="0"
        bgImage={signInImage}
        bgSize="cover"
        bgPosition="center"
        zIndex="1"
      >
        <Box w="100%" h="100%" bg={redColor} opacity="0.75"></Box>
      </Box>
    </Flex>
  );
}

export default Login;
