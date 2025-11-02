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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ identifier: false, password: false });
  const toast = useToast();
  const navigate = useNavigate();

  const floatAnimation = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;

  const slideIn = keyframes`
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
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
      bg={useColorModeValue("white", "gray.900")}
    >
      {/* Login Card */}
      <ScaleFade in={true} initialScale={0.9}>
        <Flex
          direction="column"
          zIndex={2}
          w={{ base: "90%", sm: "400px", md: "420px" }}
          borderRadius="24px"
          p={{ base: "30px", md: "40px" }}
          bg={bgForm}
          border="1px solid"
          borderColor={useColorModeValue(`${redColor}30`, `${redColor}40`)}
          boxShadow="0 8px 30px rgba(0,0,0,0.08)"
          animation={`${slideIn} 0.6s ease-out`}
          position="relative"
          transition="all 0.3s ease"
          _hover={{
            transform: "scale(1.02)",
            boxShadow: `0px 15px 35px ${redColor}35`,
            borderColor: lightRed,
          }}
        >
          <VStack spacing={6} w="100%">
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="extrabold"
              textAlign="center"
              bgGradient={`linear(135deg, ${redColor}, ${lightRed})`}
              bgClip="text"
              letterSpacing="-0.5px"
            >
              Login
            </Text>

            <form onSubmit={handleLogin} style={{ width: "100%" }}>
              <VStack spacing={6} w="100%">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>
                    Phone Number or Name
                  </FormLabel>
                  <Input
                    variant="filled"
                    type="text"
                    placeholder="Enter phone number or name"
                    size="lg"
                    borderRadius="14px"
                    focusBorderColor={redColor}
                    border="2px solid"
                    borderColor={isFocused.identifier ? `${redColor}50` : "transparent"}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    _hover={{
                      bg: useColorModeValue("gray.100", "gray.600"),
                      transform: "scale(1.01)",
                    }}
                    _focus={{
                      bg: useColorModeValue("white", "gray.600"),
                      borderColor: redColor,
                      boxShadow: `0 0 0 3px ${redColor}25`,
                    }}
                    transition="all 0.2s ease"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onFocus={() => setIsFocused((prev) => ({ ...prev, identifier: true }))}
                    onBlur={() => setIsFocused((prev) => ({ ...prev, identifier: false }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>
                    Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      variant="filled"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      borderRadius="14px"
                      focusBorderColor={redColor}
                      border="2px solid"
                      borderColor={isFocused.password ? `${redColor}50` : "transparent"}
                      bg={useColorModeValue("gray.50", "gray.700")}
                      _hover={{
                        bg: useColorModeValue("gray.100", "gray.600"),
                        transform: "scale(1.01)",
                      }}
                      _focus={{
                        bg: useColorModeValue("white", "gray.600"),
                        borderColor: redColor,
                        boxShadow: `0 0 0 3px ${redColor}25`,
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
                        borderRadius="10px"
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
                  borderRadius="14px"
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
                  SIGN IN
                </Button>
              </VStack>
            </form>

            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              Secure login with encrypted credentials
            </Text>
          </VStack>
        </Flex>
      </ScaleFade>
    </Flex>
  );
}

export default Login;
