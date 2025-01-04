const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const isAuthenticatedUser = catchAsyncErrors(async(req, res, next)=>{
    const {token} = req.cookies;

    console.log(token);
    if(!token)
    {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    req.user = await User.findById(decodedData.id);
    next();
})

const authorizeRoles = (...roles) =>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.roles))
        {
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    }
}

module.exports = {
    isAuthenticatedUser, authorizeRoles
}