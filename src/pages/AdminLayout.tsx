import { Box, Flex, VStack, HStack, Heading, Text, Icon } from '@chakra-ui/react';
import { FiGrid, FiUsers, FiStar, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useEffect } from 'react';

const AdminLayout = () => {
  const { user, isLoggedIn, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Security check: Kick out non-admins immediately
  useEffect(() => {
    if (isLoggedIn && user?.role !== "admin") {
      navigate("/");
    }
  }, [user, isLoggedIn, navigate]);

  if (!isLoggedIn || user?.role !== "admin") return null;

  const navItems = [
    { name: 'Manage Schools', path: '/admin/schools', icon: FiGrid },
    { name: 'Manage Users', path: '/admin/users', icon: FiUsers },
    { name: 'Manage Reviews', path: '/admin/reviews', icon: FiStar },
  ];

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      
      {/* Sidebar */}
      <Box 
        w={{ base: "70px", md: "250px" }} 
        bg="white" 
        borderRightWidth="1px" 
        borderColor="gray.200" 
        display="flex" 
        flexDirection="column"
        shadow="sm"
        zIndex={10}
      >
        {/* Header */}
        <Box p={6} borderBottomWidth="1px" borderColor="gray.100">
          <Heading size="md" color="blue.600" display={{ base: "none", md: "block" }}>
            Admin Panel
          </Heading>
          <Icon as={FiGrid} boxSize={6} color="blue.600" display={{ base: "block", md: "none" }} mx="auto" />
        </Box>

        {/* Navigation Links */}
        <VStack flex={1} align="stretch" gap={2} p={4} overflowY="auto">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link to={item.path} key={item.name}>
                <HStack 
                  p={3} 
                  borderRadius="lg" 
                  bg={isActive ? "blue.50" : "transparent"}
                  color={isActive ? "blue.700" : "gray.600"}
                  _hover={{ bg: "gray.100" }}
                  transition="all 0.2s"
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text fontWeight={isActive ? "bold" : "medium"} display={{ base: "none", md: "block" }}>
                    {item.name}
                  </Text>
                </HStack>
              </Link>
            );
          })}
        </VStack>

        {/* Footer Actions */}
        <VStack p={4} borderTopWidth="1px" borderColor="gray.100" align="stretch" gap={2}>
          <Link to="/">
            <HStack p={3} borderRadius="lg" color="gray.600" _hover={{ bg: "gray.100" }}>
              <Icon as={FiArrowLeft} boxSize={5} />
              <Text fontWeight="medium" display={{ base: "none", md: "block" }}>Back to Site</Text>
            </HStack>
          </Link>
          
          <Box as="button" onClick={logoutUser} w="full">
            <HStack p={3} borderRadius="lg" color="red.500" _hover={{ bg: "red.50" }}>
              <Icon as={FiLogOut} boxSize={5} />
              <Text fontWeight="medium" display={{ base: "none", md: "block" }}>Logout</Text>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Main Content Area */}
      <Box flex={1} overflowY="auto" position="relative">
        <Outlet /> {/* This is where your specific admin pages will render */}
      </Box>
      
    </Flex>
  );
};

export default AdminLayout;