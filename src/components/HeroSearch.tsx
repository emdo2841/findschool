import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Input, VStack, Heading, Text, Icon, 
  Group, InputElement, Button, Center 
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

const HeroSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirects to your search page and passes the search term in the URL
      navigate(`/search?name=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <Center minH="60vh" w="full" px={4} mt={12}>
      <VStack gap={8} w="full" maxW="800px" textAlign="center">
        
        {/* Hero Text */}
        <VStack gap={3}>
          <Heading 
            size="4xl" 
            fontWeight="black" 
            letterSpacing="tight"
            bgGradient="to-r" gradientFrom="blue.600" gradientTo="purple.500"
            bgClip="text"
          >
            Find the Perfect School.
          </Heading>
          <Text fontSize="xl" color="gray.500">
            Search thousands of verified primary and secondary schools across Nigeria.
          </Text>
        </VStack>

        {/* The "Google-Like" Search Bar */}
        <Box w="full" bg="white" p={2} borderRadius="full" boxShadow="0 10px 40px rgba(0,0,0,0.08)" border="1px solid" borderColor="gray.100">
          <form onSubmit={handleSearch}>
            <Group w="full" display="flex">
              <InputElement pointerEvents="none" pl={4}>
                <Icon as={FiSearch} color="gray.400" fontSize="xl" />
              </InputElement>
              
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by school name..." 
                variant="outline"
                border="none"
                _focus={{ boxShadow: 'none' }} // Removes the default blue glow
                height="60px"
                fontSize="lg"
                pl={12}
                flex="1"
              />
              
              <Button 
                type="submit"
                colorPalette="blue" 
                height="60px" 
                px={8} 
                borderRadius="full" 
                fontSize="md" 
                fontWeight="bold"
              >
                Search
              </Button>
            </Group>
          </form>
        </Box>

        {/* Quick Suggestion Tags (Optional, but very "Google") */}
        <Group wrap="wrap" justify="center" gap={3} mt={4}>
          <Text color="gray.500" fontSize="sm" mr={2}>Trending:</Text>
          {['Boarding', 'Lagos', 'Secondary', 'Abuja'].map((tag) => (
            <Button 
              key={tag} 
              size="xs" 
              variant="subtle" 
              colorPalette="gray" 
              borderRadius="full"
              onClick={() => navigate(`/search?text=${tag}`)}
            >
              {tag}
            </Button>
          ))}
        </Group>

      </VStack>
    </Center>
  );
};

export default HeroSearch;