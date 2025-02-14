const express = require('express');
const { getAllProducts, createProducts, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteProductReview  } = require('../controllers/productController');
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route('/product/new').post(isAuthenticatedUser, authorizeRoles("admin"), createProducts); 
router.route("/product/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct).delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route("/product/:id").get(getProductDetails);
router.route("/product/review").put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser, deleteProductReview);


module.exports = router;