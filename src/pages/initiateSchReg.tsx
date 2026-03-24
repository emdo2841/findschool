import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added useNavigate
import { 
  Box, Button, Fieldset, Input, VStack, Stack, Text, Heading, 
  SimpleGrid, Icon, Group, InputElement, Center, Spinner, HStack
} from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import axios from 'axios';

const InitiateSchool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // 2. State for the success modal
  const navigate = useNavigate(); // Initialize navigation

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    state: '', lga: '', street: '',
    schoolType: '', school_method: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolType || !formData.school_method) {
      toaster.create({
        title: "Selection Required",
        description: "Please pick a School Type and Method.",
        type: "error"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('https://school-search-ovue.onrender.com/api/schools/initiate', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Show modal and start 5-second countdown to redirect
      setShowModal(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);

    } catch (error: any) {
      toaster.create({
        title: "Error",
        description: error.response?.data?.message || "Failed to initiate registration",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Styling for the native selects
  const subtleSelectStyle = {
    padding: '10px 16px',
    borderRadius: '0.375rem',
    backgroundColor: '#f1f5f9',
    border: 'none',
    width: '100%',
    color: '#1a202c',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <Box maxW="2xl" mx="auto" mt={10} p={4} position="relative">
      
      {/* 4. SUCCESS MODAL OVERLAY */}
      {showModal && (
        <Box 
          position="fixed" top={0} left={0} w="100vw" h="100vh" 
          bg="blackAlpha.600" backdropFilter="blur(4px)" 
          zIndex={9999} display="flex" alignItems="center" justifyContent="center"
        >
          <Box bg="white" p={10} borderRadius="2xl" w="90%" maxW="md" textAlign="center" shadow="2xl">
            <Center mb={6}>
              <Box bg="green.100" p={4} borderRadius="full">
                <Icon as={FiCheck} color="green.500" boxSize={10} />
              </Box>
            </Center>
            <Heading size="lg" mb={4} color="gray.800">Verification Sent!</Heading>
            <Text color="gray.600" fontSize="md" mb={8} lineHeight="tall">
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your inbox to complete your school registration.
            </Text>
            <HStack justify="center" color="gray.400">
              <Spinner size="sm" />
              <Text fontSize="sm" fontWeight="medium">
                Redirecting to homepage in 5 seconds...
              </Text>
            </HStack>
          </Box>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap={8}>
          <VStack align="start" gap={1}>
            <Heading size="2xl" fontWeight="extrabold" color="gray.800">
              Register Your School
            </Heading>
            <Text color="gray.500" fontSize="md">
              Complete the details below to start your registration.
            </Text>
          </VStack>

          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 10px 40px rgba(0,0,0,0.04)" border="1px solid" borderColor="gray.100">
            <Fieldset.Root size="lg">
              <Stack gap={10}>
                
                {/* --- Section 1: School Type Selection --- */}
                <VStack align="stretch" gap={4}>
                  <Heading size="xs" textTransform="uppercase" letterSpacing="widest" color="blue.600">
                    School Level
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    <OptionCard label="Basic" isActive={formData.schoolType === 'basic'} onClick={() => setFormData({...formData, schoolType: 'basic'})} />
                    <OptionCard label="Basic & Secondary" isActive={formData.schoolType === 'basic_secondary'} onClick={() => setFormData({...formData, schoolType: 'basic_secondary'})} />
                    <OptionCard label="Secondary" isActive={formData.schoolType === 'secondary'} onClick={() => setFormData({...formData, schoolType: 'secondary'})} />
                  </SimpleGrid>
                </VStack>

                {/* --- Section 2: School Method Selection --- */}
                <VStack align="stretch" gap={4}>
                  <Heading size="xs" textTransform="uppercase" letterSpacing="widest" color="blue.600">
                    Attendance Method
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    <OptionCard label="Day" isActive={formData.school_method === 'day'} onClick={() => setFormData({...formData, school_method: 'day'})} />
                    <OptionCard label="Boarding" isActive={formData.school_method === 'boarding'} onClick={() => setFormData({...formData, school_method: 'boarding'})} />
                    <OptionCard label="Both" isActive={formData.school_method === 'day_and_boarding'} onClick={() => setFormData({...formData, school_method: 'day_and_boarding'})} />
                  </SimpleGrid>
                </VStack>

                {/* --- Section 3: Identity & Location --- */}
                <Fieldset.Content>
                  <VStack align="stretch" gap={5}>
                    <Heading size="xs" textTransform="uppercase" letterSpacing="widest" color="blue.600">
                      Contact & Location
                    </Heading>
                    
                    <CustomInputGroup icon={MdSchool}>
                      <Input placeholder="Official School Name" variant="subtle" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </CustomInputGroup>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <CustomInputGroup icon={FiMail}>
                        <Input type="email" placeholder="School Email" variant="subtle" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                      </CustomInputGroup>
                      <CustomInputGroup icon={FiPhone}>
                        <Input placeholder="Phone Number" variant="subtle" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                      </CustomInputGroup>
                    </SimpleGrid>

                    {/* Location Dropdowns Side-by-Side */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <select name="state" value={formData.state} onChange={handleStateChange} style={subtleSelectStyle} required>
                        <option value="">{loadingLocations ? "Loading..." : "Select State"}</option>
                        {locations.map((stateName) => <option key={stateName} value={stateName}>{stateName}</option>)}
                      </select>

                      <select name="lga" value={formData.lga} onChange={handleChange} style={subtleSelectStyle} disabled={!formData.state || loadingLgas} required>
                        <option value="">{loadingLgas ? "Loading LGAs..." : "Select LGA"}</option>
                        {availableLgas.map((lgaName) => <option key={lgaName} value={lgaName}>{lgaName}</option>)}
                      </select>
                    </SimpleGrid>
                    
                    <CustomInputGroup icon={FiMapPin}>
                      <Input placeholder="Street Address" variant="subtle" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} required />
                    </CustomInputGroup>
                  </VStack>
                </Fieldset.Content>

                <Button 
                  type="submit" 
                  loading={loading} 
                  colorPalette="blue" 
                  size="lg" 
                  borderRadius="xl"
                  disabled={showModal} // Prevent clicking again while modal is up
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                >
                  <Icon as={FiSend} mr={2} /> Initiate Registration
                </Button>
              </Stack>
            </Fieldset.Root>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

/**
 * Custom Premium Option Card
 */
const OptionCard = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => {
  return (
    <Box
      as="button"
      onClick={onClick}
      flex="1"
      p={4}
      borderWidth="2px"
      borderRadius="xl"
      transition="all 0.2s"
      textAlign="center"
      position="relative"
      bg={isActive ? "blue.50" : "white"}
      borderColor={isActive ? "blue.500" : "gray.100"}
      _hover={{ borderColor: isActive ? "blue.600" : "gray.300" }}
    >
      {isActive && (
        <Box position="absolute" top={2} right={2} color="blue.500">
          <Icon as={FiCheck} />
        </Box>
      )}
      <Text fontWeight="bold" color={isActive ? "blue.700" : "gray.600"} fontSize="sm">
        {label}
      </Text>
    </Box>
  );
};

/**
 * Robust Input Group (Avoids dependency on external UI folder)
 */
const CustomInputGroup = ({ children, icon }: { children: React.ReactNode, icon: any }) => (
  <Group w="full">
    <InputElement pointerEvents="none" color="gray.400">
      <Icon as={icon} />
    </InputElement>
    {children}
  </Group>
);

export default InitiateSchool;