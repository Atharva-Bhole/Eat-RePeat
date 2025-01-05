const Order = require("../models/orderModel");
const {StatusCodes} = require("http-status-codes");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");


// Create new Order
const newOrder = catchAsyncErrors(async(req, res, next)=>{
    const {shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    const order = new Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt : Date.now(),
        user : req.user._id
    });

    res.status(StatusCodes.CREATED).json({
        success : true,
        message : "Order Created successfully",
        order
    })
});

// Get Single Order

const getSingleOrder = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if(!order)
    {
        return next(new ErrorHandler(`Order not found`, StatusCodes.NOT_FOUND));
    }
    res.status(StatusCodes.OK).json({
        success : true,
        order
    })
});


// Get logged in user order
const myOrders = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.find({ user : req.user._id});
    if(!order)
    {
        return next(new ErrorHandler(`Order Not found`, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
        success : true,
        order
    });
});

// Get all orders --- ADMIN
const allOrders = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.find();
    if(!order)
    {
        return next(new ErrorHandler(`No Orders Found in DB`, StatusCodes.NOT_FOUND));
    }

    let totalAmount = 0;
    order.forEach(orders=>{
        totalAmount += order.totalPrice;
    })

    res.status(StatusCodes.OK).json({
        success : true,
        totalAmount,
        order
    })
});

// Update Order Status --- ADMIN
const updateOrder = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.findById(req.params.id);
    if(order.orderStatus === "Delivered")
    {
        return next(new ErrorHandler(`You have already delivered this order`, StatusCodes.NOT_FOUND));
    }

    order.orderItems.forEach(async order =>{
        await updateStock(order.Product, order.quantity)
    });

    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered")
    {
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave : false});
    res.status(StatusCodes.OK).json({
        success : true,  
    });
});

async function updateStock(id, quantity)
{
    const product = await Product.findById(id);
    product.Stock -= quantity;

    await product.save({validateBeforeSave : false});
}

const deleteOrder = catchAsyncErrors(async(req, res, next)=>{
    const order = await Order.findById(req.params.id);

    await order.remove();

    res.status(StatusCodes.OK).json({
        success : true,
    });
})

module.exports = {
    newOrder, getSingleOrder, myOrders, allOrders, deleteOrder, updateOrder
}