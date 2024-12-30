const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const ApiFeatures = require('../utils/apiFeatures');

// Add a new Product to the DB
const createProducts = catchAsyncError(async (req, res, ) => {
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

module.exports = {
    getAllProducts, createProducts, updateProduct, deleteProduct, getProductDetails
}