import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { 
  Box, Container, Image, Heading, Text, HStack, VStack, 
  Avatar, Badge, Icon, SimpleGrid, Separator, Button, 
  Skeleton, Spacer, Center, Textarea, Input
} from '@chakra-ui/react';
import { 
  FiPhone, FiMail, FiMapPin, FiUsers, FiStar, FiTrash2, FiEdit2, FiPlus, FiCheck, FiUploadCloud, FiSettings
} from 'react-icons/fi';
import { type School } from '../types';
import axios from 'axios';
import { toaster, Toaster } from '../components/ui/toaster'; 

// --- Helper to decode JWT and get user ID ---
const getUserIdFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id;
  } catch (e) {
    return null;
  }
};

// --- Custom Star Rating Component ---
const InteractiveStars = ({ rating, onRatingChange, readonly = false }: { rating: number, onRatingChange?: (val: number) => void, readonly?: boolean }) => {
  const [hover, setHover] = useState(0);
  return (
    <HStack gap={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          as="span"
          cursor={readonly ? "default" : "pointer"}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          display="inline-flex"
        >
          <Icon 
            as={FiStar} 
            boxSize={readonly ? 4 : 6} 
            fill={star <= (hover || rating) ? "currentColor" : "none"} 
            color={star <= (hover || rating) ? "orange.400" : "gray.300"}
            transition="all 0.2s"
          />
        </Box>
      ))}
    </HStack>
  );
};

const SchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth & Permissions
  const token = localStorage.getItem('accessToken');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const currentUserId = getUserIdFromToken(token);
  // Check if current user is the owner (handles populated or unpopulated user field)
  const isOwner = school && currentUserId && (school.user?._id === currentUserId || school.user === currentUserId);

  // Review States
  const [myReview, setMyReview] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number>(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false); 

  // School Update States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "", street: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const schoolRes = await axios.get(`https://school-search-ovue.onrender.com/api/schools/${id}`);
      setSchool(schoolRes.data.data);
      // Pre-fill edit form
      setEditFormData({
        name: schoolRes.data.data.name,
        phone: schoolRes.data.data.phone,
        street: schoolRes.data.data.street,
      });

      if (token) {
        try {
          const reviewRes = await axios.get(`https://school-search-ovue.onrender.com/api/schools/${id}/reviews/me`, authHeaders);
          setMyReview(reviewRes.data.data);
          setRating(reviewRes.data.data.rating); 
        } catch (err: any) {
          if (err.response?.status === 401) {
            localStorage.removeItem('accessToken'); 
          }
        }
      }
    } catch (err) {
      setError("Could not load school details.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // -------------------------------------------------------------
  // SCHOOL MANAGEMENT FUNCTIONS (OWNERS ONLY)
  // -------------------------------------------------------------

  const handleUpdateSchool = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(`https://school-search-ovue.onrender.com/api/schools/${id}`, editFormData, authHeaders);
      toaster.create({ description: "School details updated!", type: "success" });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to update school", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      // Change "image" to "images" to match your backend exactly
      formData.append("images", files[i]); 
    } 
    setIsSubmitting(true);
    toaster.create({ description: "Uploading images... Please wait.", type: "info" });

    try {
      await axios.patch(`https://school-search-ovue.onrender.com/api/schools/${id}/images`, formData, {
        headers: {
          ...authHeaders.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      toaster.create({ description: "Images uploaded successfully!", type: "success" });
      fetchData();
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to upload images", type: "error" });
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!window.confirm("Delete this image?")) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/schools/${id}/images`, {
        headers: authHeaders.headers,
        data: { imageUrl } // Axios delete requires body to be inside 'data' property
      });
      toaster.create({ description: "Image deleted!", type: "success" });
      fetchData();
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to delete image", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteSchool = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/schools/${id}`, authHeaders);
      toaster.create({ description: "School deleted successfully!", type: "success" });
      navigate("/"); // Redirect to home or schools list
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to delete school", type: "error" });
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchoolClick = () => {
    toaster.create({
      description: "DANGER: Are you sure you want to permanently delete this school?",
      type: "error",
      duration: 8000, 
      action: {
        label: "Yes, Delete School",
        onClick: () => executeDeleteSchool(),
      },
    });
  };

  // -------------------------------------------------------------
  // REVIEW FUNCTIONS
  // -------------------------------------------------------------
  const handleSubmitReview = async () => { /* existing code... */
    if (!token) return toaster.create({ description: "Please log in to submit a review", type: "error" });
    if (rating === 0) return toaster.create({ description: "Please select a star rating first", type: "warning" });
    setIsSubmitting(true);
    try {
      await axios.post(`https://school-search-ovue.onrender.com/api/schools/${id}/reviews`, { comment: newComment, rating: Number(rating) }, authHeaders);
      toaster.create({ description: "Review submitted successfully!", type: "success" });
      setNewComment("");
      fetchData(); 
    } catch (err: any) {
      toaster.create({ description: err.response?.data?.message || "Failed to submit review", type: "error" });
    } finally { setIsSubmitting(false); }
  };

  const handleAddComment = async () => { /* existing code... */
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post(`https://school-search-ovue.onrender.com/api/schools/${id}/reviews/comments`, { comment: newComment }, authHeaders);
      toaster.create({ description: "Comment added successfully!", type: "success" });
      setNewComment("");
      fetchData();
    } catch (err: any) { toaster.create({ description: err.response?.data?.message || "Failed to add comment", type: "error" }); } finally { setIsSubmitting(false); }
  };

  const handleUpdateRating = async () => { /* existing code... */
    setIsSubmitting(true);
    try {
      await axios.patch(`https://school-search-ovue.onrender.com/api/schools/${id}/reviews/rating`, { rating: Number(rating) }, authHeaders);
      toaster.create({ description: "Rating updated successfully!", type: "success" });
      setIsEditingRating(false); fetchData();
    } catch (err: any) { toaster.create({ description: err.response?.data?.message || "Failed to update rating", type: "error" }); } finally { setIsSubmitting(false); }
  };

  const executeDeleteReview = async () => { /* existing code... */
    setIsSubmitting(true);
    try {
      await axios.delete(`https://school-search-ovue.onrender.com/api/schools/${id}/reviews`, authHeaders);
      toaster.create({ description: "Review deleted successfully!", type: "success" });
      setMyReview(null); setNewComment(""); setRating(0); setIsEditingRating(false); fetchData();
    } catch (err: any) { toaster.create({ description: err.response?.data?.message || "Failed to delete review", type: "error" }); } finally { setIsSubmitting(false); }
  };

  const handleDeleteReviewClick = () => {
    toaster.create({ description: "Are you sure you want to delete your review?", type: "warning", action: { label: "Yes, Delete", onClick: () => executeDeleteReview() } });
  };


  if (error) return <Center h="50vh"><Text color="red.500">{error}</Text></Center>;
  if (!school) return <Skeleton h="100vh" />;

  return (
    <Box bg="gray.50" minH="100vh" position="relative" mt={12}>
      
      {/* UPDATE MODAL / POP UP FORM */}
      {isEditModalOpen && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.600" zIndex={9999} display="flex" alignItems="center" justifyContent="center">
          <Box bg="white" p={8} borderRadius="2xl" w="90%" maxW="500px" shadow="2xl">
            <Heading size="md" mb={6}>Update School Details</Heading>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>School Name</Text>
                <Input value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>Phone Number</Text>
                <Input value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>Street Address</Text>
                <Input value={editFormData.street} onChange={(e) => setEditFormData({...editFormData, street: e.target.value})} />
              </Box>
              <HStack justifyContent="flex-end" mt={4}>
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button colorPalette="blue" onClick={handleUpdateSchool} disabled={isSubmitting}>Save Changes</Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Hero Header */}
      <Box h="400px" position="relative" overflow="hidden">
        <Image 
          src={school.image?.[0] || 'https://via.placeholder.com/1200x400'} 
          w="full" h="full" objectFit="cover" 
          filter="brightness(0.6)"
        />
        <Container maxW="container.xl" position="absolute" bottom={10} left={0} right={0}>
          <VStack align="start" color="white" gap={4}>
            <HStack>
              <Badge colorPalette="blue" size="lg" variant="solid">Verified Institution</Badge>
              <Badge colorPalette="purple" size="lg" variant="subtle">{school.schoolType}</Badge>
            </HStack>
            <Heading size="4xl" fontWeight="black">{school.name}</Heading>
            <HStack gap={6}>
              <HStack><Icon as={FiMapPin} /> <Text>{school.state}, Nigeria</Text></HStack>
              <HStack><Icon as={FiUsers} /> <Text>{school.school_method} Enrollment</Text></HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={12}>
          
          {/* Main Content (Left Side) */}
          <Box lg={{ gridColumn: 'span 2' }}> 
            <VStack align="stretch" gap={10}>
              
              {/* OWNER CONTROLS PANEL */}
              {isOwner && (
                <Box bg="blue.50" p={6} borderRadius="2xl" border="1px solid" borderColor="blue.200">
                  <HStack mb={4}>
                    <Icon as={FiSettings} color="blue.600" />
                    <Heading size="sm" color="blue.800">School Management (Owner)</Heading>
                  </HStack>
                  <HStack wrap="wrap" gap={4}>
                    <Button size="sm" colorPalette="blue" variant="solid" onClick={() => setIsEditModalOpen(true)}>
                      <Icon as={FiEdit2} mr={2} /> Edit Details
                    </Button>
                    
                    {/* Hidden file input for images */}
                    <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
                    <Button size="sm" colorPalette="green" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                      <Icon as={FiUploadCloud} mr={2} /> Add Images
                    </Button>
                    
                    <Spacer />
                    <Button size="sm" colorPalette="red" variant="ghost" onClick={handleDeleteSchoolClick} disabled={isSubmitting}>
                      <Icon as={FiTrash2} mr={2} /> Delete School
                    </Button>
                  </HStack>
                </Box>
              )}

              <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                <Heading size="md" mb={6}>About this Institution</Heading>
                <Text color="gray.600" lineHeight="tall" fontSize="lg">
                  Located at {school.street}, {school.lga}, this institution is led by {school.user?.first_name} {school.user?.last_name}. 
                  It offers a {school.school_method} approach to {school.schoolType} education, ensuring global standards.
                </Text>
              </Box>

              {/* IMAGE GALLERY WITH DELETE BUTTONS */}
              {school.image && school.image.length > 0 && (
                <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                  <Heading size="md" mb={6}>Gallery</Heading>
                  <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                    {school.image.map((imgUrl, index) => (
                      <Box key={index} position="relative" borderRadius="md" overflow="hidden" h="150px">
                        <Image src={imgUrl} w="full" h="full" objectFit="cover" />
                        {isOwner && (
                          <Button 
                            position="absolute" top={2} right={2} 
                            size="xs" colorPalette="red" variant="solid"
                            onClick={() => handleDeleteImage(imgUrl)}
                            disabled={isSubmitting}
                          >
                            <Icon as={FiTrash2} />
                          </Button>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {/* Add Comment / Create Review Form */}
              <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
                <Heading size="md" mb={6}>
                  {myReview ? "Add a Comment to your Review" : "Leave a Review"}
                </Heading>
                
                {token ? (
                  <VStack align="stretch" gap={4}>
                    {!myReview && (
                      <HStack mb={2}>
                        <Text fontWeight="bold">Select Rating:</Text>
                        <InteractiveStars rating={rating} onRatingChange={setRating} readonly={false} />
                      </HStack>
                    )}

                    <Textarea 
                      placeholder={myReview ? "Add another comment to your experience..." : "Share your experience about this school..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />

                    <HStack justifyContent="flex-end">
                      {myReview ? (
                        <Button colorPalette="blue" onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()}>
                          <Icon as={FiPlus} mr={2}/> Add Comment
                        </Button>
                      ) : (
                        <Button colorPalette="blue" onClick={handleSubmitReview} disabled={isSubmitting || rating === 0}>
                          Submit Review
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                ) : (
                  <Text color="gray.500">Please log in to leave a review.</Text>
                )}
              </Box>

              {/* Reviews Section */}
              <VStack align="stretch" gap={6}>
                <Heading size="lg">Recent Reviews</Heading>
                {school.review && school.review.length > 0 ? (
                  school.review.map((rev: any) => {
                    const isMyReview = myReview && myReview._id === rev._id;

                    return (
                      <Box 
                        key={rev._id} 
                        bg="white" 
                        p={6} 
                        borderRadius="xl" 
                        shadow="sm"
                        borderWidth={isMyReview ? "2px" : "0px"}
                        borderColor="blue.200"
                      >
                        <HStack gap={4} mb={4}>
                          <Avatar.Root size="md">
                            <Avatar.Image src={rev.user?.image} />
                            <Avatar.Fallback name={`${rev.user?.first_name} ${rev.user?.last_name}`} />
                          </Avatar.Root>
                          
                          <VStack align="start" gap={0}>
                            <HStack>
                              <Text fontWeight="bold">{rev.user?.first_name} {rev.user?.last_name}</Text>
                              {isMyReview && <Badge colorPalette="blue" size="sm">Your Review</Badge>}
                            </HStack>
                            <Text fontSize="xs" color="gray.400">{new Date(rev.createdAt).toLocaleDateString()}</Text>
                          </VStack>
                          
                          <Spacer />

                          {isMyReview && (
                            <HStack mr={2}>
                              <Button 
                                size="sm" variant="ghost" colorPalette={isEditingRating ? "gray" : "blue"} 
                                onClick={() => { if (isEditingRating) setRating(rev.rating); setIsEditingRating(!isEditingRating); }}
                              >
                                {isEditingRating ? "Cancel" : <Icon as={FiEdit2} />}
                              </Button>
                              <Button size="sm" variant="ghost" colorPalette="red" onClick={handleDeleteReviewClick} disabled={isSubmitting}>
                                <Icon as={FiTrash2} />
                              </Button>
                            </HStack>
                          )}

                          {isMyReview && isEditingRating ? (
                            <HStack>
                              <InteractiveStars rating={rating} onRatingChange={setRating} readonly={false} />
                              <Button size="sm" colorPalette="green" onClick={handleUpdateRating} disabled={isSubmitting || rating === rev.rating}>
                                <Icon as={FiCheck} /> Save
                              </Button>
                            </HStack>
                          ) : (
                            <HStack color="orange.400" gap={1}>
                              <InteractiveStars rating={rev.rating} readonly={true} />
                            </HStack>
                          )}
                        </HStack>

                        {rev.comments && rev.comments.length > 0 ? (
                          <VStack align="stretch" gap={2} mt={2}>
                            {rev.comments.map((comment: string, idx: number) => (
                              <Text key={idx} color="gray.600" fontStyle="italic">"{comment}"</Text>
                            ))}
                          </VStack>
                        ) : (
                          <Text color="gray.400" fontStyle="italic" mt={2}>No comments provided.</Text>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Text color="gray.400">No reviews yet.</Text>
                )}
              </VStack>
            </VStack>
          </Box>

          {/* Sidebar (Right Side) */}
          <Box>
            <Box bg="blue.600" color="white" p={8} borderRadius="2xl" position="sticky" top="100px">
              <Heading size="md" mb={6}>Contact Admission</Heading>
              <VStack align="stretch" gap={4}>
                <HStack><Icon as={FiPhone} /> <Text>{school.phone}</Text></HStack>
                <HStack><Icon as={FiMail} /> <Text>{school.email}</Text></HStack>
                <Separator borderColor="whiteAlpha.300" my={4} />
                <Button bg="white" color="blue.600" _hover={{ bg: 'gray.100' }} w="full" size="lg" fontWeight="bold">
                  Apply Now
                </Button>
              </VStack>
            </Box>
          </Box>

        </SimpleGrid>
      </Container>
      
      <Toaster />
    </Box>
  );
};

export default SchoolDetail;