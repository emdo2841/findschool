import { Box, VStack, Text, HStack, Avatar, Icon, Button, Spacer } from '@chakra-ui/react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FiLogOut, FiSettings } from 'react-icons/fi';

export interface LinkItem {
  name: string;
  url: string;
}

interface DynamicAsideProps {
  links?: LinkItem[];
}

const DynamicAside = ({ links }: DynamicAsideProps) => {
  const location = useLocation();
  const Navigate = useNavigate();
  const { user, isLoggedIn, logoutUser } = useAuth(); 

  const hideOnPages = ['/login', '/initiate-registration', '/complete-registration'];
  if (hideOnPages.includes(location.pathname)) return null;

  let displayLinks: LinkItem[] = [];

  if (!isLoggedIn) {
    displayLinks = []; 
  } 
  else if (links && links.length > 0) {
    displayLinks = links;
  } 
  else {
    if (location.pathname.startsWith('/profile')) {
      displayLinks = [
        { name: 'My Details', url: '/profile' },
        { name: 'Saved Schools', url: '/profile/saved' },
        { name: 'Security', url: '/profile/security' },
      ];

      if (user?.role === 'school owner' && !user?.hasSchool) {
        displayLinks.push({ name: 'Register Your School', url: '/register-school' });
      }
    } 
    else if (location.pathname.startsWith('/dashboard')) {
      displayLinks = [
        { name: 'Overview', url: '/dashboard' },
        { name: 'Settings', url: '/dashboard/settings' },
      ];
    }
  }

  if (displayLinks.length === 0) return null;

  return (
    <Box 
      position='sticky'
      left={0}
      top='60px'
      w="260px" 
      bg="white" 
      borderRight="1px" 
      borderColor="gray.100" 
      h="calc(100vh - 60px)" 
      py={6} 
      px={4}
      display="flex"
      flexDirection="column"
      boxShadow="sm"
    >
      {/* --- TOP NAVIGATION --- */}
      <VStack align="stretch" gap={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3} px={4} letterSpacing="widest">
          Navigation
        </Text>

        {displayLinks.map((link) => {
          const isActive = location.pathname === link.url;
          return (
            <RouterLink key={link.url} to={link.url}>
              <Box
                px={4}
                py={2.5}
                borderRadius="lg"
                bg={isActive ? 'blue.50' : 'transparent'}
                color={isActive ? 'blue.600' : 'gray.600'}
                fontWeight={isActive ? '600' : '500'}
                _hover={{
                  bg: isActive ? 'blue.100' : 'gray.50',
                  color: isActive ? 'blue.700' : 'gray.900',
                  textDecoration: 'none',
                }}
                transition="all 0.2s"
              >
                <Text fontSize="sm">{link.name}</Text>
              </Box>
            </RouterLink>
          );
        })}
      </VStack>

      <Spacer />

      {/* --- BOTTOM USER CARD --- */}
      {isLoggedIn && (
        <VStack align="stretch" gap={4} pt={6} borderTop="1px" borderColor="gray.100">
          <HStack px={2} gap={3}>
            <Avatar.Root size="sm" shape="rounded">
                 {user && user.first_name ? (
                  <Avatar.Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=random&color=fff&size=64`} alt={user.first_name} />
                ) : (
                  <Avatar.Fallback name="User Name" />
                )}
            </Avatar.Root>
            <VStack align="start" gap={0} overflow="hidden">
              <Text fontSize="xs" fontWeight="bold" color="gray.800" truncate w="full">
                {user?.first_name} {user?.last_name}
              </Text>
              <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="tighter">
                {user?.role}
              </Text>
            </VStack>
          </HStack>

          <VStack gap={1}>
            <Button 
              variant="ghost" 
              size="sm" 
              color="gray.600" 
              w="full" 
              justifyContent="start" 
              px={3}
              _hover={{ bg: 'gray.100' }}
              onClick={() => Navigate('/settings')}
            >
              <Icon as={FiSettings} mr={2} /> Settings
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              color="red.500" 
              w="full" 
              justifyContent="start" 
              px={3}
              _hover={{ bg: 'red.50', color: 'red.600' }}
              onClick={logoutUser}
            >
              <Icon as={FiLogOut} mr={2} /> Logout
            </Button>
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

export default DynamicAside;