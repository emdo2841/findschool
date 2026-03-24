import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, VStack, Heading, Text, Spinner, Center, SimpleGrid,
  Badge, HStack, Image, Container, Separator, Icon, Flex,
  Avatar, Button, Input
} from '@chakra-ui/react';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen,
  FiImage, FiEdit2, FiUploadCloud, FiTrash2, FiExternalLink
} from 'react-icons/fi';
import { toaster } from "../components/ui/toaster";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../index.css';

interface SchoolInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  street: string;
  schoolType: string;
  school_method: string;
  image?: string[]; 
}

interface UserProfile {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  state: string;
  lga: string;
  street: string;
  // Account for both singular and plural backend responses
  school?: SchoolInfo[] | SchoolInfo | null; 
  schools?: SchoolInfo[] | null; 
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic School Management States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [uploadingSchoolId, setUploadingSchoolId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "", street: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const token = localStorage.getItem('accessToken');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProfile = useCallback(async () => {
    try {
      if (!token) throw new Error("No access token found");
      const response = await axios.get('https://school-search-ovue.onrender.com/api/users/me', authHeaders);
      setProfile(response.data.data);
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

  // -------------------------------------------------------------
  // SCHOOL MANAGEMENT FUNCTIONS
  // -------------------------------------------------------------

  const openEditModal = (school: SchoolInfo) => {
    setEditingSchoolId(school._id);
    setEditFormData({
      name: school.name,
      phone: school.phone,
      street: school.street,
    });
  };

  const handleUpdateSchool = async () => {
    if (!editingSchoolId) return;
    setIsSubmitting(true);
    try {
      await axios.put(`https://school-search-ovue.onrender.com/api/schools/${editingSchoolId}`, editFormData, authHeaders);
      toaster.create({ description: "School details updated!", type: "success" });
      setEditingSchoolId(null);
      fetchProfile();
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to update school", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerImageUpload = (schoolId: string) => {
    setUploadingSchoolId(schoolId);
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadingSchoolId) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    setIsSubmitting(true);
    toaster.create({ description: "Uploading images... Please wait.", type: "info" });

    try {
      await axios.patch(`https://school-search-ovue.onrender.com/api/schools/${uploadingSchoolId}/images`, formData, {
        headers: {
          ...authHeaders.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      toaster.create({ description: "Images uploaded successfully!", type: "success" });
      fetchProfile();
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to upload images", type: "error" });
    } finally {
      setIsSubmitting(false);
      setUploadingSchoolId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (schoolId: string, imageUrl: string) => {
    if (!window.confirm("Delete this image?")) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/schools/${schoolId}/images`, {
        headers: authHeaders.headers,
        data: { imageUrl }
      });
      toaster.create({ description: "Image deleted!", type: "success" });
      fetchProfile();
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to delete image", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteSchool = async (schoolId: string) => {
    setIsSubmitting(true);
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/schools/${schoolId}`, authHeaders);
      toaster.create({ description: "School deleted successfully!", type: "success" });
      fetchProfile(); 
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to delete school", type: "error" });
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchoolClick = (schoolId: string) => {
    toaster.create({
      description: "DANGER: Are you sure you want to permanently delete this school?",
      type: "error",
      duration: 8000,
      action: {
        label: "Yes, Delete",
        onClick: () => executeDeleteSchool(schoolId),
      },
    });
  };

  // -------------------------------------------------------------
  // BULLETPROOF ARRAY NORMALIZATION
  // This extracts all schools whether backend sends 'schools' or 'school'
  // -------------------------------------------------------------
  let extractedSchools: SchoolInfo[] = [];
  if (profile?.schools && Array.isArray(profile.schools)) {
    extractedSchools = profile.schools;
  } else if (profile?.school && Array.isArray(profile.school)) {
    extractedSchools = profile.school;
  } else if (profile?.school) {
    extractedSchools = [profile.school as SchoolInfo];
  }
  const schoolsList = extractedSchools;

  if (isLoading) {
    return (
      <Center h="80vh">
        <VStack gap={4}>
          <Spinner size="xl" borderWidth="4px" color="blue.600" />
          <Text fontWeight="medium" color="gray.500">SECURELY LOADING PROFILE...</Text>
        </VStack>
      </Center>
    );
  }

  if (!profile) return null;

  return (
    <section>
      <Box bg="gray.50" minH="100vh" py={10} mt={12} position="relative">

        {/* Global hidden file input for images */}
        <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />

        {/* --- EDIT SCHOOL MODAL --- */}
        {editingSchoolId && (
          <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.600" zIndex={9999} display="flex" alignItems="center" justifyContent="center">
            <Box bg="white" p={8} borderRadius="2xl" w="90%" maxW="500px" shadow="2xl">
              <Heading size="md" mb={6}>Update School Details</Heading>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>School Name</Text>
                  <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Phone Number</Text>
                  <Input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Street Address</Text>
                  <Input value={editFormData.street} onChange={(e) => setEditFormData({ ...editFormData, street: e.target.value })} />
                </Box>
                <HStack justifyContent="flex-end" mt={4}>
                  <Button variant="ghost" onClick={() => setEditingSchoolId(null)} disabled={isSubmitting}>Cancel</Button>
                  <Button colorPalette="blue" onClick={handleUpdateSchool} disabled={isSubmitting}>Save Changes</Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        <Container maxW="container.md">
          <VStack gap={8} align="stretch">

            {/* --- HERO SECTION --- */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap={6} mb={2}>
              <HStack gap={5}>
                <Avatar.Root size="2xl" shape="rounded">
                  <Avatar.Fallback name={`${profile.first_name} ${profile.last_name}`} />
                  <Avatar.Image src="" />
                </Avatar.Root>

                <VStack align="start" gap={1}>
                  <Heading size="2xl" fontWeight="extrabold" color="gray.800">
                    {profile.first_name} {profile.last_name}
                  </Heading>
                  <HStack color="gray.500" fontSize="md">
                    <Icon as={FiMail} />
                    <Text>{profile.email}</Text>
                  </HStack>
                </VStack>
              </HStack>

              <Badge variant="subtle" colorPalette={profile.role === 'admin' ? 'red' : 'blue'} px={4} py={1} borderRadius="full" fontSize="sm" boxShadow="sm">
                {profile.role.toUpperCase()}
              </Badge>
            </Flex>

            <Separator borderColor="gray.200" />

            {/* --- USER DETAILS CARD --- */}
            <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.05)">
              <Heading size="md" mb={6} fontWeight="bold" display="flex" alignItems="center" gap={2}>
                <Icon as={FiUser} color="blue.500" /> Personal Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                <InfoItem label="Phone Number" value={profile.phone || "Not provided"} icon={FiPhone} />
                <InfoItem label="Address" value={`${profile.street}, ${profile.lga}, ${profile.state}`} icon={FiMapPin} />
              </SimpleGrid>
            </Box>

            {/* --- SCHOOL ENTITIES --- */}
            <HStack justify="space-between">
              <Heading size="md" fontWeight="bold" color="gray.700">Associated Organizations</Heading>
              {schoolsList.length > 0 && (
                <Button asChild size="xs" variant="outline" colorPalette="blue">
                  <Link to="/initiate-school">Register Another</Link>
                </Button>
              )}
            </HStack>

            {/* THE LOOP STARTING HERE */}
            {schoolsList.length > 0 ? (
              <VStack align="stretch" gap={6}>
                {schoolsList.map((s) => (
                  <Box key={s._id} bg="white" borderRadius="2xl" overflow="hidden" boxShadow="0 10px 30px rgba(0,0,0,0.08)" border="1px solid" borderColor="gray.100">
                    <Flex direction={{ base: 'column', lg: 'row' }}>

                      {/* PRIMARY IMAGE AREA */}
                      {s.image && s.image.length > 0 ? (
                        <Box position="relative" w={{ base: 'full', lg: '280px' }} h={{ base: '200px', lg: 'auto' }}>
                          <Image src={s.image[0]} alt={s.name} w="full" h="full" objectFit="cover" />
                          <Button position="absolute" top={2} right={2} size="xs" colorPalette="red" onClick={() => handleDeleteImage(s._id, s.image![0])} disabled={isSubmitting}>
                            <Icon as={FiTrash2} />
                          </Button>
                        </Box>
                      ) : (
                        <Center w={{ base: 'full', lg: '280px' }} h={{ base: '200px', lg: 'auto' }} bg="blue.50" color="blue.200">
                          <VStack gap={1}>
                            <Icon as={FiImage} fontSize="40px" />
                            <Text fontSize="xs" fontWeight="bold" color="blue.300">NO IMAGE</Text>
                          </VStack>
                        </Center>
                      )}

                      <VStack align="start" p={8} gap={4} flex="1">
                        
                        {/* HEADER & ACTION ICONS */}
                        <HStack justify="space-between" w="full" wrap="wrap">
                          <VStack align="start" gap={0}>
                            <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="widest">
                              Official Partner
                            </Text>
                            <Heading size="lg">{s.name}</Heading>
                          </VStack>

                          <HStack gap={1} bg="gray.50" p={1} borderRadius="lg" border="1px solid" borderColor="gray.200">
                            <Button size="sm" variant="ghost" colorPalette="blue" onClick={() => openEditModal(s)} disabled={isSubmitting} title="Edit Details">
                              <Icon as={FiEdit2} />
                            </Button>
                            <Button size="sm" variant="ghost" colorPalette="green" onClick={() => triggerImageUpload(s._id)} disabled={isSubmitting} title="Add Images">
                              <Icon as={FiUploadCloud} />
                            </Button>
                            <Button size="sm" variant="ghost" colorPalette="red" onClick={() => handleDeleteSchoolClick(s._id)} disabled={isSubmitting} title="Delete School">
                              <Icon as={FiTrash2} />
                            </Button>
                          </HStack>
                        </HStack>

                        <SimpleGrid columns={1} gap={3} w="full">
                          <HStack fontSize="sm" color="gray.600">
                            <Icon as={FiMail} /> <Text>{s.email}</Text>
                          </HStack>
                          <HStack fontSize="sm" color="gray.600">
                            <Icon as={FiPhone} /> <Text>{s.phone}</Text>
                          </HStack>
                        </SimpleGrid>

                        <HStack justify="space-between" w="full" pt={2} wrap="wrap">
                          <HStack gap={3}>
                            <Badge variant="solid" colorPalette="blue" px={3} borderRadius="lg">{s.schoolType}</Badge>
                            <Badge variant="outline" colorPalette="gray" px={3} borderRadius="lg">{s.school_method}</Badge>
                          </HStack>
                          <Button asChild size="sm" variant="subtle" colorPalette="blue">
                            <Link to={`/schools/${s._id}`}>
                              View Page <Icon as={FiExternalLink} ml={1} />
                            </Link>
                          </Button>
                        </HStack>
                      </VStack>
                    </Flex>

                    {/* GALLERY: SHOWING EXTRA IMAGES IF MORE THAN ONE EXISTS */}
                    {s.image && s.image.length > 1 && (
                      <Box p={6} borderTop="1px solid" borderColor="gray.100" bg="gray.50">
                        <Heading size="xs" mb={4} color="gray.500" textTransform="uppercase">Additional Images</Heading>
                        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                          {s.image.slice(1).map((imgUrl, idx) => (
                            <Box key={idx} position="relative" borderRadius="md" overflow="hidden" h="100px">
                              <Image src={imgUrl} w="full" h="full" objectFit="cover" />
                              <Button position="absolute" top={1} right={1} size="xs" colorPalette="red" onClick={() => handleDeleteImage(s._id, imgUrl)} disabled={isSubmitting}>
                                <Icon as={FiTrash2} />
                              </Button>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <Center p={12} borderRadius="2xl" border="2px dashed" borderColor="gray.200" bg="white">
                <VStack gap={4}>
                  <Icon as={FiBookOpen} fontSize="3xl" color="gray.300" />
                  <Text color="gray.500" fontWeight="medium">No school association found.</Text>
                  <Button asChild size="sm" variant="subtle" colorPalette="blue">
                    <Link to="/initiate-school">
                      Register a School <Icon as={FiExternalLink} ml={1} />
                    </Link>
                  </Button>
                </VStack>
              </Center>
            )}

          </VStack>
        </Container>
      </Box>
    </section>
  );
};

// InfoItem Helper
const InfoItem = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <HStack align="start" gap={4}>
    <Center bg="blue.50" p={3} borderRadius="xl" color="blue.600">
      <Icon as={icon} fontSize="20px" />
    </Center>
    <VStack align="start" gap={0}>
      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="tighter">{label}</Text>
      <Text fontWeight="semibold" color="gray.700" fontSize="md">{value}</Text>
    </VStack>
  </HStack>
);

export default Profile;