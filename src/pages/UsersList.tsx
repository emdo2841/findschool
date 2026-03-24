import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Box, VStack, Heading, Text, Spinner, Center, SimpleGrid, 
  Badge, HStack, Container, Icon,  Avatar, Button, 
} from '@chakra-ui/react';
import { FiMail, FiMapPin, FiTrash2 } from 'react-icons/fi';
import { toaster } from "../components/ui/toaster";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

interface UserItem {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  state: string;
  image?: string;
}

const UsersList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const token = localStorage.getItem('accessToken');

  const fetchUsers = async (cursor?: string) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const url = cursor 
        ? `https://school-search-ovue.onrender.com/api/users?limit=12&cursor=${cursor}`
        : `https://school-search-ovue.onrender.com/api/users?limit=12`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedUsers = response.data.data.users;
      const returnedCursor = response.data.data.nextCursor;

      setUsers((prev) => cursor ? [...prev, ...fetchedUsers] : fetchedUsers);
      setNextCursor(returnedCursor);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toaster.create({ 
        title: "Error fetching users", 
        description: error.response?.data?.message || "Something went wrong.",
        type: "error" 
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUsers(); 
  }, []);

  // -- ADMIN: Delete User Handler --
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Admin Action: Are you sure you want to permanently delete this user?")) return;
    
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted user from the UI instantly
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toaster.create({ description: "User deleted successfully.", type: "success" });
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toaster.create({ description: err.response?.data?.message || "Failed to delete user.", type: "error" });
    }
  };

  // -- Infinite Scroll Observer --
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursor) {
        fetchUsers(nextCursor);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, nextCursor]);

  return (
    <Box bg="gray.50" minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack align="start" gap={1} mb={10}>
          <Heading size="2xl" fontWeight="black" letterSpacing="tight">User Directory</Heading>
          <Text color="gray.500" fontSize="lg">Browse all registered members, administrators, and school owners.</Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
          {loading ? (
            // Skeleton Loaders (Render 6 empty blocks while fetching initially)
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Box key={i} h="280px" bg="white" borderRadius="2xl" shadow="sm" animation="pulse 1.5s infinite" />
            ))
          ) : (
            users.map((u) => (
              <Box 
                key={u._id} 
                position="relative" // Required for the absolute positioning of the delete button
                bg="white" p={6} borderRadius="2xl" 
                boxShadow="0 4px 20px rgba(0,0,0,0.04)" 
                border="1px solid" borderColor="gray.100"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
              >
                {/* Overlay Delete Button for Admins */}
                {isAdmin && (
                  <Button
                    position="absolute"
                    top={3}
                    right={3}
                    size="xs"
                    colorPalette="red"
                    variant="solid"
                    zIndex={10}
                    onClick={() => handleDeleteUser(u._id)}
                  >
                    <Icon as={FiTrash2} />
                  </Button>
                )}

                <VStack align="center" gap={4} textAlign="center">
                  <Avatar.Root size="2xl" shape="rounded">
                    <Avatar.Fallback name={`${u.first_name} ${u.last_name}`} />
                    <Avatar.Image src={u.image} />
                  </Avatar.Root>
                  
                  <VStack gap={1}>
                    <Heading size="md" fontWeight="bold">
                      {u.first_name} {u.last_name}
                    </Heading>
                    <Badge variant="subtle" colorPalette={u.role === 'admin' ? 'red' : u.role === 'school owner' ? 'purple' : 'blue'} borderRadius="full" px={3}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </VStack>

                  <VStack gap={2} w="full" pt={2}>
                    <HStack fontSize="sm" color="gray.600">
                      <Icon as={FiMail} /> <Text truncate maxW="200px">{u.email}</Text>
                    </HStack>
                    <HStack fontSize="sm" color="gray.600">
                      <Icon as={FiMapPin} /> <Text textTransform="capitalize">{u.state || 'N/A'}</Text>
                    </HStack>
                  </VStack>

                  <Button asChild w="full" mt={2} variant="subtle" colorPalette="blue">
                    <Link to={`/users/${u._id}`}>View Profile</Link>
                  </Button>
                </VStack>
              </Box>
            ))
          )}
        </SimpleGrid>

        {/* Infinite Scroll Trigger Area */}
        {!loading && (
          <Center mt={12} py={8} ref={loadMoreRef}>
            {loadingMore && <Spinner size="xl" color="blue.500" borderWidth="4px" />}
            
            {!nextCursor && users.length > 0 && (
              <Text color="gray.500" fontWeight="medium">
                You've reached the end of the directory.
              </Text>
            )}
          </Center>
        )}
      </Container>
    </Box>
  );
};

export default UsersList;