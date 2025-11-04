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
  VStack,
  ScaleFade,
  keyframes,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

function Login() {
  const bgForm = useColorModeValue("white", "gray.800");
  const redColor = "#C41E3A";
  const lightRed = "#FF6B6B";
  const darkRed = "#B71C1C";
  const fabricBlue = "#2D3748";
  const fabricLight = "#4A5568";
  const fabricDark = "#1A202C";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ identifier: false, password: false });
  const toast = useToast();
  const navigate = useNavigate();

  const floatAnimation = keyframes`
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  `;

  const weaveAnimation = keyframes`
    0% { background-position: 0% 0%; }
    100% { background-position: 100px 100px; }
  `;

  const slideIn = keyframes`
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `;

  const pulseAnimation = keyframes`
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 0.6; }
  `;

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
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
        position: "top",
      });
      return;
    }

    if (isMounted.current) setLoading(true);

    try {
      const payload = { identifier, password };
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.status === 200 && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.role}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        if (data.user.role === "admin" || data.user.role === "owner") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
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
      bg={useColorModeValue("#f8f9fa", "#0f1419")}
    
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: useColorModeValue(
          `linear-gradient(45deg, ${fabricLight} 1px, transparent 1px),
           linear-gradient(-45deg, ${fabricLight} 1px, transparent 1px)`,
          `linear-gradient(45deg, ${fabricBlue} 1px, transparent 1px),
           linear-gradient(-45deg, ${fabricBlue} 1px, transparent 1px)`
        ),
        backgroundSize: "60px 60px",
        backgroundPosition: "0 0, 30px 30px",
        opacity: useColorModeValue(0.1, 0.15),
        animation: `${weaveAnimation} 20s linear infinite`,
        zIndex: 1,
      }}
    >
      {/* Fabric-themed decorative elements */}
      <Box
        position="absolute"
        w="200px"
        h="200px"
        borderRadius="50%"
        bg={`linear-gradient(135deg, ${redColor}20, ${lightRed}30)`}
        top="15%"
        left="10%"
        filter="blur(40px)"
        animation={`${floatAnimation} 8s ease-in-out infinite`}
        zIndex={1}
      />
      
      <Box
        position="absolute"
        w="300px"
        h="300px"
        borderRadius="50%"
        bg={`linear-gradient(135deg, ${fabricBlue}15, ${fabricDark}25)`}
        bottom="10%"
        right="15%"
        filter="blur(50px)"
        animation={`${floatAnimation} 12s ease-in-out infinite`}
        zIndex={1}
      />

      {/* Fabric roll elements */}
      <Box
        position="absolute"
        w="120px"
        h="60px"
        bg={useColorModeValue("#e2e8f0", "#2d3748")}
        borderRadius="30px 8px 8px 30px"
        top="20%"
        right="20%"
        transform="rotate(45deg)"
        boxShadow="0 4px 12px rgba(0,0,0,0.1)"
        animation={`${pulseAnimation} 4s ease-in-out infinite`}
        zIndex={1}
        _before={{
          content: '""',
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          bottom: "10px",
          bg: redColor,
          borderRadius: "20px 4px 4px 20px",
          opacity: 0.7,
        }}
      />

      <Box
        position="absolute"
        w="100px"
        h="50px"
        bg={useColorModeValue("#edf2f7", "#4a5568")}
        borderRadius="25px 6px 6px 25px"
        bottom="25%"
        left="15%"
        transform="rotate(-30deg)"
        boxShadow="0 4px 12px rgba(0,0,0,0.1)"
        animation={`${pulseAnimation} 5s ease-in-out infinite`}
        zIndex={1}
        _before={{
          content: '""',
          position: "absolute",
          top: "8px",
          left: "8px",
          right: "8px",
          bottom: "8px",
          bg: fabricLight,
          borderRadius: "17px 3px 3px 17px",
          opacity: 0.6,
        }}
      />

      {/* Stitching lines */}
      <Box
        position="absolute"
        top="50%"
        left="0"
        right="0"
        height="2px"
        bg={`linear-gradient(90deg, transparent, ${redColor}40, transparent)`}
        transform="translateY(-1px)"
        zIndex={1}
      />
      
      <Box
        position="absolute"
        left="50%"
        top="0"
        bottom="0"
        width="2px"
        bg={`linear-gradient(180deg, transparent, ${redColor}40, transparent)`}
        transform="translateX(-1px)"
        zIndex={1}
      />

      {/* Login Card */}
      <ScaleFade in={true} initialScale={0.9}>
        <Flex
          direction="column"
          zIndex={2}
          w={{ base: "90%", sm: "400px", md: "420px" }}
          borderRadius="20px"
          p={{ base: "30px", md: "40px" }}
          bg={useColorModeValue("rgba(255,255,255,0.95)", "rgba(26,32,44,0.95)")}
          backdropFilter="blur(20px) saturate(180%)"
          border="2px solid"
          borderColor={useColorModeValue(`${redColor}15`, `${redColor}20`)}
          boxShadow={useColorModeValue(
            "0 20px 40px rgba(0,0,0,0.1), 0 8px 24px rgba(196,30,58,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
            "0 20px 40px rgba(0,0,0,0.3), 0 8px 24px rgba(196,30,58,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
          )}
          animation={`${slideIn} 0.6s ease-out`}
          position="relative"
          transition="all 0.3s ease"
          _hover={{
            transform: "scale(1.02)",
            boxShadow: useColorModeValue(
              "0 25px 50px rgba(0,0,0,0.15), 0 12px 30px rgba(196,30,58,0.15)",
              "0 25px 50px rgba(0,0,0,0.4), 0 12px 30px rgba(196,30,58,0.25)"
            ),
            borderColor: useColorModeValue(`${redColor}25`, `${redColor}30`),
          }}
          _before={{
            content: '""',
            position: "absolute",
            top: "2px",
            left: "2px",
            right: "2px",
            bottom: "2px",
            borderRadius: "18px",
            border: `1px solid ${useColorModeValue(`${redColor}10`, `${redColor}15`)}`,
            pointerEvents: "none",
          }}
        >
          {/* Header with fabric icon */}
          <VStack spacing={4} w="100%" mb={4}>
            <Box
              w="60px"
              h="60px"
              borderRadius="15px"
              bgGradient={`linear(135deg, ${redColor}, ${lightRed})`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow={`0 4px 15px ${redColor}30`}
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                top: "15px",
                left: "15px",
                right: "15px",
                bottom: "15px",
                border: "2px solid white",
                borderRadius: "8px",
                opacity: 0.8,
              }}
            >
              <Text fontSize="xl" fontWeight="bold" color="white">
                🧵
              </Text>
            </Box>
            <VStack spacing={1}>
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="extrabold"
                textAlign="center"
                bgGradient={`linear(135deg, ${redColor}, ${lightRed})`}
                bgClip="text"
                letterSpacing="-0.5px"
              >
                Deepthy Fenishers
              </Text>
              <Text
                fontSize="sm"
                color={useColorModeValue("gray.600", "gray.400")}
                textAlign="center"
                fontWeight="medium"
              >
                Inventory Management System
              </Text>
            </VStack>
          </VStack>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <VStack spacing={6} w="100%">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" mb={2} color={useColorModeValue("gray.700", "gray.300")}>
                  Username or Phone
                </FormLabel>
                <Input
                  variant="filled"
                  type="text"
                  placeholder="Enter your username or phone"
                  size="lg"
                  borderRadius="12px"
                  focusBorderColor={redColor}
                  border="2px solid"
                  borderColor={isFocused.identifier ? `${redColor}40` : "transparent"}
                  bg={useColorModeValue("gray.50", "gray.700")}
                  _hover={{
                    bg: useColorModeValue("gray.100", "gray.600"),
                    transform: "scale(1.01)",
                  }}
                  _focus={{
                    bg: useColorModeValue("white", "gray.600"),
                    borderColor: redColor,
                    boxShadow: `0 0 0 3px ${redColor}20`,
                  }}
                  transition="all 0.2s ease"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setIsFocused((prev) => ({ ...prev, identifier: true }))}
                  onBlur={() => setIsFocused((prev) => ({ ...prev, identifier: false }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" mb={2} color={useColorModeValue("gray.700", "gray.300")}>
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    variant="filled"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    borderRadius="12px"
                    focusBorderColor={redColor}
                    border="2px solid"
                    borderColor={isFocused.password ? `${redColor}40` : "transparent"}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    _hover={{
                      bg: useColorModeValue("gray.100", "gray.600"),
                      transform: "scale(1.01)",
                    }}
                    _focus={{
                      bg: useColorModeValue("white", "gray.600"),
                      borderColor: redColor,
                      boxShadow: `0 0 0 3px ${redColor}20`,
                    }}
                    transition="all 0.2s ease"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused((prev) => ({ ...prev, password: true }))}
                    onBlur={() => setIsFocused((prev) => ({ ...prev, password: false }))}
                  />
                  <InputRightElement width="4rem" mr={1}>
                    <IconButton
                      h="2rem"
                      size="sm"
                      borderRadius="8px"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      bg="transparent"
                      color="gray.500"
                      _hover={{
                        bg: useColorModeValue("gray.200", "gray.600"),
                        color: redColor,
                      }}
                      transition="all 0.3s ease"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                fontSize="md"
                bgGradient={`linear(135deg, ${redColor}, ${lightRed})`}
                color="white"
                fontWeight="bold"
                w="100%"
                h="55px"
                borderRadius="12px"
                _hover={{
                  bgGradient: `linear(135deg, ${lightRed}, ${redColor})`,
                  transform: "translateY(-2px) scale(1.02)",
                  boxShadow: `0 8px 25px ${redColor}40`,
                }}
                _active={{
                  transform: "translateY(0)",
                  bgGradient: `linear(135deg, ${darkRed}, ${redColor})`,
                }}
                transition="all 0.3s ease"
                isLoading={loading}
                loadingText="Logging in..."
                boxShadow={`0 4px 15px ${redColor}25`}
              >
                SIGN IN TO DASHBOARD
              </Button>
            </VStack>
          </form>

          <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} textAlign="center" mt={6}>
            Secure fabric inventory management system • v2.4.1
          </Text>
        </Flex>
      </ScaleFade>
    </Flex>
  );
}

export default Login;