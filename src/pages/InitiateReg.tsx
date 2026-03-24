import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  VStack, 
  Heading,
  Link,
  Text,
  Stack,
  Field, // New replacement for FormControl/FormLabel
} from '@chakra-ui/react';
import { toaster } from "../components/ui/toaster"; // Path depends on your setup
import axios, { AxiosError } from 'axios';
import type { InitiateData } from '../types';
import { useNavigate, Link as RouterLink, type NavigateFunction } from 'react-router-dom';

const InitiateRegistration: React.FC = () => {
  const [formData, setFormData] = useState<InitiateData>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate:NavigateFunction = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('https://school-search-ovue.onrender.com/api/auth/send-otp', formData);
      toaster.create({
        title: "Check your email!",
        description: "We've sent a magic link to complete your setup.",
        type: "success",
      });
      navigate('/');
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toaster.create({
        title: "Registration Failed",
        description: err.response?.data?.message || "Server error",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={10} p={8} borderWidth="1px" borderRadius="xl">
      <form onSubmit={handleSubmit}>
        <VStack gap={5}>
          <Heading size="lg">Create Account</Heading>
          
          <Field.Root required>
            <Field.Label>Email Address</Field.Label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <Input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </Field.Root>

          <Button type="submit" colorPalette="blue" w="full" loading={isLoading}>
            Get Magic Link
          </Button>
        </VStack>
      </form>
      <Stack direction="row" justify="center" gap={1} pt={2}>
                  <Text fontSize="sm">Don't have an account?</Text>
                  <Link 
                    asChild 
                    colorPalette="blue" 
                    fontWeight="semibold" 
                    fontSize="sm"
                  >
                    <RouterLink to="/initiate-registration">Register here</RouterLink>
                  </Link>
                </Stack>
    </Box>
  );
};

export default InitiateRegistration;