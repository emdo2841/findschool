import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, Text, VStack, SimpleGrid, Icon, HStack, Separator } from '@chakra-ui/react';
import { FiNavigation, FiMapPin} from 'react-icons/fi';
import axios from 'axios';
import SchoolCard  from '../components/SchoolCard';
import SchoolCardSkeleton  from '../components/SchoolCardSkeleton';

const NearbySchools: React.FC = () => {
  const [data, setData] = useState<{same_lga: any[], same_state: any[]}>({ same_lga: [], same_state: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('https://school-search-ovue.onrender.com/api/schools/nearby', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, []);

  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack align="stretch" gap={12}>
          
          <VStack align="start" gap={1}>
            <Heading size="2xl" fontWeight="black" color="blue.700">Recommended for You</Heading>
            <Text color="gray.500" fontSize="lg">Top-rated schools in your immediate vicinity.</Text>
          </VStack>

          {/* Section 1: In your LGA */}
          <Box>
            <HStack mb={6} gap={3}>
              <Icon as={FiNavigation} color="blue.500" fontSize="2xl" />
              <Heading size="md">Within your Local Government</Heading>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
              {loading 
                ? [1, 2, 3, 4].map(i => <SchoolCardSkeleton key={i} />)
                : data.same_lga.map(school => <SchoolCard key={school._id} school={school} />)
              }
            </SimpleGrid>
            {!loading && data.same_lga.length === 0 && <Text color="gray.400" py={10}>No schools found in your LGA.</Text>}
          </Box>

          <Separator />

          {/* Section 2: In your State */}
          <Box>
            <HStack mb={6} gap={3}>
              <Icon as={FiMapPin} color="purple.500" fontSize="2xl" />
              <Heading size="md">Popular across the State</Heading>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
              {loading 
                ? [1, 2, 3, 4].map(i => <SchoolCardSkeleton key={i} />)
                : data.same_state.map(school => <SchoolCard key={school._id} school={school} />)
              }
            </SimpleGrid>
          </Box>

        </VStack>
      </Container>
    </Box>
  );
};

export default NearbySchools;