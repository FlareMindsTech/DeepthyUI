/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useColorModeValue,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "axios";


function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();

  // Colors
  const redColor = "#C41E3A";
  const bgGradient = useColorModeValue(
    "linear(to-br, #fdfbfb, #ebedee)",
    "linear(to-br, #1A202C, #2D3748)"
  );
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(26, 32, 44, 0.85)");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || (user.role !== "owner" && user.role !== "admin")) {
      navigate("/auth/signin");
    } else {
      setCurrentUserRole(user.role);
    }
  }, [navigate]);

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSignUp = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // ✅ Make API request
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/create`,
      formData,
      { headers }
    );

    toast({
      title: "Registration Successful",
      description: res.data.message || `Registered as ${formData.role}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // ✅ Store user info if needed
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // ✅ Redirect based on role
    if (formData.role === "admin") navigate("/admin/dashboard");
    else navigate("/user/dashboard");

  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: err.response?.data?.message || "Failed to register",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

  return (
    <Flex
      minH="50vh"
      align="flex-start"
      justify="center"
       bgSize="cover"
       bgPosition="center"
        pt="60px"
      overflow="auto"
    >
      <Box
        w={{ base: "100%", sm: "450px", md: "700px", lg: "700px" }}
        borderRadius="25px"
        p={{ base: 7, md: 8 }}
        bg={cardBg}
        backdropFilter="blur(15px)"
          border="1px solid rgba(255,255,255,0.3)"
    boxShadow="0px 10px 40px rgba(0,0,0,0.15)"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
        }} zIndex="2"
 

      >
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="extrabold"
          textAlign="center"
          mb={6}
          bgGradient="linear(to-r, #C41E3A, #FF6B6B)"
          bgClip="text"
          letterSpacing="wide"
        >
          Create an Account
        </Text>

        <form onSubmit={handleSignUp}>
          <FormControl display="flex" flexDirection="column" gap="18px">
            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Name
              </FormLabel>
              <Input
                variant="filled"
                type="text"
                placeholder="Enter your full name"
                size="lg"
                borderRadius="14px"
                focusBorderColor={redColor}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Box>

            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Phone Number
              </FormLabel>
              <Input
                variant="filled"
                type="tel"
                placeholder="Enter your phone number"
                size="lg"
                borderRadius="14px"
                focusBorderColor={redColor}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Box>

            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Password
              </FormLabel>
              <Flex align="center">
                <Input
                  variant="filled"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  size="lg"
                  borderRadius="14px"
                  focusBorderColor={redColor}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <IconButton
                  ml="2"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  variant="ghost"
                  colorScheme="red"
                />
              </Flex>
            </Box>

            <Box>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Role
              </FormLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                size="lg"
                borderRadius="14px"
                focusBorderColor={redColor}
              >
                {currentUserRole === "owner" && <option value="owner">Owner</option>}
                {currentUserRole === "owner" && <option value="admin">Admin</option>}
                <option value="user">User</option>
              </Select>
            </Box>

            <Button
              type="submit"
              bgGradient="linear(to-r, #C41E3A, #FF6B6B)"
              color="white"
              fontWeight="bold"
              size="lg"
              h="52px"
              borderRadius="14px"
              mt="5px"
              _hover={{
                bgGradient: "linear(to-r, #B71C1C, #E64A19)",
                transform: "scale(1.03)",
              }}
              transition="all 0.3s ease"
            >
              Register
            </Button>
          </FormControl>
        </form>

        <Text fontSize="sm" textAlign="center" mt="24px">
          Already have an account?{" "}
          <Box
            as="span"
            color={redColor}
            fontWeight="bold"
            cursor="pointer"
            onClick={() => navigate("/auth/signin")}
            _hover={{ textDecoration: "underline" }}
          >
            SignIn
          </Box>
        </Text>
      </Box>
    </Flex>
  );
}

export default SignUp;
