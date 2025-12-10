import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Heading,
  useToast,
  Grid,
} from "@chakra-ui/react";

import { createCustomer } from "../utils/axiosInstance";  // ✅ import backend API

const CustomerDetailsForm = () => {
  const toast = useToast();

  const primaryColor = "#FF6B6B";

  const [form, setForm] = useState({
    companyName: "",
    customerName: "",
    receiverNo: "",
    fabric: "",
    color: "",
    dia: "",
    roll: "",
    weight: "",
    partyDcNo: "",
    date: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName) {
      toast({ title: "Company Name is required", status: "error" });
      return;
    }

    try {
      const response = await createCustomer(form);  // ✅ POST to backend

      toast({
        title: "Customer Saved Successfully",
        status: "success",
      });

      // Reset form
      setForm({
        companyName: "",
        customerName: "",
        receiverNo: "",
        fabric: "",
        color: "",
        dia: "",
        roll: "",
        weight: "",
        partyDcNo: "",
        date: "",
      });

      console.log("Saved:", response.data);
    } catch (error) {
      console.error("Error saving customer:", error);

      toast({
        title: "Failed to save customer",
        description: error.response?.data?.message || "Server error",
        status: "error",
      });
    }
  };

  return (
    <Box
      maxW={{ base: "100%", md: "700px" }}
      mx="auto"
      mt={10}
      p={{ base: 4, md: 8 }}
      borderWidth="1px"
      borderRadius="16px"
      boxShadow="lg"
      bg="white"
    >
      <Heading
        mb={6}
        textAlign="center"
        color={primaryColor}
        fontSize={{ base: "24px", md: "30px" }}
        fontWeight="700"
      >
        Customer Details
      </Heading>

      <form onSubmit={handleSubmit}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          
          {/* Company Name */}
          <FormControl isRequired>
            <FormLabel fontWeight="600">Company Name</FormLabel>
            <Input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Customer Name */}
          <FormControl>
            <FormLabel fontWeight="600">Customer Name</FormLabel>
            <Input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Receiver Number */}
          <FormControl>
            <FormLabel fontWeight="600">Receiver Number</FormLabel>
            <Input
              name="receiverNo"
              value={form.receiverNo}
              onChange={handleChange}
              placeholder="Enter mobile number"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Fabric */}
          <FormControl>
            <FormLabel fontWeight="600">Fabric</FormLabel>
            <Input
              name="fabric"
              value={form.fabric}
              onChange={handleChange}
              placeholder="Enter fabric"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Color */}
          <FormControl>
            <FormLabel fontWeight="600">Color</FormLabel>
            <Input
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Enter color"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Dia Meter */}
          <FormControl>
            <FormLabel fontWeight="600">Diameter</FormLabel>
            <Input
              name="dia"
              value={form.dia}
              onChange={handleChange}
              placeholder="Enter dia"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Roll */}
          <FormControl>
            <FormLabel fontWeight="600">Roll</FormLabel>
            <NumberInput min={0}>
              <NumberInputField
                name="roll"
                value={form.roll}
                onChange={handleChange}
                placeholder="Roll count"
                focusBorderColor={primaryColor}
              />
            </NumberInput>
          </FormControl>

          {/* Weight */}
          <FormControl>
            <FormLabel fontWeight="600">Weight</FormLabel>
            <NumberInput min={0}>
              <NumberInputField
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="Enter weight"
                focusBorderColor={primaryColor}
              />
            </NumberInput>
          </FormControl>

          {/* Party DC No */}
          <FormControl>
            <FormLabel fontWeight="600">Party DC No</FormLabel>
            <Input
              name="partyDcNo"
              value={form.partyDcNo}
              onChange={handleChange}
              placeholder="Enter DC No"
              focusBorderColor={primaryColor}
            />
          </FormControl>

          {/* Date */}
          <FormControl>
            <FormLabel fontWeight="600">Date</FormLabel>
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              focusBorderColor={primaryColor}
            />
          </FormControl>
        </Grid>

        <Button
          type="submit"
          bg={primaryColor}
          color="white"
          width="100%"
          mt={8}
          size="lg"
          borderRadius="10px"
          _hover={{ opacity: 0.9, transform: "scale(1.02)" }}
          transition="0.2s"
        >
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default CustomerDetailsForm;
