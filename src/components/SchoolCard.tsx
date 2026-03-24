import { Box, Heading, Text, VStack, HStack, Badge, Icon, Image, Flex } from '@chakra-ui/react';
import { FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { School } from '../types';

const SchoolCard: React.FC<{ school: School }> = ({ school }) => (
  <Link to={`/schools/${school._id}`} style={{ textDecoration: 'none', width: '100%' }}>
    <Box
      role="group"
      bg="white" 
      borderRadius="2xl" 
      overflow="hidden" 
      transition="all 0.4s cubic-bezier(.17,.67,.83,.67)"
      border="1px solid"
      borderColor="gray.100"
      _hover={{ 
        transform: 'translateY(-8px)', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
        borderColor: 'blue.100' 
      }}
    >
      <Box position="relative" h="220px" overflow="hidden">
        <Image 
          src={school.image[0] || 'https://via.placeholder.com/600x400?text=Premium+School'} 
          alt={school.name}
          w="full" h="full" objectFit="cover"
          transition="transform 0.5s"
          _groupHover={{ transform: 'scale(1.1)' }}
        />
        <Badge 
          position="absolute" top={4} left={4} 
          colorPalette="blue" variant="solid" px={3} borderRadius="full"
        >
          {school.schoolType.replace('_', ' ')}
        </Badge>
      </Box>

      <VStack align="start" p={6} gap={3}>
        <HStack justify="space-between" w="full" overflow="hidden">
          <Heading size="md" truncate>{school.name}</Heading>
          <HStack color="orange.400" gap={1} flexShrink={0}>
            <Icon as={FiStar} fill="currentColor" />
            <Text fontWeight="bold" fontSize="sm">4.8</Text>
          </HStack>
        </HStack>

        <HStack color="gray.500" fontSize="sm">
          <Icon as={FiMapPin} />
          <Text truncate>{school.street}, {school.state}</Text>
        </HStack>

        <HStack gap={2} pt={2}>
          <Badge variant="subtle" colorPalette="gray">{school.school_method}</Badge>
        </HStack>
        
        <Flex w="full" pt={4} justify="flex-end" color="blue.600" fontWeight="bold" fontSize="sm" align="center" gap={1}>
          View Details <Icon as={FiArrowRight} />
        </Flex>
      </VStack>
    </Box>
  </Link>
);
export default SchoolCard;