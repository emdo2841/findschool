import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Input, 
  VStack, 
  Heading, 
  SimpleGrid, 
  Text,
  Field,
} from '@chakra-ui/react';
import { toaster } from "../components/ui/toaster"; 
import axios, { AxiosError } from 'axios';
import type { CompleteRegistrationData } from '../types';

const CompleteRegistration: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState<CompleteRegistrationData>({
    first_name: '',
    last_name: '',
    phone: '',
    state: '',
    lga: '',
    role: '',
    street: ''
  });

  // States for API data and loading
  const [locations, setLocations] = useState<string[]>([]);
  const [availableLgas, setAvailableLgas] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  // Fetch States on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const response = await axios.get('https://nga-states-lga.onrender.com/fetch');
        setLocations(response.data);
      } catch (error) {
        console.error("Failed to load locations", error);
        toaster.create({ title: "Failed to load states", type: "error" });
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  // Standard input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Special handler for State to fetch the LGA list dynamically
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    setFormData(prev => ({ ...prev, state: selectedState, lga: '' })); // Reset LGA
    
    if (!selectedState) {
      setAvailableLgas([]);
      return;
    }

    // Fetch the LGAs for this specific state
    setLoadingLgas(true);
    try {
      const response = await axios.get(`https://nga-states-lga.onrender.com/?state=${selectedState}`);
      setAvailableLgas(response.data);
    } catch (error) {
      console.error("Failed to fetch LGAs", error);
      toaster.create({ title: "Failed to load LGAs", type: "error" });
      setAvailableLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toaster.create({ title: "Invalid Token", type: "error" });
      return;
    }

    try {
      await axios.post('https://school-search-ovue.onrender.com/api/auth/register', {
        token,
        ...formData
      });
      
      toaster.create({ title: "Welcome aboard!", type: "success" });
      navigate('/login');
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toaster.create({ 
        title: "Submission Error", 
        description: err.response?.data?.message, 
        type: "error" 
      });
    }
  };

  // Reusable style for native selects
  const selectStyle = {
    padding: '8px', 
    borderRadius: '4px', 
    border: '1px solid #ccc',
    width: '100%',
    backgroundColor: 'transparent'
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={8} borderWidth="1px" borderRadius="xl">
      <form onSubmit={handleSubmit}>
        <VStack gap={6} align="stretch">
          <Heading size="md" color="blue.600" textAlign="center">
            Finalize Your Profile
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
            <Field.Root required>
              <Field.Label>First Name</Field.Label>
              <Input name="first_name" value={formData.first_name} onChange={handleChange} />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Last Name</Field.Label>
              <Input name="last_name" value={formData.last_name} onChange={handleChange} />
            </Field.Root>
          </SimpleGrid>

          <Field.Root required>
            <Field.Label>Phone (International Format)</Field.Label>
            <Input 
               name="phone" 
               placeholder="+234..." 
               value={formData.phone} 
               onChange={handleChange} 
            />
          </Field.Root>
          
          <Field.Root required>
            <Field.Label>Role</Field.Label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={selectStyle}
              required
            >
              <option value="">Select a role</option>
              <option value="user">User</option>
              <option value="school owner">School Owner</option>
            </select>
          </Field.Root>

          <Box w="full" p={4} bg="gray.50" _dark={{ bg: "gray.800" }} borderRadius="md">
            <Text fontWeight="bold" mb={3} fontSize="sm">Location Details</Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
              
              {/* State Dropdown */}
              <select 
                name="state" 
                value={formData.state} 
                onChange={handleStateChange}
                style={selectStyle}
                required
              >
                <option value="">{loadingLocations ? "Loading..." : "Select State"}</option>
                {locations.map((stateName) => (
                  <option key={stateName} value={stateName}>{stateName}</option>
                ))}
              </select>

              {/* LGA Dropdown */}
              <select 
                name="lga" 
                value={formData.lga} 
                onChange={handleChange}
                style={selectStyle}
                disabled={!formData.state || loadingLgas}
                required
              >
                <option value="">{loadingLgas ? "Loading LGAs..." : "Select LGA"}</option>
                {availableLgas.map((lgaName) => (
                  <option key={lgaName} value={lgaName}>{lgaName}</option>
                ))}
              </select>

              <Input name="street" placeholder="Street" value={formData.street} onChange={handleChange} required />
            </SimpleGrid>
          </Box>

          <Button type="submit" colorPalette="blue" w="full" size="lg">
            Complete Registration
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CompleteRegistration;