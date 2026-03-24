import { Box, VStack, Skeleton, HStack } from '@chakra-ui/react';

const SchoolCardSkeleton = () => (
  <Box borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden" bg="white">
    <Skeleton h="220px" />
    <VStack p={6} align="start" gap={3}>
      <HStack justify="space-between" w="full">
        <Skeleton h="20px" w="70%" />
        <Skeleton h="20px" w="15%" />
      </HStack>
      <Skeleton h="15px" w="40%" />
      <Skeleton h="15px" w="30%" />
    </VStack>
  </Box>
);

export default SchoolCardSkeleton;