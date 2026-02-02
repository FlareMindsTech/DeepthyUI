import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Heading,
  Grid,
  GridItem,
  Icon,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  useColorModeValue,
  ScaleFade,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  Collapse,
  keyframes,
  Tooltip,
  usePrefersReducedMotion,
  Container,
  Divider,
  Avatar,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import {
  FaTag,
  FaIndustry,
  FaPalette,
  FaWeight,
  FaDollarSign,
  FaWarehouse,
  FaPlus,
  FaFlask,
  FaFillDrip,
  FaCalculator,
  FaSave,
  FaFire,
  FaMagic,
  FaRocket,
  FaShieldAlt,
  FaCheckCircle,
  FaEye,
  FaVial,
  FaTint,
} from "react-icons/fa";

import { createFabricProcess } from "../../utils/axiosInstance";

// Advanced animations
const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.4); }
  50% { box-shadow: 0 0 40px rgba(255, 107, 107, 0.8), 0 0 60px rgba(255, 107, 107, 0.6); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`;

export default function FabricProcessForm() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chemicalInput, setChemicalInput] = useState("");
  const [chemicalQuantity, setChemicalQuantity] = useState("");
  const [chemicalCost, setChemicalCost] = useState("");
  const [dyeInput, setDyeInput] = useState("");
  const [dyeQuantity, setDyeQuantity] = useState("");
  const [dyeCost, setDyeCost] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [formData, setFormData] = useState({
    dcNo: "",
    brandName: "",
    qty: 0,
    color: "",
    machineNo: "",
    rate: 0,
    lotWeight: 0,
    chemical: [],
    dyes: [],
  });

  // Animation variants
  const float = prefersReducedMotion
    ? undefined
    : `${floatAnimation} 6s ease-in-out infinite`;
  const glow = prefersReducedMotion
    ? undefined
    : `${glowAnimation} 3s ease-in-out infinite`;
  const pulse = prefersReducedMotion
    ? undefined
    : `${pulseAnimation} 2s ease-in-out infinite`;
  const slide = prefersReducedMotion ? undefined : `${slideIn} 0.8s ease-out`;
  const bounce = prefersReducedMotion ? undefined : `${bounceIn} 0.8s ease-out`;

  // Advanced Color scheme
  const primaryColor = "#FF6B6B";
  const secondaryColor = "#B71C1C";
  const accentColor = "#FFD93D";
  const successColor = "#48BB78";
  const gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  const premiumGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`;

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subtleBg = useColorModeValue("gray.50", "gray.700");
  const shadow = useColorModeValue(
    "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "dark-lg"
  );

  // Validate form
  useEffect(() => {
    const isValid =
      formData.dcNo.trim() !== "" &&
      formData.brandName.trim() !== "" &&
      formData.color.trim() !== "" &&
      formData.machineNo.trim() !== "" &&
      formData.qty > 0 &&
      formData.rate > 0 &&
      formData.lotWeight > 0;

    setIsFormValid(isValid);

    // Calculate progress
    const fields = [
      "dcNo",
      "brandName",
      "color",
      "machineNo",
      "qty",
      "rate",
      "lotWeight",
    ];
    const filledFields = fields.filter((field) => {
      if (field === "qty" || field === "rate" || field === "lotWeight") {
        return formData[field] > 0;
      }
      return formData[field].trim() !== "";
    }).length;

    setProgress(Math.round((filledFields / fields.length) * 100));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (name, value) => {
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const addChemical = () => {
    if (chemicalInput.trim() && chemicalQuantity && chemicalCost) {
      const chemicalExists = formData.chemical.find(
        (chem) => chem.name.toLowerCase() === chemicalInput.trim().toLowerCase()
      );

      if (chemicalExists) {
        toast({
          title: "Chemical Already Added",
          description: `${chemicalInput} is already in the list.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newChemical = {
        id: Date.now(),
        name: chemicalInput.trim(),
        quantity: parseFloat(chemicalQuantity),
        cost: parseFloat(chemicalCost),
        unit: "kg",
        timestamp: new Date().toISOString(),
      };

      setFormData({
        ...formData,
        chemical: [...formData.chemical, newChemical],
      });

      // Reset chemical inputs
      setChemicalInput("");
      setChemicalQuantity("");
      setChemicalCost("");

      toast({
        title: "Chemical Added",
        description: `${newChemical.name} added successfully.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const removeChemical = (id) => {
    const chemicalToRemove = formData.chemical.find((chem) => chem.id === id);
    const newChemicals = formData.chemical.filter((chem) => chem.id !== id);
    setFormData({ ...formData, chemical: newChemicals });

    toast({
      title: "Chemical Removed",
      description: `${chemicalToRemove.name} removed from list.`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const addDye = () => {
    if (dyeInput.trim() && dyeQuantity && dyeCost) {
      const dyeExists = formData.dyes.find(
        (dye) => dye.name.toLowerCase() === dyeInput.trim().toLowerCase()
      );

      if (dyeExists) {
        toast({
          title: "Dye Already Added",
          description: `${dyeInput} is already in the list.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newDye = {
        id: Date.now(),
        name: dyeInput.trim(),
        quantity: parseFloat(dyeQuantity),
        cost: parseFloat(dyeCost),
        unit: "kg",
        color: formData.color || "Mixed",
        timestamp: new Date().toISOString(),
      };

      setFormData({
        ...formData,
        dyes: [...formData.dyes, newDye],
      });

      // Reset dye inputs
      setDyeInput("");
      setDyeQuantity("");
      setDyeCost("");

      toast({
        title: "Dye Added",
        description: `${newDye.name} added successfully.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const removeDye = (id) => {
    const dyeToRemove = formData.dyes.find((dye) => dye.id === id);
    const newDyes = formData.dyes.filter((dye) => dye.id !== id);
    setFormData({ ...formData, dyes: newDyes });

    toast({
      title: "Dye Removed",
      description: `${dyeToRemove.name} removed from list.`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleKeyPress = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "chemical") addChemical();
      if (type === "dye") addDye();
    }
  };

  const previewData = () => {
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      const token = localStorage.getItem("token");

      // Calculate totals
      const totalChemicalCost = formData.chemical.reduce(
        (sum, chem) => sum + chem.cost,
        0
      );
      const totalDyeCost = formData.dyes.reduce(
        (sum, dye) => sum + dye.cost,
        0
      );
      const totalMaterialCost = totalChemicalCost + totalDyeCost;

      const submissionData = {
        ...formData,
        totalChemicalCost,
        totalDyeCost,
        totalMaterialCost,
        chemical: formData.chemical.map((c) => ({
          name: c.name,
          qty: Number(c.quantity), // ✅ change quantity → qty
          cost: Number(c.cost),
        })),
        dyes: formData.dyes.map((d) => ({
          name: d.name,
          qty: Number(d.quantity), // ✅ change quantity → qty
          cost: Number(d.cost),
        })),
      };

      const res = await createFabricProcess(submissionData);
      setShowSuccess(true);

      toast({
        title: "🎉 Process Created Successfully!",
        description: `Fabric process for ${formData.brandName} has been created with ${formData.chemical.length} chemicals and ${formData.dyes.length} dyes.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "left-accent",
      });

      console.log("Created:", res.data.fabric);

      // Reset form
      setFormData({
        dcNo: "",
        brandName: "",
        qty: 0,
        color: "",
        machineNo: "",
        rate: 0,
        lotWeight: 0,
        chemical: [],
        dyes: [],
      });

      // Reset all inputs
      setChemicalInput("");
      setChemicalQuantity("");
      setChemicalCost("");
      setDyeInput("");
      setDyeQuantity("");
      setDyeCost("");

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      toast({
        title: "❌ Creation Failed",
        description:
          error.response?.data?.message || "Server error. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
        variant: "left-accent",
      });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total cost
  const totalCost = formData.qty * formData.rate;
  const totalChemicalCost = formData.chemical.reduce(
    (sum, chem) => sum + chem.cost,
    0
  );
  const totalDyeCost = formData.dyes.reduce((sum, dye) => sum + dye.cost, 0);
  const totalMaterialCost = totalChemicalCost + totalDyeCost;

  return (
    <ScaleFade in={true} initialScale={0.9}>
      <Container maxW="1000px" mx="auto" mt={8} mb={8} px={4}>
        {/* Success Alert */}
        <Collapse in={showSuccess} animateOpacity>
          <Alert
            status="success"
            borderRadius="2xl"
            mb={6}
            variant="solid"
            bg={successColor}
            animation={bounce}
          >
            <AlertIcon color="white" />
            <Box flex="1">
              <Text fontWeight="bold" color="white">
                🎉 Success! Fabric process created
              </Text>
              <Text color="white" fontSize="sm">
                The entry has been saved to the system successfully.
              </Text>
            </Box>
          </Alert>
        </Collapse>

        {/* Progress Bar */}
        <Box
          mb={6}
          bg={cardBg}
          boxShadow="md"
          borderRadius="2xl"
          p={6}
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={3}>
            <Flex justify="space-between" w="100%" align="center">
              <Text fontWeight="bold" color={secondaryColor}>
                Form Completion
              </Text>
              <Text fontWeight="bold" color={primaryColor}>
                {progress}%
              </Text>
            </Flex>
            <Progress
              value={progress}
              w="100%"
              size="lg"
              borderRadius="full"
              bg={subtleBg}
              sx={{
                "& > div": {
                  background: gradient,
                  animation: pulse,
                },
              }}
            />
          </VStack>
        </Box>

        {/* Main Form Container */}
        <Box
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          boxShadow={shadow}
          borderRadius="3xl"
          overflow="hidden"
          animation={slide}
        >
          {/* Premium Header Section */}
          <Box bg={premiumGradient} p={8} position="relative" overflow="hidden">
            {/* Animated Background Elements */}
            <Box
              position="absolute"
              top="-50%"
              left="-50%"
              w="200%"
              h="200%"
              bg="radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)"
              bgSize="50px 50px"
              animation={float}
            />

            <Flex
              direction="column"
              align="center"
              color="white"
              position="relative"
              zIndex={1}
            >
              <Heading size="xl" fontWeight="black" textAlign="center" mb={2}>
                FABRIC PROCESS ENTRY
              </Heading>
            </Flex>
          </Box>

          {/* Form Body */}
          <Box p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={8}>
                {/* Main Form Grid */}
                <Grid templateColumns="repeat(2, 1fr)" gap={6} w="100%">
                  {/* DC Number */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaTag} color={primaryColor} />
                          <Text>DC NUMBER</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaTag} />
                        </InputLeftElement>
                        <Input
                          name="dcNo"
                          value={formData.dcNo}
                          onChange={handleChange}
                          placeholder="Enter DC number"
                          borderColor={borderColor}
                          _hover={{
                            borderColor: primaryColor,
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 3px ${primaryColor}20`,
                            transform: "scale(1.02)",
                          }}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                          fontSize="md"
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Brand Name */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaIndustry} color={primaryColor} />
                          <Text>BRAND NAME</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaIndustry} />
                        </InputLeftElement>
                        <Input
                          name="brandName"
                          value={formData.brandName}
                          onChange={handleChange}
                          placeholder="Enter brand name"
                          borderColor={borderColor}
                          _hover={{
                            borderColor: primaryColor,
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 3px ${primaryColor}20`,
                            transform: "scale(1.02)",
                          }}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                          fontSize="md"
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Quantity */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        QUANTITY
                      </FormLabel>
                      <NumberInput
                        value={formData.qty}
                        onChange={(value) => handleNumberChange("qty", value)}
                        min={0}
                        precision={0}
                      >
                        <NumberInputField
                          borderColor={borderColor}
                          _hover={{
                            borderColor: primaryColor,
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 3px ${primaryColor}20`,
                          }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                          fontSize="md"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper
                            borderColor={primaryColor}
                            color={primaryColor}
                          />
                          <NumberDecrementStepper
                            borderColor={primaryColor}
                            color={primaryColor}
                          />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>

                  {/* Color */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaPalette} color={primaryColor} />
                          <Text>COLOR</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaPalette} />
                        </InputLeftElement>
                        <Input
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="Enter color name"
                          borderColor={borderColor}
                          _hover={{
                            borderColor: primaryColor,
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 3px ${primaryColor}20`,
                            transform: "scale(1.02)",
                          }}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                          fontSize="md"
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Machine Number */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaWarehouse} color={primaryColor} />
                          <Text>MACHINE NO</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaWarehouse} />
                        </InputLeftElement>
                        <Input
                          name="machineNo"
                          value={formData.machineNo}
                          onChange={handleChange}
                          placeholder="e.g., M-001"
                          borderColor={borderColor}
                          _hover={{
                            borderColor: primaryColor,
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          _focus={{
                            borderColor: primaryColor,
                            boxShadow: `0 0 0 3px ${primaryColor}20`,
                            transform: "scale(1.02)",
                          }}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                          fontSize="md"
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Rate */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaDollarSign} color={primaryColor} />
                          <Text>RATE (PER UNIT)</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaDollarSign} />
                        </InputLeftElement>
                        <NumberInput
                          value={formData.rate}
                          onChange={(value) =>
                            handleNumberChange("rate", value)
                          }
                          min={0}
                          precision={2}
                          w="100%"
                        >
                          <NumberInputField
                            pl="10"
                            borderColor={borderColor}
                            _hover={{
                              borderColor: primaryColor,
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }}
                            _focus={{
                              borderColor: primaryColor,
                              boxShadow: `0 0 0 3px ${primaryColor}20`,
                            }}
                            bg="white"
                            borderRadius="xl"
                            height="50px"
                            fontSize="md"
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Lot Weight */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaWeight} color={primaryColor} />
                          <Text>LOT WEIGHT (KG)</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaWeight} />
                        </InputLeftElement>
                        <NumberInput
                          value={formData.lotWeight}
                          onChange={(value) =>
                            handleNumberChange("lotWeight", value)
                          }
                          min={0}
                          precision={2}
                          w="100%"
                        >
                          <NumberInputField
                            pl="10"
                            borderColor={borderColor}
                            _hover={{
                              borderColor: primaryColor,
                              transform: "translateY(-2px)",
                              boxShadow: "lg",
                            }}
                            _focus={{
                              borderColor: primaryColor,
                              boxShadow: `0 0 0 3px ${primaryColor}20`,
                            }}
                            bg="white"
                            borderRadius="xl"
                            height="50px"
                            fontSize="md"
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Total Cost Display */}
                  <GridItem colSpan={1}>
                    <FormControl>
                      <FormLabel
                        fontWeight="bold"
                        color={secondaryColor}
                        fontSize="sm"
                      >
                        <HStack>
                          <Icon as={FaCalculator} color={primaryColor} />
                          <Text>TOTAL COST</Text>
                        </HStack>
                      </FormLabel>
                      <Box
                        p={4}
                        border="3px"
                        borderColor={primaryColor}
                        borderRadius="2xl"
                        bg={`${primaryColor}10`}
                        color={secondaryColor}
                        fontWeight="black"
                        textAlign="center"
                        fontSize="2xl"
                        animation={glow}
                        transition="all 0.3s ease"
                        _hover={{
                          transform: "scale(1.05)",
                          bg: `${primaryColor}15`,
                        }}
                      >
                        ${totalCost.toFixed(2)}
                      </Box>
                    </FormControl>
                  </GridItem>
                </Grid>

                <Divider borderColor={borderColor} />

                {/* Chemicals Section */}
                <FormControl w="100%">
                  <FormLabel
                    fontWeight="bold"
                    color={secondaryColor}
                    fontSize="sm"
                  >
                    <HStack>
                      <Icon as={FaFlask} color={primaryColor} />
                      <Text>CHEMICALS</Text>
                      <Badge
                        colorScheme="red"
                        borderRadius="full"
                        bg={primaryColor}
                        animation={pulse}
                      >
                        {formData.chemical.length}
                      </Badge>
                      <Badge
                        colorScheme="green"
                        variant="solid"
                        borderRadius="full"
                      >
                        Total: ${totalChemicalCost.toFixed(2)}
                      </Badge>
                    </HStack>
                  </FormLabel>

                  {/* Chemical Input Grid */}
                  <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={4}>
                    <GridItem colSpan={1}>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaFlask} />
                        </InputLeftElement>
                        <Input
                          value={chemicalInput}
                          onChange={(e) => setChemicalInput(e.target.value)}
                          placeholder="Chemical name"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ borderColor: primaryColor }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                        />
                      </InputGroup>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaVial} />
                        </InputLeftElement>
                        <Input
                          type="number"
                          value={chemicalQuantity}
                          onChange={(e) => setChemicalQuantity(e.target.value)}
                          placeholder="0"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ borderColor: primaryColor }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                        />
                      </InputGroup>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaDollarSign} />
                        </InputLeftElement>
                        <Input
                          type="number"
                          value={chemicalCost}
                          onChange={(e) => setChemicalCost(e.target.value)}
                          placeholder="0"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ borderColor: primaryColor }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                        />
                      </InputGroup>
                    </GridItem>
                  </Grid>

                  <Flex mb={4}>
                    <Tooltip label="Add Chemical" hasArrow>
                      <Button
                        leftIcon={<FaPlus />}
                        onClick={addChemical}
                        bg={primaryColor}
                        color="white"
                        _hover={{
                          bg: secondaryColor,
                          transform: "scale(1.05)",
                          boxShadow: "xl",
                        }}
                        _active={{
                          transform: "scale(0.95)",
                        }}
                        isDisabled={
                          !chemicalInput.trim() ||
                          !chemicalQuantity ||
                          !chemicalCost
                        }
                        borderRadius="xl"
                        height="50px"
                        flex={1}
                        transition="all 0.3s ease"
                      >
                        Add Chemical
                      </Button>
                    </Tooltip>
                  </Flex>

                  <Flex flexWrap="wrap" gap={3}>
                    {formData.chemical.map((chem) => (
                      <Tag
                        key={chem.id}
                        size="lg"
                        borderRadius="xl"
                        variant="solid"
                        bg={primaryColor}
                        color="white"
                        animation={bounce}
                        _hover={{
                          transform: "scale(1.05)",
                          cursor: "pointer",
                        }}
                        transition="all 0.3s ease"
                        p={3}
                      >
                        <TagLabel fontWeight="medium" mr={2}>
                          {chem.name} ({chem.quantity}kg - ${chem.cost})
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => removeChemical(chem.id)}
                          _hover={{ bg: "rgba(255,255,255,0.2)" }}
                        />
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>

                <Divider borderColor={borderColor} />

                {/* Dyes Section */}
                <FormControl w="100%">
                  <FormLabel
                    fontWeight="bold"
                    color={secondaryColor}
                    fontSize="sm"
                  >
                    <HStack>
                      <Icon as={FaFillDrip} color={primaryColor} />
                      <Text>DYES</Text>
                      <Badge
                        colorScheme="red"
                        borderRadius="full"
                        bg={secondaryColor}
                        animation={pulse}
                      >
                        {formData.dyes.length}
                      </Badge>
                      <Badge
                        colorScheme="purple"
                        variant="solid"
                        borderRadius="full"
                      >
                        Total: ${totalDyeCost.toFixed(2)}
                      </Badge>
                    </HStack>
                  </FormLabel>

                  {/* Dye Input Grid */}
                  <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={4}>
                    <GridItem colSpan={1}>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents="none"
                          color={primaryColor}
                        >
                          <Icon as={FaTint} />
                        </InputLeftElement>
                        <Input
                          value={dyeInput}
                          onChange={(e) => setDyeInput(e.target.value)}
                          placeholder="Dye name"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ borderColor: primaryColor }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                        />
                      </InputGroup>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaTint} />
                        </InputLeftElement>
                        <Input
                          type="number"
                          value={dyeQuantity}
                          onChange={(e) => setDyeQuantity(e.target.value)}
                          placeholder="0"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ borderColor: primaryColor }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                        />
                      </InputGroup>
                    </GridItem>
                    <GridItem colSpan={1}>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaDollarSign} />
                        </InputLeftElement>
                        <Input
                          type="number"
                          value={dyeCost}
                          onChange={(e) => setDyeCost(e.target.value)}
                          placeholder="0"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ borderColor: primaryColor }}
                          bg="white"
                          borderRadius="xl"
                          height="50px"
                        />
                      </InputGroup>
                    </GridItem>
                  </Grid>

                  <Flex mb={4}>
                    <Tooltip label="Add Dye" hasArrow>
                      <Button
                        leftIcon={<FaPlus />}
                        onClick={addDye}
                        bg={secondaryColor}
                        color="white"
                        _hover={{
                          bg: primaryColor,
                          transform: "scale(1.05)",
                          boxShadow: "xl",
                        }}
                        _active={{
                          transform: "scale(0.95)",
                        }}
                        isDisabled={
                          !dyeInput.trim() || !dyeQuantity || !dyeCost
                        }
                        borderRadius="xl"
                        height="50px"
                        flex={1}
                        transition="all 0.3s ease"
                      >
                        Add Dye
                      </Button>
                    </Tooltip>
                  </Flex>

                  <Flex flexWrap="wrap" gap={3}>
                    {formData.dyes.map((dye) => (
                      <Tag
                        key={dye.id}
                        size="lg"
                        borderRadius="xl"
                        variant="solid"
                        bg={secondaryColor}
                        color="white"
                        animation={bounce}
                        _hover={{
                          transform: "scale(1.05)",
                          cursor: "pointer",
                        }}
                        transition="all 0.3s ease"
                        p={3}
                      >
                        <TagLabel fontWeight="medium" mr={2}>
                          {dye.name} ({dye.quantity}kg - ${dye.cost})
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => removeDye(dye.id)}
                          _hover={{ bg: "rgba(255,255,255,0.2)" }}
                        />
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>

                {/* Material Cost Summary */}
                {(formData.chemical.length > 0 || formData.dyes.length > 0) && (
                  <Box
                    w="100%"
                    p={4}
                    bg={`${primaryColor}10`}
                    borderRadius="2xl"
                    border="2px"
                    borderColor={primaryColor}
                  >
                    <Heading
                      size="md"
                      color={secondaryColor}
                      mb={3}
                      textAlign="center"
                    >
                      Material Cost Summary
                    </Heading>
                    <Grid
                      templateColumns="repeat(3, 1fr)"
                      gap={4}
                      textAlign="center"
                    >
                      <Box>
                        <Text fontWeight="bold" color="gray.600">
                          Chemicals
                        </Text>
                        <Text
                          fontSize="xl"
                          fontWeight="black"
                          color={primaryColor}
                        >
                          ${totalChemicalCost.toFixed(2)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">
                          Dyes
                        </Text>
                        <Text
                          fontSize="xl"
                          fontWeight="black"
                          color={secondaryColor}
                        >
                          ${totalDyeCost.toFixed(2)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="gray.600">
                          Total Materials
                        </Text>
                        <Text
                          fontSize="xl"
                          fontWeight="black"
                          color={accentColor}
                        >
                          ${totalMaterialCost.toFixed(2)}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>
                )}

                {/* Action Buttons */}
                <HStack spacing={4} w="100%" pt={4}>
                  <Tooltip label="Preview your fabric process" hasArrow>
                    <Button
                      leftIcon={<FaEye />}
                      onClick={previewData}
                      variant="outline"
                      borderColor={primaryColor}
                      color={primaryColor}
                      size="lg"
                      flex={1}
                      _hover={{
                        bg: primaryColor,
                        color: "white",
                        transform: "translateY(-3px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.3s ease"
                      borderRadius="xl"
                      height="60px"
                    >
                      Preview
                    </Button>
                  </Tooltip>

                  <Button
                    type="submit"
                    size="lg"
                    flex={2}
                    isLoading={isSubmitting}
                    loadingText="🚀 Creating Process..."
                    bg={isFormValid ? premiumGradient : "gray.300"}
                    color="white"
                    _hover={
                      isFormValid
                        ? {
                            transform: "translateY(-3px) scale(1.02)",
                            boxShadow: `0 20px 40px -10px ${primaryColor}80`,
                            animation: glow,
                          }
                        : {}
                    }
                    _active={{
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    boxShadow="2xl"
                    height="60px"
                    fontSize="lg"
                    fontWeight="black"
                    leftIcon={<FaRocket />}
                    rightIcon={<FaShieldAlt />}
                    borderRadius="2xl"
                    disabled={!isFormValid}
                  >
                    {isFormValid
                      ? "🚀 LAUNCH FABRIC PROCESS"
                      : "FILL REQUIRED FIELDS"}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        </Box>
      </Container>

      {/* Preview Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader bg={gradient} color="white">
            <HStack>
              <Icon as={FaEye} />
              <Text>Fabric Process Preview</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              {/* Basic Information */}
              <Box p={4} bg={subtleBg} borderRadius="lg">
                <Heading size="sm" color={secondaryColor} mb={3}>
                  Basic Information
                </Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">DC Number:</Text>
                    <Text color={primaryColor}>
                      {formData.dcNo || "Not set"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Brand:</Text>
                    <Text color={primaryColor}>
                      {formData.brandName || "Not set"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Color:</Text>
                    <Badge colorScheme="red" bg={primaryColor} color="white">
                      {formData.color || "Not set"}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Machine No:</Text>
                    <Text color={primaryColor}>
                      {formData.machineNo || "Not set"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Quantity:</Text>
                    <Text color={primaryColor}>{formData.qty}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Lot Weight:</Text>
                    <Text color={primaryColor}>{formData.lotWeight} kg</Text>
                  </Flex>
                </Grid>
              </Box>

              {/* Cost Summary */}
              <Box
                p={4}
                bg={`${primaryColor}10`}
                borderRadius="lg"
                borderLeft="4px"
                borderColor={primaryColor}
              >
                <Heading size="sm" color={secondaryColor} mb={3}>
                  Cost Summary
                </Heading>
                <VStack spacing={2}>
                  <Flex justify="space-between" w="100%">
                    <Text fontWeight="bold">Fabric Cost:</Text>
                    <Text fontWeight="black" color={primaryColor}>
                      ${totalCost.toFixed(2)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" w="100%">
                    <Text fontWeight="bold">Chemical Cost:</Text>
                    <Text fontWeight="bold" color={secondaryColor}>
                      ${totalChemicalCost.toFixed(2)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" w="100%">
                    <Text fontWeight="bold">Dye Cost:</Text>
                    <Text fontWeight="bold" color={secondaryColor}>
                      ${totalDyeCost.toFixed(2)}
                    </Text>
                  </Flex>
                  <Divider />
                  <Flex justify="space-between" w="100%">
                    <Text fontWeight="black">Total Material Cost:</Text>
                    <Text fontWeight="black" color={accentColor} fontSize="lg">
                      ${totalMaterialCost.toFixed(2)}
                    </Text>
                  </Flex>
                </VStack>
              </Box>

              {/* Chemicals Details */}
              {formData.chemical.length > 0 && (
                <Box p={4} bg={subtleBg} borderRadius="lg">
                  <Heading size="sm" color={secondaryColor} mb={3}>
                    Chemicals ({formData.chemical.length})
                  </Heading>
                  <VStack spacing={2} align="stretch">
                    {formData.chemical.map((chem) => (
                      <Flex
                        key={chem.id}
                        justify="space-between"
                        p={2}
                        bg="white"
                        borderRadius="md"
                      >
                        <Text>{chem.name}</Text>
                        <Text fontWeight="bold">
                          {chem.quantity} kg - ${chem.cost}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Dyes Details */}
              {formData.dyes.length > 0 && (
                <Box p={4} bg={subtleBg} borderRadius="lg">
                  <Heading size="sm" color={secondaryColor} mb={3}>
                    Dyes ({formData.dyes.length})
                  </Heading>
                  <VStack spacing={2} align="stretch">
                    {formData.dyes.map((dye) => (
                      <Flex
                        key={dye.id}
                        justify="space-between"
                        p={2}
                        bg="white"
                        borderRadius="md"
                      >
                        <Text>{dye.name}</Text>
                        <Text fontWeight="bold">
                          {dye.quantity} kg - ${dye.cost}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="red" borderRadius="xl">
              Close Preview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScaleFade>
  );
}
