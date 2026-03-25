import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Box, VStack, Heading, Text, Spinner, Center, SimpleGrid, 
  Container, Separator, Icon, Flex, Avatar, Button, Input, Fieldset
} from '@chakra-ui/react';
import { 
  FiUser, FiUpload, FiTrash2, FiSave, FiAlertTriangle 
} from 'react-icons/fi';
import { toaster } from "../components/ui/toaster";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

interface UserProfile {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  street: string;
  image?: string;
  role: string;
}

const Settings: React.FC = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Action Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', state: '', lga: '', street: ''
  });

  // Location API States
  const [locations, setLocations] = useState<string[]>([]);
  const [availableLgas, setAvailableLgas] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem('accessToken');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch Current User
  const fetchProfile = useCallback(async () => {
    try {
      if (!token) throw new Error("No access token found");
      const response = await axios.get('https://school-search-ovue.onrender.com/api/users/me', authHeaders);
      const userData = response.data.data;
      
      setProfile(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        state: userData.state || '',
        lga: userData.lga || '',
        street: userData.street || '',
      });

      if (userData.state) {
        fetchLgasForState(userData.state);
      }

    } catch (error: any) {
      toaster.create({ title: "Session Expired", type: "error" });
      logoutUser();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [token, logoutUser, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --- LOCATION API LOGIC (Now Bulletproof) ---
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const response = await axios.get('https://nga-states-lga.onrender.com/fetch');
        // SAFEGUARD: Only set if it's actually an array
        if (Array.isArray(response.data)) {
          setLocations(response.data);
        } else {
          setLocations([]);
        }
      } catch (error) {
        console.error("Failed to load locations", error);
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const fetchLgasForState = async (stateName: string) => {
    setLoadingLgas(true);
    try {
      const response = await axios.get(`https://nga-states-lga.onrender.com/?state=${stateName}`);
      // SAFEGUARD: Only set if it's actually an array
      if (Array.isArray(response.data)) {
        setAvailableLgas(response.data);
      } else {
        setAvailableLgas([]);
      }
    } catch (error) {
      console.error("Failed to fetch LGAs", error);
      setAvailableLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    setFormData(prev => ({ ...prev, state: selectedState, lga: '' }));
    
    if (!selectedState) {
      setAvailableLgas([]);
      return;
    }
    fetchLgasForState(selectedState);
  };
  // --------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSaving(true);
    try {
      await axios.put(`https://school-search-ovue.onrender.com/api/users/${profile._id}`, formData, authHeaders);
      toaster.create({ description: "Profile updated successfully!", type: "success" });
      fetchProfile();
    } catch (error: any) {
      toaster.create({ description: error.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const uploadData = new FormData();
    uploadData.append("image", file); 

    setIsUploading(true);
    toaster.create({ description: "Uploading image...", type: "info" });

    try {
      await axios.patch(`https://school-search-ovue.onrender.com/api/users/${profile._id}/image`, uploadData, {
        headers: {
          ...authHeaders.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      toaster.create({ description: "Profile image updated!", type: "success" });
      fetchProfile();
    } catch (error: any) {
      toaster.create({ description: error.response?.data?.message || "Failed to upload image", type: "error" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    
    const confirmMsg = "DANGER: Are you absolutely sure you want to delete your account? This action cannot be undone.";
    if (!window.confirm(confirmMsg)) return;

    setIsDeleting(true);
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/users/${profile._id}`, authHeaders);
      toaster.create({ description: "Account deleted successfully.", type: "success" });
      logoutUser();
      navigate('/');
    } catch (error: any) {
      toaster.create({ description: error.response?.data?.message || "Failed to delete account", type: "error" });
      setIsDeleting(false);
    }
  };

  const subtleSelectStyle = {
    padding: '10px 16px',
    borderRadius: '0.375rem',
    backgroundColor: '#f1f5f9',
    border: 'none',
    width: '100%',
    color: '#1a202c',
    outline: 'none',
    cursor: 'pointer',
    height: '40px'
  };

  if (isLoading) {
    return (
      <Center h="80vh">
        <VStack gap={4}>
          <Spinner size="xl" borderWidth="4px" color="blue.600" />
          <Text fontWeight="medium" color="gray.500">LOADING SETTINGS...</Text>
        </VStack>
      </Center>
    );
  }

  if (!profile) return null;

  return (
    <Box bg="gray.50" minH="100vh" py={12} mt={12}>
      <Container maxW="container.md">
        <VStack gap={8} align="stretch">
          
          <VStack align="start" gap={1}>
            <Heading size="2xl" fontWeight="black" letterSpacing="tight" color="gray.800">
              Account Settings
            </Heading>
            <Text color="gray.500" fontSize="md">
              Manage your personal information, profile picture, and account security.
            </Text>
          </VStack>

          {/* --- SECTION 1: PROFILE PICTURE --- */}
          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.04)" border="1px solid" borderColor="gray.100">
            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
              <Icon as={FiUser} color="blue.500" /> Profile Picture
            </Heading>
            
            <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={6}>
              <Avatar.Root size="2xl" shape="rounded" bg="gray.100">
                <Avatar.Fallback name={`${profile.first_name} ${profile.last_name}`} />
                {/* Secondary Safeguard: Make sure image isn't accidentally an array from old tests */}
                <Avatar.Image src={Array.isArray(profile.image) ? profile.image[0] : profile.image} />
              </Avatar.Root>
              
              <VStack align={{ base: 'center', sm: 'start' }} gap={3}>
                <Text color="gray.600" fontSize="sm" textAlign={{ base: 'center', sm: 'left' }}>
                  Upload a high-quality image. Max size: 5MB. Formats: JPG, PNG.
                </Text>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg, image/jpg" 
                />
                
                <Button colorPalette="blue" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} loading={isUploading}>
                  <Icon as={FiUpload} mr={2} /> Change Photo
                </Button>
              </VStack>
            </Flex>
          </Box>

          {/* --- SECTION 2: PERSONAL INFORMATION --- */}
          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.04)" border="1px solid" borderColor="gray.100">
            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
              <Icon as={FiSave} color="blue.500" /> Personal Details
            </Heading>
            
            <form onSubmit={handleUpdateProfile}>
              <Fieldset.Root size="lg">
                <VStack gap={5} align="stretch">
                  
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>Email Address (Read-only)</Text>
                    <Input value={profile.email} disabled bg="gray.50" />
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>First Name</Text>
                      <Input name="first_name" variant="subtle" value={formData.first_name} onChange={handleChange} required />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>Last Name</Text>
                      <Input name="last_name" variant="subtle" value={formData.last_name} onChange={handleChange} required />
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>Phone Number</Text>
                    <Input name="phone" variant="subtle" value={formData.phone} onChange={handleChange} placeholder="+234..." required />
                  </Box>

                  <Separator my={2} borderColor="gray.100" />
                  <Heading size="sm" color="gray.500" textTransform="uppercase">Location</Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>State</Text>
                      <select name="state" value={formData.state} onChange={handleStateChange} style={subtleSelectStyle} required>
                        <option value="">{loadingLocations ? "Loading..." : "Select State"}</option>
                        {/* SAFEGUARD: Inline check just in case */}
                        {Array.isArray(locations) && locations.map((stateName) => <option key={stateName} value={stateName}>{stateName}</option>)}
                      </select>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>LGA</Text>
                      <select name="lga" value={formData.lga} onChange={handleChange} style={subtleSelectStyle} disabled={!formData.state || loadingLgas} required>
                        <option value="">{loadingLgas ? "Loading LGAs..." : "Select LGA"}</option>
                        {/* SAFEGUARD: Inline check just in case */}
                        {Array.isArray(availableLgas) && availableLgas.map((lgaName) => <option key={lgaName} value={lgaName}>{lgaName}</option>)}
                      </select>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>Street Address</Text>
                    <Input name="street" variant="subtle" value={formData.street} onChange={handleChange} required />
                  </Box>

                  <Flex justify="flex-end" pt={4}>
                    <Button type="submit" colorPalette="blue" size="lg" loading={isSaving}>
                      Save Changes
                    </Button>
                  </Flex>

                </VStack>
              </Fieldset.Root>
            </form>
          </Box>

          {/* --- SECTION 3: DANGER ZONE --- */}
          <Box bg="red.50" p={8} borderRadius="2xl" border="1px solid" borderColor="red.200">
            <Heading size="md" color="red.700" mb={2} display="flex" alignItems="center" gap={2}>
              <Icon as={FiAlertTriangle} /> Danger Zone
            </Heading>
            <Text color="red.600" mb={6} fontSize="sm">
              Permanently delete your account and all associated data. This action cannot be reversed. If you own a school, you must delete or transfer it first.
            </Text>
            
            <Button colorPalette="red" variant="solid" onClick={handleDeleteAccount} loading={isDeleting}>
              <Icon as={FiTrash2} mr={2} /> Delete Account
            </Button>
          </Box>

        </VStack>
      </Container>
    </Box>
  );
};

export default Settings;