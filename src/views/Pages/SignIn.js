import React, { useState, useEffect, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
import signInImage from "assets/img/signInImage.png";

function Login() {
  const bgForm = useColorModeValue("white", "navy.800");
  const redColor = "#C41E3A";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both phone/name and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isMounted.current) setLoading(true);

    try {
      const payload = { identifier, password };
      console.log("Login payload:", payload);

      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials");

      // ✅ Save JWT token
      localStorage.setItem("token", data.token);

      // ✅ Save User Info with `_id`
      const userObj = {
        _id: data.user.id,   // convert id → _id for consistency
        name: data.user.name,
        phone: data.user.phone,
        role: data.user.role,
      };

      localStorage.setItem("user", JSON.stringify(userObj));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.role}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(
        data.user.role === "owner" || data.user.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard"
      );
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      toast({
        title: "Login Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      align="center"
      justify="center"
      overflow="hidden"
      px={{ base: 3, md: 0 }}
    >
      <Flex
        zIndex={2}
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
          Login
        </Text>

        <form onSubmit={handleLogin}>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold">
              Phone Number or Name
            </FormLabel>
            <Input
              variant="filled"
              type="text"
              placeholder="Enter phone number or name"
              mb="20px"
              size="lg"
              borderRadius="12px"
              focusBorderColor={redColor}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <FormLabel fontSize="sm" fontWeight="semibold">
              Password
            </FormLabel>
            <InputGroup size="lg" mb="20px">
              <Input
                variant="filled"
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
              _hover={{ backgroundColor: "#FF6B6B" }}
              _active={{ backgroundColor: "#B71C1C" }}
              transition="all 0.3s"
              isLoading={loading}
              loadingText="Logging in..."
            >
              LOGIN
            </Button>
          </FormControl>
        </form>
      </Flex>

      <Box
        position="absolute"
        w="100%"
        h="100%"
        left={0}
        top={0}
        bgImage={signInImage}
        bgSize="cover"
        bgPosition="center"
        zIndex={1}
      >
        <Box w="100%" h="100%" bg={redColor} opacity={0.75}></Box>
      </Box>
    </Flex>
  );
}

export default Login;
