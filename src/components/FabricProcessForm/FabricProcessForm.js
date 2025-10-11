import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";

export default function FabricProcessForm({ existingData, onSuccess }) {
  const [formData, setFormData] = useState({
    dcNo: existingData?.dcNo || "",
    partName: existingData?.partName || "",
    qty: existingData?.qty || 0,
    color: existingData?.color || "",
    machineNo: existingData?.machineNo || "",
    rate: existingData?.rate || 0,
    lotWeight: existingData?.lotWeight || 0,
    waterCost: existingData?.waterCost || 0,
    chemical: existingData?.chemical || [{ name: "", qty: 0, cost: 0 }],
    dyes: existingData?.dyes || [{ name: "", qty: 0, cost: 0 }],
  });

  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const chemCost = formData.chemical.reduce((acc, c) => acc + c.cost, 0);
    const dyeCost = formData.dyes.reduce((acc, d) => acc + d.cost, 0);
    const rateCost = formData.rate * formData.lotWeight;
    const water = formData.waterCost || 0;

    setTotalCost(chemCost + dyeCost + rateCost + water);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (arrayName, idx, key, value) => {
    const updatedArray = [...formData[arrayName]];
    updatedArray[idx][key] = value;
    handleChange(arrayName, updatedArray);
  };

  const addArrayItem = (arrayName) => {
    const updatedArray = [...formData[arrayName], { name: "", qty: 0, cost: 0 }];
    handleChange(arrayName, updatedArray);
  };

  const removeArrayItem = (arrayName, idx) => {
    const updatedArray = formData[arrayName].filter((_, i) => i !== idx);
    handleChange(arrayName, updatedArray);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData, totalCost };
      if (existingData) {
        await axios.put(`/api/fabric-process/${existingData._id}`, payload);
      } else {
        await axios.post("/api/fabric-process", payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <Box
      p={5}
      bg="white"
      borderRadius="md"
      boxShadow="md"
      mb={5}
    >
      <Heading size="md" mb={4}>
        {existingData ? "Edit Fabric Process" : "Add Fabric Process"}
      </Heading>

      <VStack spacing={3} align="stretch">
        <FormControl>
          <FormLabel>DC No</FormLabel>
          <Input
            value={formData.dcNo}
            onChange={(e) => handleChange("dcNo", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Part Name</FormLabel>
          <Input
            value={formData.partName}
            onChange={(e) => handleChange("partName", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Quantity</FormLabel>
          <NumberInput
            min={0}
            value={formData.qty}
            onChange={(value) => handleChange("qty", Number(value))}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Color</FormLabel>
          <Input
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Machine No</FormLabel>
          <Input
            value={formData.machineNo}
            onChange={(e) => handleChange("machineNo", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Rate</FormLabel>
          <NumberInput
            min={0}
            value={formData.rate}
            onChange={(value) => handleChange("rate", Number(value))}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Lot Weight</FormLabel>
          <NumberInput
            min={0}
            value={formData.lotWeight}
            onChange={(value) => handleChange("lotWeight", Number(value))}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Water Cost</FormLabel>
          <NumberInput
            min={0}
            value={formData.waterCost}
            onChange={(value) => handleChange("waterCost", Number(value))}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        {/* Chemicals Section */}
        <Heading size="sm" mt={4}>
          Chemicals
        </Heading>
        {formData.chemical.map((chem, idx) => (
          <HStack key={idx} spacing={2}>
            <Input
              placeholder="Name"
              value={chem.name}
              onChange={(e) => handleArrayChange("chemical", idx, "name", e.target.value)}
            />
            <NumberInput
              min={0}
              value={chem.qty}
              onChange={(value) => handleArrayChange("chemical", idx, "qty", Number(value))}
            >
              <NumberInputField placeholder="Qty" />
            </NumberInput>
            <NumberInput
              min={0}
              value={chem.cost}
              onChange={(value) => handleArrayChange("chemical", idx, "cost", Number(value))}
            >
              <NumberInputField placeholder="Cost" />
            </NumberInput>
            <Button colorScheme="red" size="sm" onClick={() => removeArrayItem("chemical", idx)}>
              Remove
            </Button>
          </HStack>
        ))}
        <Button size="sm" onClick={() => addArrayItem("chemical")}>
          Add Chemical
        </Button>

        {/* Dyes Section */}
        <Heading size="sm" mt={4}>
          Dyes
        </Heading>
        {formData.dyes.map((dye, idx) => (
          <HStack key={idx} spacing={2}>
            <Input
              placeholder="Name"
              value={dye.name}
              onChange={(e) => handleArrayChange("dyes", idx, "name", e.target.value)}
            />
            <NumberInput
              min={0}
              value={dye.qty}
              onChange={(value) => handleArrayChange("dyes", idx, "qty", Number(value))}
            >
              <NumberInputField placeholder="Qty" />
            </NumberInput>
            <NumberInput
              min={0}
              value={dye.cost}
              onChange={(value) => handleArrayChange("dyes", idx, "cost", Number(value))}
            >
              <NumberInputField placeholder="Cost" />
            </NumberInput>
            <Button colorScheme="red" size="sm" onClick={() => removeArrayItem("dyes", idx)}>
              Remove
            </Button>
          </HStack>
        ))}
        <Button size="sm" onClick={() => addArrayItem("dyes")}>
          Add Dye
        </Button>

        <Text fontWeight="bold" mt={4}>
          Total Cost: ₹{totalCost.toFixed(2)}
        </Text>

        <Button colorScheme="blue" onClick={handleSubmit}>
          {existingData ? "Update" : "Add"}
        </Button>
      </VStack>
    </Box>
  );
}
