import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Image,
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
import { loginUser } from "../../utils/axiosInstance";
import logo from "../../assets/img/deepthy_logo.png"

function Login() {
  const bgForm = useColorModeValue("white", "gray.800");
  const redColor = "#C41E3A";
  const lightRed = "#FF6B6B"; // This is the color you referenced
  const darkRed = "#B71C1C";
  const fabricBlue = "#2D3748";
  const fabricLight = "#4A5568";
  const fabricDark = "#1A202C";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    identifier: false,
    password: false,
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // State for parallax
  const toast = useToast();
  const navigate = useNavigate();

  // --- Keyframe Animations ---

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
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 0.9; }
    100% { transform: scale(1); opacity: 0.7; }
  `;

  // New animated stitching
  const stitchingAnimationX = keyframes`
    from { background-position: 0 0; }
    to { background-position: 50px 0; }
  `;

  const stitchingAnimationY = keyframes`
    from { background-position: 0 0; }
    to { background-position: 0 50px; }
  `;

  // --- Hooks ---

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

  // Effect for Parallax Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isMounted.current) {
        // Calculate deviation from the center
        const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        setMousePos({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // --- Login Handler (Unchanged) ---
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
      const { data } = await loginUser(payload); // ✅ Axios call

      if (data.token) {
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
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // --- Render ---
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
      perspective="1500px" // Creates the 3D stage for parallax
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
      {/* --- Parallax Background Elements --- */}
      {/* We wrap them in a Box to apply the parallax transform separately from their animation */}

      {/* Blurred Blob 1 (Moves *away* from mouse) */}
      <Box
        position="absolute"
        top="15%"
        left="10%"
        zIndex={1}
        transform={`translateX(${mousePos.x * -30}px) translateY(${
          mousePos.y * -30
        }px)`}
        transition="transform 0.1s linear"
      >
        <Box
          w="200px"
          h="200px"
          borderRadius="50%"
          bg={`linear-gradient(135deg, ${redColor}20, ${lightRed}30)`}
          filter="blur(40px)"
          animation={`${floatAnimation} 8s ease-in-out infinite`}
        />
      </Box>

      {/* Blurred Blob 2 (Moves *with* mouse, faster) */}
      <Box
        position="absolute"
        bottom="10%"
        right="15%"
        zIndex={1}
        transform={`translateX(${mousePos.x * 50}px) translateY(${
          mousePos.y * 50
        }px)`}
        transition="transform 0.1s linear"
      >
        <Box
          w="300px"
          h="300px"
          borderRadius="50%"
          bg={`linear-gradient(135deg, ${fabricBlue}15, ${fabricDark}25)`}
          filter="blur(50px)"
          animation={`${floatAnimation} 12s ease-in-out infinite`}
        />
      </Box>

      {/* Thread Spool 1 (Restyled) */}
      <Box
        position="absolute"
        top="20%"
        right="20%"
        zIndex={1}
        transform={`translateX(${mousePos.x * -60}px) translateY(${
          mousePos.y * -60
        }px) rotate(45deg)`}
        transition="transform 0.1s linear"
      >
        <Box
          w="120px"
          h="60px"
          bg={useColorModeValue("#e2e8f0", "#2d3748")}
          borderRadius="30px" // Simplified to a spool shape
          boxShadow="0 4px 12px rgba(0,0,0,0.1)"
          animation={`${pulseAnimation} 4s ease-in-out infinite`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {/* The "thread" */}
          <Box
            w="80px"
            h="40px"
            bg={redColor}
            borderRadius="20px"
            opacity={0.8}
          />
        </Box>
      </Box>

      {/* Thread Spool 2 (Restyled) */}
      <Box
        position="absolute"
        bottom="25%"
        left="15%"
        zIndex={1}
        transform={`translateX(${mousePos.x * 40}px) translateY(${
          mousePos.y * 40
        }px) rotate(-30deg)`}
        transition="transform 0.1s linear"
      >
        <Box
          w="100px"
          h="50px"
          bg={useColorModeValue("#edf2f7", "#4a5568")}
          borderRadius="25px"
          boxShadow="0 4px 12px rgba(0,0,0,0.1)"
          animation={`${pulseAnimation} 5s ease-in-out infinite`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Box
            w="70px"
            h="30px"
            bg={fabricLight}
            borderRadius="15px"
            opacity={0.7}
          />
        </Box>
      </Box>

      {/* --- Animated Stitching lines (Replaced static lines) --- */}
      <Box
        position="absolute"
        top="50%"
        left="10%"
        right="10%"
        height="2px"
        zIndex={1}
        backgroundImage={`linear-gradient(90deg, ${redColor} 60%, transparent 40%)`}
        backgroundSize="10px 2px"
        backgroundRepeat="repeat-x"
        opacity={0.3}
        animation={`${stitchingAnimationX} 1s linear infinite`}
      />
      <Box
        position="absolute"
        left="50%"
        top="10%"
        bottom="10%"
        width="2px"
        zIndex={1}
        backgroundImage={`linear-gradient(180deg, ${redColor} 60%, transparent 40%)`}
        backgroundSize="2px 10px"
        backgroundRepeat="repeat-y"
        opacity={0.3}
        animation={`${stitchingAnimationY} 1s linear infinite`}
      />

      {/* --- Login Card (with 3D Tilt) --- */}
      <ScaleFade in={true} initialScale={0.9}>
        <Flex
          direction="column"
          zIndex={2}
          w={{ base: "90%", sm: "400px", md: "420px" }}
          borderRadius="20px"
          p={{ base: "30px", md: "40px" }}
          bg={useColorModeValue(
            "rgba(255,255,255,0.95)",
            "rgba(26,32,44,0.95)"
          )}
          backdropFilter="blur(20px) saturate(180%)"
          border="2px solid"
          borderColor={useColorModeValue(`${redColor}15`, `${redColor}20`)}
          boxShadow={useColorModeValue(
            "0 20px 40px rgba(0,0,0,0.1), 0 8px 24px rgba(196,30,58,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
            "0 20px 40px rgba(0,0,0,0.3), 0 8px 24px rgba(196,30,58,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
          )}
          animation={`${slideIn} 0.6s ease-out`}
          position="relative"
          // Apply the 3D tilt transform
          transform={`rotateY(${mousePos.x * 15}deg) rotateX(${
            -mousePos.y * 15
          }deg)`}
          // Add 'transform' to the transition property
          transition="all 0.3s ease, transform 0.1s ease-out"
          _hover={{
            transform: `scale(1.02) rotateY(${mousePos.x * 10}deg) rotateX(${
              -mousePos.y * 10
            }deg)`, // Tone down tilt on hover/scale
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
            border: `1px solid ${useColorModeValue(
              `${redColor}10`,
              `${redColor}15`
            )}`,
            pointerEvents: "none",
          }}
        >
          {/* Header with fabric icon */}
          <VStack spacing={4} w="100%" mb={4}>
            <Box
              w="60px"
              h="60px"
              // borderRadius="15px"
              // bgGradient={`linear(135deg, ${redColor}, ${lightRed})`}
              // display="flex"
              // alignItems="center"
              // justifyContent="center"
              // boxShadow={`0 4px 15px ${redColor}30`}
              // position="relative"
              // _before={{
              //   content: '""',
              //   position: "absolute",
              //   top: "15px",
              //   left: "15px",
              //   right: "15px",
              //   bottom: "15px",
              //   border: "2px solid white",
              //   borderRadius: "8px",
              //   opacity: 0.8,
              // }}
            >
              <Image
                src={logo} // replace with your image path or URL
                alt="Thread Icon"
                width="100%"
                height="100%"
              />
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
              {/* <Text
                fontSize="sm"
                color={useColorModeValue("gray.600", "gray.400")}
                textAlign="center"
                fontWeight="medium"
              >
                Inventory Management System
              </Text> */}
            </VStack>
          </VStack>

          {/* --- Form (Unchanged) --- */}
          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <VStack spacing={6} w="100%">
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="semibold"
                  mb={2}
                  color={useColorModeValue("gray.700", "gray.300")}
                >
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
                  borderColor={
                    isFocused.identifier ? `${redColor}40` : "transparent"
                  }
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
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, identifier: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, identifier: false }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="semibold"
                  mb={2}
                  color={useColorModeValue("gray.700", "gray.300")}
                >
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
                    borderColor={
                      isFocused.password ? `${redColor}40` : "transparent"
                    }
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
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, password: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, password: false }))
                    }
                  />
                  <InputRightElement width="4rem" mr={1}>
                    <IconButton
                      h="2rem"
                      size="sm"
                      borderRadius="8px"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

          {/* <Text
            fontSize="xs"
            color={useColorModeValue("gray.500", "gray.400")}
            textAlign="center"
            mt={6}
          >
            Secure fabric inventory management system • v2.4.1
          </Text> */}
        </Flex>
      </ScaleFade>
    </Flex>
  );
}

export default Login;
