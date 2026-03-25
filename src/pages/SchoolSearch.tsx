import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, Container, VStack, Heading, Text, SimpleGrid, 
  Input, Icon, HStack, Group, InputElement, Center, Button
} from '@chakra-ui/react';
import { FiSearch, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import  SchoolCard  from '../components/SchoolCard'; 
import  SchoolCardSkeleton  from '../components/SchoolCardSkeleton';

const SchoolSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ schoolType: '', school_method: '' });

  const fetchResults = useCallback(async () => {
    // Prevent empty searches if your backend validator requires at least one field
    if (!query.trim() && !filters.schoolType && !filters.school_method) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // FIX FOR 422: Build a clean params object. 
      // Do not include keys with empty string values.
      const params: any = { page };
      if (query.trim()) params.name = query;
      if (filters.schoolType) params.schoolType = filters.schoolType;
      if (filters.school_method) params.school_method = filters.school_method;

      const res = await axios.get('https://school-search-ovue.onrender.com/api/schools/search', { params });
      
      setResults(res.data.data.schools);
      setTotalPages(res.data.data.totalPages);
    } catch (err: any) {
      // Log the specific backend validation error
      console.error("Backend Validation Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [query, filters, page]);

  // Debounce logic
  useEffect(() => {
    const timeout = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeout);
  }, [fetchResults]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [query, filters]);

  return (
    <Box bg="gray.50" minH="100vh" py={10} mt={12}>
      <Container maxW="container.lg" mt={12}>
        <VStack gap={8} align="stretch">
          
          {/* Header */}
          <VStack align="start" gap={1}>
            <Heading size="2xl" fontWeight="black" letterSpacing="tight">Find a School</Heading>
            <Text color="gray.500">Discover institutions matching your specific needs.</Text>
          </VStack>

          {/* Search Bar Group */}
          <Box 
            bg="white" 
            p={2} 
            borderRadius="full" 
            boxShadow="0 10px 30px rgba(0,0,0,0.04)" 
            border="1px solid" 
            borderColor="gray.100"
          >
            <Group w="full">
              <InputElement pointerEvents="none" pl={4}>
                <Icon as={FiSearch} color="blue.500" fontSize="xl" />
              </InputElement>
              <Input 
                placeholder="Search by name..."
                variant="flushed"
                h="50px"
                fontSize="lg"
                px={10}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Group>
          </Box>

          {/* Filter Pills */}
          <HStack gap={3} justify="center">
            <FilterTag 
              label="Primary" 
              active={filters.schoolType === 'basic'} 
              onClick={() => setFilters({...filters, schoolType: filters.schoolType === 'basic' ? '' : 'basic'})} 
            />
            <FilterTag 
              label="Secondary" 
              active={filters.schoolType === 'secondary'} 
              onClick={() => setFilters({...filters, schoolType: filters.schoolType === 'secondary' ? '' : 'secondary'})} 
            />
            <FilterTag 
              label="Boarding" 
              active={filters.school_method === 'boarding'} 
              onClick={() => setFilters({...filters, school_method: filters.school_method === 'boarding' ? '' : 'boarding'})} 
            />
          </HStack>

          {/* Results Grid */}
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
              {[1, 2, 3].map(i => <SchoolCardSkeleton key={i} />)}
            </SimpleGrid>
          ) : results.length > 0 ? (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                {results.map((school: any) => <SchoolCard key={school._id} school={school} />)}
              </SimpleGrid>

              {/* Pagination Controls */}
              <HStack justify="center" pt={10} gap={4}>
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  variant="outline"
                >
                  <Icon as={FiChevronLeft} mr={2} /> Previous
                </Button>
                <Text fontWeight="bold">Page {page} of {totalPages}</Text>
                <Button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next <Icon as={FiChevronRight} ml={2} />
                </Button>
              </HStack>
            </>
          ) : query && (
            <Center py={20} flexDirection="column">
              <Icon as={FiSliders} fontSize="4xl" color="gray.200" mb={4} />
              <Text color="gray.500">No schools match your search criteria.</Text>
            </Center>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

const FilterTag = ({ label, active, onClick }: any) => (
  <Box 
    as="button" onClick={onClick} px={6} py={2} borderRadius="full" fontSize="xs" fontWeight="bold"
    transition="all 0.2s" bg={active ? "blue.600" : "white"} color={active ? "white" : "gray.600"}
    border="1px solid" borderColor={active ? "blue.600" : "gray.200"}
    _hover={{ transform: 'translateY(-1px)', boxShadow: 'sm' }}
  >
    {label}
  </Box>
);

export default SchoolSearch;