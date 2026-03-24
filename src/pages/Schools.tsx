import { useEffect, useState, useRef, useCallback } from 'react';
import { Container, SimpleGrid, Heading, Text, VStack, Center, Spinner, Box, IconButton } from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi'; // <-- Add this import
import axios from 'axios';
import type { School } from '../types';
import SchoolCard from '../components/SchoolCard';
import SchoolCardSkeleton from '../components/SchoolCardSkeleton';
import { useAuth } from '../context/authContext'; // <-- Import your auth context

const SchoolExplorer = () => {
  const { user } = useAuth(); // <-- Get current user
  const isAdmin = user?.role === "admin";

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchSchools = async (cursor?: string) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const url = cursor 
        ? `https://school-search-ovue.onrender.com/api/schools?cursor=${cursor}`
        : `https://school-search-ovue.onrender.com/api/schools`;

      const res = await axios.get(url);
      const fetchedSchools = res.data.data.schools;
      const returnedCursor = res.data.data.nextCursor;

      setSchools((prev) => cursor ? [...prev, ...fetchedSchools] : fetchedSchools);
      setNextCursor(returnedCursor);
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSchools(); 
  }, []);

  // -- ADMIN: Delete School Handler --
  const handleDeleteSchool = async (schoolId: string) => {
    if (!window.confirm("Admin Action: Are you sure you want to delete this school?")) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`https://school-search-ovue.onrender.com/api/schools/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted school from the UI instantly
      setSchools((prev) => prev.filter((school) => school._id !== schoolId));
      alert("School deleted successfully.");
    } catch (err) {
      console.error("Failed to delete school:", err);
      alert("Failed to delete school.");
    }
  };

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursor) {
        fetchSchools(nextCursor);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, nextCursor]);

  return (
    
    <Container maxW="container.xl" py={12} mt={12}>
      <VStack align="start" gap={1} mb={10}>
        <Heading size="2xl" fontWeight="black" letterSpacing="tight">Explore Schools</Heading>
        <Text color="gray.500" fontSize="lg">Discover premium educational institutions in your area.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <SchoolCardSkeleton key={i} />)
        ) : (
          schools.map((school) => (
            <Box key={school._id} position="relative">
              <SchoolCard school={school} />
              
              {/* Overlay Delete Button for Admins */}
              {isAdmin && (
                <IconButton
                  aria-label="Delete School"
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={10}
                  onClick={() => handleDeleteSchool(school._id)}
                >
                  <FiTrash2 />
                </IconButton>
              )}
            </Box>
          ))
        )}
      </SimpleGrid>

      {!loading && (
        <Center mt={12} py={8} ref={loadMoreRef}>
          {loadingMore && <Spinner size="xl" color="blue.500" borderWidth="4px" />}
          
          {!nextCursor && schools.length > 0 && (
            <Text color="gray.500" fontWeight="medium">
              You've reached the end of the list.
            </Text>
          )}
        </Center>
      )}
    </Container>
    
  );
};

export default SchoolExplorer;