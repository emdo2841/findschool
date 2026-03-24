import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  Field, 
  Link,
  Stack 
} from '@chakra-ui/react';
import { toaster } from "../components/ui/toaster"; 
import axios, { AxiosError } from 'axios';
import type { InitiateData } from '../types'; 

// 1. Import useAuth
import { useAuth } from '../context/authContext'; 

const Login: React.FC = () => {
  const [formData, setFormData] = useState<InitiateData>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // 2. Destructure loginUser from your context
  const { loginUser } = useAuth(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('https://school-search-ovue.onrender.com/api/auth/login', formData);
      
      // 3. REMOVED direct localStorage calls.
      // USE THE CONTEXT FUNCTION INSTEAD:
      loginUser(response.data.data.accessToken, response.data.data.refreshToken, response.data.data.user);

      toaster.create({
        title: "Login Successful",
        description: `Welcome back, ${response.data.data.user.first_name}!`,
        type: "success",
      });

      navigate('/nearby');
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toaster.create({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={20} p={8} borderWidth="1px" borderRadius="xl" boxShadow="sm">
      <form onSubmit={handleSubmit}>
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={2}>Login</Heading>
            <Text color="fg.muted">Enter your credentials to continue</Text>
          </Box>

          <Field.Root required>
            <Field.Label>Email Address</Field.Label>
            <Input 
              name="email"
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="name@company.com"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <Input 
              name="password"
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
            />
          </Field.Root>

          <Button 
            type="submit" 
            colorPalette="blue" 
            w="full" 
            size="lg" 
            loading={isLoading}
          >
            Sign In
          </Button>

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
        </VStack>
      </form>
    </Box>
  );
};

export default Login;