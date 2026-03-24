import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Center, Spinner } from '@chakra-ui/react';

const ProtectedRoute: React.FC = () => {
  const { isLoggedIn, isCheckingAuth } = useAuth(); // <--- Pull in isCheckingAuth

  // 1. Wait until we finish checking localStorage
  if (isCheckingAuth) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // 2. If finished checking and STILL not logged in, boot them to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in, render the protected component
  return <Outlet />;
};

export default ProtectedRoute;