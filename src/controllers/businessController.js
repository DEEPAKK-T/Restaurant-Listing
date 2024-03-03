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
router.get('/business-listings/:id', authenticateJwt, checkUserRole(['businessOwner', 'admin', 'user']), async (req, res) => {
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


// Create a review for a business listing : only admin and user can add review
router.post('/business-listings/:businessId/reviews', authenticateJwt, checkUserRole(['user', 'admin', 'businessOwner']), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { businessId } = req.params;

    if (req.user.role === 'businessOwner') {
      // You can only delete your own responses
      return res.status(403).json({ error: "Forbidden: You don't have permission to post review" });
    }

    const review = await Review.create({
      rating,
      comment,
      userId: req.user.userId,
      businessId,
    });

    res.status(201).json({ message: 'Review created successfully', data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all reviews for a business listing - Read reviews
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

// Delete review - only admin and user can delete review
router.delete('/business-listings/:businessId/reviews/:reviewId', authenticateJwt, checkUserRole(['admin', 'user', 'businessOwner']), async (req, res) => {
  try {
    const { businessId, reviewId } = req.params;

    const review = await Review.findOne({
      where: { id: reviewId, businessId },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found for this business listing' });
    }

    if (req.user.role === 'businessOwner' && req.user.userId !== review.userId) {
      // businessOwerns can't delete any review
      return res.status(403).json({ error: "Forbidden: You don't have permission to delete review" });
    }

    if (req.user.role === 'user' && req.user.userId !== review.userId) {
      // you can delete only your own reviews
      return res.status(403).json({ error: "Forbidden: You don't have permission to delete others review" });
    }

    review.response = null;
    await review.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update review - admin, user, businessOwner(only response)
router.put('/business-listings/:businessId/reviews/:reviewId', authenticateJwt, checkUserRole(['businessOwner', 'admin', 'user']), async (req, res) => {
  try {
    const { response, comment, rating } = req.body;
    const { businessId, reviewId } = req.params;

    const review = await Review.findOne({
      where: { id: reviewId, businessId },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found for this business listing' });
    }

    if (req.user.role === 'user' && req.user.userId !== review.userId) {
      return res.status(403).json({ error: "Forbidden: You don't have permission to update others review" });
    }


    //business owner can only update response data
    if (req.user.role === "businessOwner") {
      review.response = response;
      //user can't update response data
    } else if (req.user.role === "user") {
      review.comment = comment
      review.rating = rating
    } else { //admin can update all fields
      review.comment = comment
      review.rating = rating
      review.response = response;
    }

    await review.save();

    res.json({ message: 'Review updated successfully', data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add response to a review
router.post('/business-listings/:businessId/reviews/:reviewId/response', authenticateJwt, checkUserRole(['businessOwner', 'admin']), async (req, res) => {
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
