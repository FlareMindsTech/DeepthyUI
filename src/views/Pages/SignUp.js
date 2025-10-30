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

function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const bgForm = useColorModeValue("white", "navy.800");
  const redColor = "#C41E3A";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(""); // Owner or Admin

  // Protect page: only owner/admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || (user.role !== "owner" && user.role !== "admin")) {
      navigate("/auth/signin");
    } else {
      setCurrentUserRole(user.role); // save current user's role
    }
  }, [navigate]);

  const handleChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  const handleSignUp = (e) => {
    e.preventDefault();

    localStorage.setItem("user", JSON.stringify(formData));

    toast({
      title: "Registration Successful",
      description: `Registered as ${formData.role}!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    if (formData.role === "admin") navigate("/admin/dashboard");
    else navigate("/user/dashboard");
  };

  return (
    <Flex
      // w="100vw"
      minH="100vh"
      align="center"
      justify="center"
      overflow="hidden" // allow scrolling
      px={{ base: 3, md: 0 }}
      py={{ base: 6, md: 0 }}
      // bg={useColorModeValue("gray.100", "gray.900")} // optional plain background
      marginTop={-10}
    >
      {/* Form Container */}
      <Flex
        zIndex="2"
        direction="column"
        w={{ base: "90%", sm: "450px", md: "445px", lg: "480px" }}
        maxW="95%"
        maxH={{ base: "90vh", md: "auto" }} // max height for scroll on small screens
        overflowY={{ base: "auto", md: "visible" }}
        borderRadius="20px"
        p={{ base: "25px", md: "5px" }}
        padding = "0 20"
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
          bgGradient="linear(to-r, #C41E3A, #FF6B6B)"
          bgClip="text"
        >
          Sign Up
        </Text>

        <form onSubmit={handleSignUp}>
          <FormControl display="flex" flexDirection="column" gap="15px">
            <FormLabel fontSize="sm" fontWeight="semibold">
              Name
            </FormLabel>
            <Input
              variant="auth"
              type="text"
              placeholder="Your full name"
              size="lg"
              borderRadius="12px"
              focusBorderColor={redColor}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <FormLabel fontSize="sm" fontWeight="semibold">
              Phone Number
            </FormLabel>
            <Input
              variant="auth"
              type="tel"
              placeholder="Your phone number"
              size="lg"
              borderRadius="12px"
              focusBorderColor={redColor}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <FormLabel fontSize="sm" fontWeight="semibold">
              Password
            </FormLabel>
            <Flex>
              <Input
                variant="auth"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                size="lg"
                borderRadius="12px"
                focusBorderColor={redColor}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <IconButton
                ml="2"
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              />
            </Flex>

            <FormLabel fontSize="sm" fontWeight="semibold">
              Role
            </FormLabel>
            <Select
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              size="lg"
              borderRadius="12px"
              focusBorderColor={redColor}
            >
              {currentUserRole === "owner" && (
                <option value="owner">Owner</option>
              )}
              {currentUserRole === "owner" && (
                <option value="admin">Admin</option>
              )}
              <option value="user">User</option>
            </Select>

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
              mt="10px"
            >
              SIGN UP
            </Button>
          </FormControl>
        </form>

        <Text fontSize="sm" textAlign="center" mt="20px">
          Already have an account?{" "}
          <Box
            as="span"
            color={redColor}
            fontWeight="bold"
            cursor="pointer"
            onClick={() => navigate("/auth/signin")}
          >
            Sign In
          </Box>
        </Text>
      </Flex>
    </Flex>
  );
}

export default SignUp;
