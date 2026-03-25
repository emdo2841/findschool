import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, VStack, Heading, Text, Spinner, Center, SimpleGrid, 
  Badge, HStack, Container, Separator, Icon, Flex, Avatar, Button, Image
} from '@chakra-ui/react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiArrowLeft, FiImage, FiExternalLink, FiBookOpen } from 'react-icons/fi';
import { toaster } from "../components/ui/toaster";
import axios from 'axios';

// 1. Added the SchoolInfo interface
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

// 2. Added the school property to the PublicProfile interface
interface PublicProfile {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  state: string;
  lga: string;
  street: string;
  image?: string;
  school?: SchoolInfo[] | SchoolInfo | null; 
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`https://school-search-ovue.onrender.com/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.data);
      } catch (error: any) {
        toaster.create({ 
          title: "User Not Found", 
          description: error.response?.data?.message || "Could not load this profile.",
          type: "error" 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <Center h="80vh">
        <VStack gap={4}>
          <Spinner size="xl" borderWidth="4px" color="blue.600" />
          <Text fontWeight="medium" color="gray.500">LOADING PROFILE...</Text>
        </VStack>
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="80vh">
        <VStack gap={4}>
          <Icon as={FiUser} fontSize="50px" color="gray.300" />
          <Heading size="md" color="gray.600">User not found</Heading>
          <Button asChild mt={4} colorPalette="blue" variant="subtle">
            <Link to="/users">Back to Directory</Link>
          </Button>
        </VStack>
      </Center>
    );
  }

  // Safely normalize schools to an array just like we did in the private Profile!
  const schoolsList: SchoolInfo[] = Array.isArray(user.school) 
    ? user.school 
    : (user.school ? [user.school as SchoolInfo] : []);

  return (
    <Box bg="gray.50" minH="100vh" py={10} mt={12}>
      <Container maxW="container.md">
        
        {/* Back Button */}
        <Button asChild variant="ghost" mb={6} color="gray.500">
          <Link to="/users"><Icon as={FiArrowLeft} mr={2} /> Back to Directory</Link>
        </Button>

        <VStack gap={8} align="stretch">
          
          {/* --- HERO SECTION --- */}
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap={6}>
            <HStack gap={5}>
              <Avatar.Root size="2xl" shape="rounded">
                <Avatar.Fallback name={`${user.first_name} ${user.last_name}`} />
                <Avatar.Image src={user.image} />
              </Avatar.Root>

              <VStack align="start" gap={1}>
                <Heading size="2xl" fontWeight="extrabold" color="gray.800">
                  {user.first_name} {user.last_name}
                </Heading>
                <HStack color="gray.500" fontSize="md">
                  <Icon as={FiMail} />
                  <Text>{user.email}</Text>
                </HStack>
              </VStack>
            </HStack>

            <Badge 
              variant="subtle" 
              colorPalette={user.role === 'admin' ? 'red' : user.role === 'school owner' ? 'purple' : 'blue'} 
              px={4} py={1} borderRadius="full" fontSize="sm" boxShadow="sm"
            >
              {user.role.toUpperCase()}
            </Badge>
          </Flex>

          <Separator borderColor="gray.200" />

          {/* --- USER DETAILS CARD --- */}
          <Box bg="white" p={8} borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.05)">
            <Heading size="md" mb={6} fontWeight="bold" display="flex" alignItems="center" gap={2}>
              <Icon as={FiUser} color="blue.500" /> Public Information
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
              <InfoItem label="Phone Number" value={user.phone || "Not provided"} icon={FiPhone} />
              <InfoItem label="Location" value={`${user.lga}, ${user.state}`} icon={FiMapPin} />
            </SimpleGrid>
          </Box>

          {/* --- ASSOCIATED SCHOOLS SECTION --- */}
          <Heading size="md" mt={4} fontWeight="bold" color="gray.700">Registered Organizations</Heading>
          
          {schoolsList.length > 0 ? (
            <VStack align="stretch" gap={6}>
              {schoolsList.map((school) => (
                <Box key={school._id} bg="white" borderRadius="2xl" overflow="hidden" boxShadow="0 10px 30px rgba(0,0,0,0.08)" border="1px solid" borderColor="gray.100">
                  <Flex direction={{ base: 'column', lg: 'row' }}>

                    {/* School Cover Image */}
                    {school.image && school.image.length > 0 ? (
                      <Box w={{ base: 'full', lg: '280px' }} h={{ base: '200px', lg: 'auto' }}>
                        <Image src={school.image[0]} alt={school.name} w="full" h="full" objectFit="cover" />
                      </Box>
                    ) : (
                      <Center w={{ base: 'full', lg: '280px' }} h={{ base: '200px', lg: 'auto' }} bg="blue.50" color="blue.200">
                        <VStack gap={1}>
                          <Icon as={FiImage} fontSize="40px" />
                          <Text fontSize="xs" fontWeight="bold" color="blue.300">NO IMAGE</Text>
                        </VStack>
                      </Center>
                    )}

                    {/* School Details & Link */}
                    <VStack align="start" p={8} gap={4} flex="1" justify="center">
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" letterSpacing="widest">
                          Official Partner
                        </Text>
                        <Heading size="lg">{school.name}</Heading>
                      </VStack>

                      <HStack fontSize="sm" color="gray.600">
                        <Icon as={FiMapPin} /> <Text textTransform="capitalize">{school.lga}, {school.state}</Text>
                      </HStack>

                      <HStack justify="space-between" w="full" pt={2} wrap="wrap">
                        <HStack gap={3}>
                          <Badge variant="solid" colorPalette="blue" px={3} borderRadius="lg">{school.schoolType}</Badge>
                          <Badge variant="outline" colorPalette="gray" px={3} borderRadius="lg">{school.school_method}</Badge>
                        </HStack>
                        <Button asChild size="sm" variant="subtle" colorPalette="blue">
                          <Link to={`/schools/${school._id}`}>
                            View Page <Icon as={FiExternalLink} ml={1} />
                          </Link>
                        </Button>
                      </HStack>
                    </VStack>

                  </Flex>
                </Box>
              ))}
            </VStack>
          ) : (
            <Center p={10} borderRadius="2xl" border="1px dashed" borderColor="gray.300" bg="transparent">
              <VStack gap={2}>
                <Icon as={FiBookOpen} fontSize="2xl" color="gray.400" />
                <Text color="gray.500" fontWeight="medium">This user has no registered schools.</Text>
              </VStack>
            </Center>
          )}

        </VStack>
      </Container>
    </Box>
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

export default UserDetail;