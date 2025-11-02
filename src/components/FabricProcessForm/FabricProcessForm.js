import React, { useState } from "react";
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
  Select,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  Collapse
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
  FaFire
} from "react-icons/fa";

export default function FabricProcessForm() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chemicalInput, setChemicalInput] = useState("");
  const [dyeInput, setDyeInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Color options for dropdown
  const colorOptions = [
    "Red", "Blue", "Green", "Black", "White", "Yellow", 
    "Orange", "Purple", "Pink", "Brown", "Gray", "Navy", "Beige"
  ];

  // Brand options
  const brandOptions = [
    "Cotton King", "Silk Supreme", "Linen Lux", "Denim Pro",
    "Wool Masters", "Poly Elite", "Viscose Plus", "Bamboo Comfort",
    "Organic Pure", "Premium Blend", "Classic Weave", "Modern Textile"
  ];

  // Color scheme - Red theme
  const primaryColor = "#FF6B6B";
  const secondaryColor = "#B71C1C";
  const gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const shadow = useColorModeValue("xl", "dark-lg");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (name, value) => {
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const addChemical = () => {
    if (chemicalInput.trim() && !formData.chemical.includes(chemicalInput.trim())) {
      setFormData({
        ...formData,
        chemical: [...formData.chemical, chemicalInput.trim()]
      });
      setChemicalInput("");
    }
  };

  const removeChemical = (index) => {
    const newChemicals = formData.chemical.filter((_, i) => i !== index);
    setFormData({ ...formData, chemical: newChemicals });
  };

  const addDye = () => {
    if (dyeInput.trim() && !formData.dyes.includes(dyeInput.trim())) {
      setFormData({
        ...formData,
        dyes: [...formData.dyes, dyeInput.trim()]
      });
      setDyeInput("");
    }
  };

  const removeDye = (index) => {
    const newDyes = formData.dyes.filter((_, i) => i !== index);
    setFormData({ ...formData, dyes: newDyes });
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'chemical') addChemical();
      if (type === 'dye') addDye();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:8080/api/fabric/create",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccess(true);
      
      toast({
        title: "Process Created Successfully! 🎉",
        description: `Fabric process for ${formData.brandName} has been created.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
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

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Server error. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total cost
  const totalCost = formData.qty * formData.rate;

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <Box maxW="800px" mx="auto" mt={8} mb={8} px={4}>
        {/* Success Alert */}
        <Collapse in={showSuccess} animateOpacity>
          <Alert status="success" borderRadius="lg" mb={6} variant="left-accent">
            <AlertIcon />
            Fabric process created successfully! The entry has been saved to the system.
          </Alert>
        </Collapse>

        {/* Main Form Container */}
        <Box
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          boxShadow={shadow}
          borderRadius="2xl"
          overflow="hidden"
        >
          {/* Header Section */}
          <Box bg={gradient} p={6}>
            <Flex direction="column" align="center" color="white">
              <Icon as={FaFire} boxSize={8} mb={3} />
              <Heading size="lg" fontWeight="bold" textAlign="center">
                🔥 Fabric Process Entry
              </Heading>
              <Text textAlign="center" mt={2} opacity={0.9}>
                Create new fabric processing details
              </Text>
            </Flex>
          </Box>

          {/* Form Body */}
          <Box p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Main Form Grid */}
                <Grid templateColumns="repeat(2, 1fr)" gap={6} w="100%">
                  
                  {/* DC Number */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        <HStack>
                          <Icon as={FaTag} />
                          <Text>DC Number</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaTag} />
                        </InputLeftElement>
                        <Input
                          name="dcNo"
                          value={formData.dcNo}
                          onChange={handleChange}
                          placeholder="Enter DC number"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ 
                            borderColor: primaryColor, 
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                            transform: "scale(1.02)"
                          }}
                          transition="all 0.2s"
                          bg="white"
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Brand Name */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        Brand Name
                      </FormLabel>
                      <Select
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        placeholder="Select brand"
                        borderColor={borderColor}
                        _hover={{ borderColor: primaryColor }}
                        _focus={{ 
                          borderColor: primaryColor, 
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                          transform: "scale(1.02)"
                        }}
                        transition="all 0.2s"
                        bg="white"
                      >
                        {brandOptions.map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>

                  {/* Quantity */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        Quantity
                      </FormLabel>
                      <NumberInput
                        value={formData.qty}
                        onChange={(value) => handleNumberChange("qty", value)}
                        min={0}
                        precision={0}
                      >
                        <NumberInputField
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ 
                            borderColor: primaryColor, 
                            boxShadow: `0 0 0 1px ${primaryColor}` 
                          }}
                          bg="white"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper borderColor={primaryColor} color={primaryColor} />
                          <NumberDecrementStepper borderColor={primaryColor} color={primaryColor} />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>

                  {/* Color */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        <HStack>
                          <Icon as={FaPalette} />
                          <Text>Color</Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Select color"
                        borderColor={borderColor}
                        _hover={{ borderColor: primaryColor }}
                        _focus={{ 
                          borderColor: primaryColor, 
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                          transform: "scale(1.02)"
                        }}
                        transition="all 0.2s"
                        bg="white"
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>

                  {/* Machine Number */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        <HStack>
                          <Icon as={FaWarehouse} />
                          <Text>Machine No</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaWarehouse} />
                        </InputLeftElement>
                        <Input
                          name="machineNo"
                          value={formData.machineNo}
                          onChange={handleChange}
                          placeholder="e.g., M-001"
                          borderColor={borderColor}
                          _hover={{ borderColor: primaryColor }}
                          _focus={{ 
                            borderColor: primaryColor, 
                            boxShadow: `0 0 0 1px ${primaryColor}`,
                            transform: "scale(1.02)"
                          }}
                          transition="all 0.2s"
                          bg="white"
                        />
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Rate */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        <HStack>
                          <Icon as={FaDollarSign} />
                          <Text>Rate (per unit)</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaDollarSign} />
                        </InputLeftElement>
                        <NumberInput
                          value={formData.rate}
                          onChange={(value) => handleNumberChange("rate", value)}
                          min={0}
                          precision={2}
                          w="100%"
                        >
                          <NumberInputField
                            pl="10"
                            borderColor={borderColor}
                            _hover={{ borderColor: primaryColor }}
                            _focus={{ 
                              borderColor: primaryColor, 
                              boxShadow: `0 0 0 1px ${primaryColor}` 
                            }}
                            bg="white"
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Lot Weight */}
                  <GridItem colSpan={1}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        <HStack>
                          <Icon as={FaWeight} />
                          <Text>Lot Weight (kg)</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.400">
                          <Icon as={FaWeight} />
                        </InputLeftElement>
                        <NumberInput
                          value={formData.lotWeight}
                          onChange={(value) => handleNumberChange("lotWeight", value)}
                          min={0}
                          precision={2}
                          w="100%"
                        >
                          <NumberInputField
                            pl="10"
                            borderColor={borderColor}
                            _hover={{ borderColor: primaryColor }}
                            _focus={{ 
                              borderColor: primaryColor, 
                              boxShadow: `0 0 0 1px ${primaryColor}` 
                            }}
                            bg="white"
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </GridItem>

                  {/* Total Cost Display */}
                  <GridItem colSpan={1}>
                    <FormControl>
                      <FormLabel fontWeight="semibold" color={secondaryColor}>
                        <HStack>
                          <Icon as={FaCalculator} />
                          <Text>Total Cost</Text>
                        </HStack>
                      </FormLabel>
                      <Box
                        p={3}
                        border="2px"
                        borderColor={primaryColor}
                        borderRadius="md"
                        bg={`${primaryColor}15`}
                        color={secondaryColor}
                        fontWeight="bold"
                        textAlign="center"
                        fontSize="lg"
                      >
                        ${totalCost.toFixed(2)}
                      </Box>
                    </FormControl>
                  </GridItem>
                </Grid>

                {/* Chemicals Section */}
                <FormControl w="100%">
                  <FormLabel fontWeight="semibold" color={secondaryColor}>
                    <HStack>
                      <Icon as={FaFlask} />
                      <Text>Chemicals</Text>
                      <Badge colorScheme="red" borderRadius="full" bg={primaryColor}>
                        {formData.chemical.length}
                      </Badge>
                    </HStack>
                  </FormLabel>
                  <HStack mb={3}>
                    <Input
                      value={chemicalInput}
                      onChange={(e) => setChemicalInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'chemical')}
                      placeholder="Add chemical name..."
                      borderColor={borderColor}
                      _hover={{ borderColor: primaryColor }}
                      _focus={{ 
                        borderColor: primaryColor, 
                        boxShadow: `0 0 0 1px ${primaryColor}` 
                      }}
                      bg="white"
                    />
                    <Button
                      leftIcon={<FaPlus />}
                      onClick={addChemical}
                      bg={primaryColor}
                      color="white"
                      _hover={{
                        bg: secondaryColor,
                        transform: "scale(1.05)"
                      }}
                      isDisabled={!chemicalInput.trim()}
                    >
                      Add
                    </Button>
                  </HStack>
                  <Flex flexWrap="wrap" gap={2}>
                    {formData.chemical.map((chem, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        bg={primaryColor}
                        color="white"
                      >
                        <TagLabel>{chem}</TagLabel>
                        <TagCloseButton onClick={() => removeChemical(index)} />
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>

                {/* Dyes Section */}
                <FormControl w="100%">
                  <FormLabel fontWeight="semibold" color={secondaryColor}>
                    <HStack>
                      <Icon as={FaFillDrip} />
                      <Text>Dyes</Text>
                      <Badge colorScheme="red" borderRadius="full" bg={secondaryColor}>
                        {formData.dyes.length}
                      </Badge>
                    </HStack>
                  </FormLabel>
                  <HStack mb={3}>
                    <Input
                      value={dyeInput}
                      onChange={(e) => setDyeInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'dye')}
                      placeholder="Add dye name..."
                      borderColor={borderColor}
                      _hover={{ borderColor: primaryColor }}
                      _focus={{ 
                        borderColor: primaryColor, 
                        boxShadow: `0 0 0 1px ${primaryColor}` 
                      }}
                      bg="white"
                    />
                    <Button
                      leftIcon={<FaPlus />}
                      onClick={addDye}
                      bg={secondaryColor}
                      color="white"
                      _hover={{
                        bg: primaryColor,
                        transform: "scale(1.05)"
                      }}
                      isDisabled={!dyeInput.trim()}
                    >
                      Add
                    </Button>
                  </HStack>
                  <Flex flexWrap="wrap" gap={2}>
                    {formData.dyes.map((dye, index) => (
                      <Tag
                        key={index}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        bg={secondaryColor}
                        color="white"
                      >
                        <TagLabel>{dye}</TagLabel>
                        <TagCloseButton onClick={() => removeDye(index)} />
                      </Tag>
                    ))}
                  </Flex>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  loadingText="Creating Fabric Process..."
                  bg={gradient}
                  color="white"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: `0 10px 25px -5px ${primaryColor}80`,
                    bg: secondaryColor
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.3s ease"
                  boxShadow="lg"
                  mt={4}
                  height="60px"
                  fontSize="lg"
                  leftIcon={<FaSave />}
                >
                  🚀 Create Fabric Process
                </Button>
              </VStack>
            </form>
          </Box>
        </Box>
      </Box>
    </ScaleFade>
  );
}