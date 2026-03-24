import {  Flex, Box } from '@chakra-ui/react' // <-- Added Flex and Box
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import InitiateRegistration from './pages/InitiateReg'
import CompleteRegistration from './pages/CompleteReg'
import Login from './pages/Login'
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/ProtectRoute';
import Profile from './pages/Profile';
import DynamicAside from './components/Aside'; // <-- Import your new component
import VerifySchool from './pages/CompleteSchREg'
// import Schools from './pages/Schools'
import SchoolDetail from './pages/SchoolDetail'
import NearbySchools from './pages/NearbySchools'
import SchoolSearch from './pages/SchoolSearch'
import InitiateSchool from './pages/initiateSchReg'
import './index.css' // <-- Import the CSS file for background image
import SchoolExplorer from './pages/Schools'
import UsersList from './pages/UsersList'
import UserDetail from './pages/UserDetail'
import Settings from './pages/Settings'
import HeroSearch from './components/HeroSearch'


function App() {
  return (
    <AuthProvider>
      {/* 1. Header sits at the very top, full width */}
      <section>
      <Header />
      <Toaster />

      {/* 2. Flex container puts the Sidebar and Main Content side-by-side */}
      <Flex minH="calc(100vh - 60px)"> {/* Note: adjust 60px to match your Header's height */}

        
        {/* 3. Box flex="1" ensures the main page stretches to fill the rest of the screen */}
        <Box flex="1" w="full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/initiate-registration" element={<InitiateRegistration />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route path="/schools/:id" element={<SchoolDetail />} />
            <Route path="/search" element={<SchoolSearch />} />
          

           {/* 2. ADD HERO SEARCH TO THE LANDING PAGE */}
              <Route path="/" element={<HeroSearch />} />

            {/* === PROTECTED ROUTES === */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/register-school" element={<InitiateSchool />} />
              <Route path="/verify-school" element={<VerifySchool />} />
              <Route path="/nearby" element={<NearbySchools />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/settings" element={<Settings />} />

              <Route path="/schools" element={<SchoolExplorer />} />
            </Route>
          </Routes>
        </Box>
        {/* The Sidebar automatically hides itself on public pages based on its internal logic */}
        <DynamicAside
          links={[
            { name: 'My Profile', url: '/profile' },
            { name: 'Schools Nearby', url: '/nearby' },
            { name: 'Search Schools', url: '/search' },
            {name: 'Register School', url: '/register-school' },
            
          ]}
        />

      </Flex>
      </section>
    </AuthProvider>
  )
}

export default App