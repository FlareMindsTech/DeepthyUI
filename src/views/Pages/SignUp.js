import React from "react";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
// Assets
import BgSignUp from "assets/img/BgSignUp.png";

function SignUp() {
  const bgForm = useColorModeValue("white", "navy.800");
  const titleColor = useColorModeValue("gray.700", "blue.500");
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction="column" align="center" justify="center" overflow="hidden">
      {/* Background */}
      <Box
        position="absolute"
        w="100vw"
        h="100vh"
        bgImage={BgSignUp}
        bgSize="cover"
        bgPosition="center"
        zIndex="-1"
      >
        <Box w="100%" h="100%" bg="blue.500" opacity="0.8"></Box>
      </Box>

      {/* Header */}
      <Flex direction="column" textAlign="center" justify="center" align="center" mt="125px" mb="30px">
        <Text fontSize="4xl" color="white" fontWeight="bold">
          Welcome!
        </Text>
        <Text
          fontSize="md"
          color="white"
          fontWeight="normal"
          mt="10px"
          mb="26px"
          w={{ base: "90%", sm: "60%", lg: "40%", xl: "333px" }}
        >
          Use this form to view account information. Login is restricted to the admin account only.
        </Text>
      </Flex>

      {/* Form */}
      <Flex align="center" justify="center" mb="60px" mt="20px">
        <Flex
          direction="column"
          w="445px"
          bg={bgForm}
          borderRadius="15px"
          p="40px"
          boxShadow={useColorModeValue("0px 5px 14px rgba(0, 0, 0, 0.05)", "unset")}
        >
          <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign="center" mb="22px">
            Register With
          </Text>

          <FormControl>
            <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
              Name
            </FormLabel>
            <Input variant="auth" fontSize="sm" ms="4px" type="text" placeholder="Your full name" mb="24px" size="lg" />

            <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
              Phone Number
            </FormLabel>
            <Input variant="auth" fontSize="sm" ms="4px" type="tel" placeholder="Your phone number" mb="24px" size="lg" />

            <FormLabel ms="4px" fontSize="sm" fontWeight="normal">
              Password
            </FormLabel>
            <Input variant="auth" fontSize="sm" ms="4px" type="password" placeholder="Your password" mb="24px" size="lg" />

            <Button fontSize="10px" variant="solid" fontWeight="bold" w="100%" h="45" mb="24px">
              SIGN UP
            </Button>
          </FormControl>

          <Flex direction="column" justify="center" align="center" maxW="100%" mt="0px">
            <Text color={textColor} fontWeight="medium">
              Already have an account?
              <Link color={titleColor} as="span" ms="5px" href="/login" fontWeight="bold">
                Sign In
              </Link>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SignUp;
