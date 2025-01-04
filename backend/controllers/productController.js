const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const ApiFeatures = require('../utils/apiFeatures');
const { StatusCodes } = require('http-status-codes');

// Add a new Product to the DB
const createProducts = catchAsyncError(async (req, res, ) => {
    req.body.user = user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
});
// Get all Products
const getAllProducts = catchAsyncError(async (req, res) =>{

    const resultsPerPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultsPerPage);
    const products = await apiFeature.query ;

    res.status(200).json({
        success : true,
        products,
        productCount
    })
});


// Update Products
const updateProduct = catchAsyncError(async (req, res, next)=>{
    let product = Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true,  runValidators: true, useFindAndModify:false});

    res.status(200).json({
        success : true,
        product
    })
});

// Delete Product

const deleteProduct = catchAsyncError(async (req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return next(new ErrorHandler("Product Not Found", 404))
    }


    await product.deleteOne() ;

    res.status(200).json({
        success : true,
        message : "Product Remove Successfully"
    })

});


const getProductDetails = catchAsyncError(async (req, res, next)=>
{
    const product = await Product.findById(req.params.id);
    if(!product)
    {
        return next(new ErrorHandler("Product Not Found", 404))
    }
    return res.status(200).json({
        success : true, 
        product
    })
});

const createProductReview = catchAsyncError(async(req, res, next)=>{

    const {rating, productId, comment} = req.body;

    const review = {
        user : req.user._id,
        name : req.user.name,
        rating : rating,
        comment,
    }

    const product = await Product.findById(productId);

    const isReviewed = product.review.find(rev => rev.user.toString() === req.user._id);

    if(isReviewed)
    {
        product.reviews.forEach(rev=>{
            if(rev.user.toString() === req.user._id.toString())
                rev.rating = rating,
                rev.comment = comment
        })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.rating = product.reviews.forEach(rev=>{
        avg = avg + rev.rating
    })
    
    product.rating = avg / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(StatusCodes.OK).json({
        success: true,
    })
});

const getProductReviews = catchAsyncError(async(req, res, next)=>{
    const product = await Product.findById(req.query.id);

    if(!product)
    {
        return next(new ErrorHandler(`Product does not exist`, StatusCodes.BAD_GATEWAY))
    }

    res.status(StatusCodes.OK).json({
        success : true,
        product,
    })
})


const deleteProductReview = catchAsyncError(async(req, res, next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product)
    {
        return next(new ErrorHandler(`Product does not exist in Database`, StatusCodes.BAD_REQUEST));
    }

    const reviews = product.reviews.filter(rev=>rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    
    product.reviews.forEach(rev=>{
        avg += rev.rating;
    })

    product.ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await product.findByIdAndUpdate(req.query.productId,{ reviews, ratings, numOfReviews},{
        new : true,
        runValidators : true,
        useFindAndModify : false,
    })


    res.status(StatusCodes.OK).json({
        success : true,
    })
})

module.exports = {
    getAllProducts, createProducts, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteProductReview
}