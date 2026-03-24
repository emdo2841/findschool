import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Spinner, Heading, Text, VStack, Button, Icon } from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from 'axios';

const VerifySchool: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your school registration...');
  const [schoolId, setSchoolId] = useState<string | null>(null);
  
  // Add a ref to track if the API call was already made
  const hasFetched = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      // Prevent double execution in StrictMode
      if (hasFetched.current) return;
      hasFetched.current = true;

      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage("Missing verification token.");
        return;
      }

      try {
        const authToken = localStorage.getItem('accessToken');
        const response = await axios.post('https://school-search-ovue.onrender.com/api/schools/complete', { token }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        // Extract the school ID from the response 
        // Adjust 'response.data.data._id' if your backend formats it differently!
        const verifiedSchoolId = response.data?.data?._id || response.data?.school?._id;
        
        setStatus('success');
        setMessage("Your school has been registered successfully! Taking you there...");
        
        if (verifiedSchoolId) {
          setSchoolId(verifiedSchoolId);
          // Auto-redirect after 3 seconds
          setTimeout(() => {
            navigate(`/schools/${verifiedSchoolId}`);
          }, 3000);
        } else {
          // Fallback if no ID is found in the response
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        }

      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || "Verification failed. Link may be expired.");
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <Box h="80vh" display="flex" alignItems="center" justifyContent="center">
      <VStack gap={6} p={10} bg="white" borderRadius="xl" shadow="2xl" textAlign="center">
        {status === 'loading' && (
          <>
            <Spinner size="xl" color="blue.500" />
            <Heading size="md">{message}</Heading>
          </>
        )}

        {status === 'success' && (
          <>
            <Icon as={FiCheckCircle} fontSize="60px" color="green.500" />
            <Heading size="lg">Registration Complete!</Heading>
            <Text color="gray.600">{message}</Text>
            
            {/* Provide a manual button just in case they don't want to wait 3 seconds */}
            {schoolId ? (
              <Button colorPalette="blue" onClick={() => navigate(`/schools/${schoolId}`)}>
                Go to School Now
              </Button>
            ) : (
              <Button colorPalette="blue" onClick={() => navigate('/profile')}>
                Go to Profile
              </Button>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <Icon as={FiXCircle} fontSize="60px" color="red.500" />
            <Heading size="lg">Verification Failed</Heading>
            <Text color="gray.600">{message}</Text>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Back to Profile
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default VerifySchool;