const express = require('express');
const BusinessListing = require('../models/businessListing');
const authenticateJwt = require('../utils/authenticateJwt')
const Review = require('../models/review')


const router = express.Router();

// Middleware to check the user's role
const checkUserRole = (allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
  
// Create a business listing
router.post('/business-listings', authenticateJwt, checkUserRole(['businessOwner', 'admin']), async (req, res) => {
    try {
      console.log("\nbusinesslisting port req.body", req.body)
      const { name, businessPhone, city, address, images } = req.body;
      const businessListing = await BusinessListing.create({
        name,
        businessPhone,
        city,
        address,
        images,
      });
      res.status(201).json({ message: 'Business listing created successfully', data: businessListing });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Get all business listings
router.get('/business-listings', authenticateJwt, checkUserRole(['businessOwner', 'admin', 'user']), async (req, res) => {
  try {
    const businessListings = await BusinessListing.findAll();
    res.json({ data: businessListings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a specific business listing by ID
router.get('/business-listings/:id',authenticateJwt, checkUserRole(['businessOwner', 'admin', 'user']), async (req, res) => {
  const { id } = req.params;
  try {
    const businessListing = await BusinessListing.findByPk(id);
    if (!businessListing) {
      return res.status(404).json({ error: 'Business listing not found' });
    }
    res.json({ data: businessListing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a business listing by ID
router.put('/business-listings/:id', authenticateJwt, checkUserRole(['businessOwner', 'admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const updatedListing = await BusinessListing.update(req.body, {
      where: { id },
      returning: true,
    });
    if (!updatedListing[0]) {
      return res.status(404).json({ error: 'Business listing not found' });
    }
    res.json({ message: 'Business listing updated successfully', data: updatedListing[1][0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a business listing by ID
router.delete('/business-listings/:id', authenticateJwt, checkUserRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await BusinessListing.destroy({ where: { id } });
    if (!deletedCount) {
      return res.status(404).json({ error: 'Business listing not found' });
    }
    res.json({ message: 'Business listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Create a review for a business listing
router.post('/business-listings/:businessId/reviews', authenticateJwt, checkUserRole(['user']), async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const { businessId } = req.params;
  
      const review = await Review.create({
        rating,
        comment,
        userId: req.user.id,
        businessId,
      });
  
      res.status(201).json({ message: 'Review created successfully', data: review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Get all reviews for a business listing
  router.get('/business-listings/:businessId/reviews', authenticateJwt, checkUserRole(['businessOwner', 'admin', 'user']), async (req, res) => {
    try {
      const { businessId } = req.params;
      const reviews = await Review.findAll({
        where: { businessId },
      });
  
      if (!reviews || reviews.length === 0) {
        return res.status(404).json({ error: 'No reviews found for this business listing' });
      }
  
      res.json({ data: reviews });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update response to a review
router.put('/business-listings/:businessId/reviews/:reviewId/response', authenticateJwt, checkUserRole(['businessOwner', 'admin', 'user']), async (req, res) => {
    try {
      const { response, comment, rating } = req.body;
      console.log("\n response ", response)
      const { businessId, reviewId } = req.params;
  
      const review = await Review.findOne({
        where: { id: reviewId, businessId },
      });
  
      if (!review) {
        return res.status(404).json({ error: 'Review not found for this business listing' });
      }
  
      if (req.user.role === 'businessOwner' && req.user.id !== review.userId) {
        return res.status(403).json({ error: 'Forbidden: You can only update your own responses' });
      }

      if (req.user.role === "businessOwner" || req.user.role === "admin"){
        review.response = response;
      } else if(req.user.role === "user"){
        review.comment = comment
        review.rating = rating
      }
  
      await review.save();
  
      res.json({ message: 'Response updated successfully', data: review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete response to a review
  router.delete('/business-listings/:businessId/reviews/:reviewId/response', authenticateJwt, checkUserRole(['admin', 'user']), async (req, res) => {
    try {
      const { businessId, reviewId } = req.params;
  
      const review = await Review.findOne({
        where: { id: reviewId, businessId },
      });
  
      if (!review) {
        return res.status(404).json({ error: 'Review not found for this business listing' });
      }
  
      if (req.user.role === 'businessOwner' && req.user.id !== review.userId) {
        return res.status(403).json({ error: 'Forbidden: You can only delete your own responses' });
      }
  
      // Set the response to null or handle deletion based on your application logic
      review.response = null; // Set the response to null
      await review.save();
  
      res.json({ message: 'Response deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get response to a review
router.get('/business-listings/:businessId/reviews/:reviewId/response', authenticateJwt, checkUserRole(['user']), async (req, res) => {
    try {
      const { businessId, reviewId } = req.params;
  
      const review = await Review.findOne({
        where: { id: reviewId, businessId },
      });
  
      if (!review || !review.response) {
        return res.status(404).json({ error: 'Response not found for this review' });
      }
  
      res.json({ data: { response: review.response } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Add response to a review
router.post('/business-listings/:businessId/reviews/:reviewId/response', authenticateJwt, checkUserRole(['businessOwner']), async (req, res) => {
    try {
      const { response } = req.body;
      const { businessId, reviewId } = req.params;
  
      const review = await Review.findOne({
        where: { id: reviewId, businessId },
      });
  
      if (!review) {
        return res.status(404).json({ error: 'Review not found for this business listing' });
      }
  
      review.response = response;
      await review.save();
  
      res.json({ message: 'Response added successfully', data: review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



module.exports = router;
