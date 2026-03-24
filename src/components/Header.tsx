import {
  Box,
  Flex,
  HStack,
  Button,
  Text
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { CiUser, CiLogin, } from "react-icons/ci"; // Added CiLogin
import { PiUserPlusThin } from 'react-icons/pi';
import { useAuth } from '../context/authContext';
import { School2Icon, Users } from 'lucide-react';

const Header = () => {
  const navigate: NavigateFunction = useNavigate();
  // Assuming your auth context might also have a logout function.
  const { isLoggedIn, user } = useAuth(); 

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} px={4} position="fixed" top={0} width='100%' zIndex={100} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto">

        {/* 1. Logo / Brand */}
        <Box cursor="pointer">
          <Link to="/">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              EJ Tech
            </Text>
          </Link>
        </Box>

        {/* 2. Navigation & Auth Buttons */}
        <HStack as="nav" gap={4} display={{ base: 'none', md: 'flex' }}>
          
          {/* General Link: Schools */}
          <HStack bg="gray.100" px={3} py={1} rounded="md">
            <Button onClick={() => navigate('/schools')} variant="ghost" size="sm">
              <School2Icon size={20} /> <Text ml={2}>Schools</Text>
            </Button>
          </HStack>

          {/* Authentication & Role-Based Links */}
          {isLoggedIn ? (
            <HStack gap={3}>
              {/* Only show "Users" if the logged-in user is an admin */}
              {user?.role === 'admin' && (
                <Button onClick={() => navigate('/users')} variant="ghost" size="sm">
                  <CiUser size={20} /> <Text ml={2}>Users</Text>
                </Button>
              )}
              
              <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
                <CiUser size={20} /> <Text ml={2}>Dashboard</Text>
              </Button>

              <Button onClick={() => navigate('/users')} variant="outline"  size="sm">
                <Users  size={20}  /> <Text ml={2}>Users</Text>
              </Button>
            </HStack>
          ) : (
            <HStack gap={3}>
              <Button onClick={() => navigate('/login')} variant="ghost" size="sm">
                <CiLogin size={20} /> <Text ml={2}>Login</Text>
              </Button>
              <Button onClick={() => navigate('/initiate-registration')} variant="solid" colorScheme="blue" size="sm">
                <PiUserPlusThin size={20} /> <Text ml={2}>Sign Up</Text>
              </Button>
            </HStack>
          )}

        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;