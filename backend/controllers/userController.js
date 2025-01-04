const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');
const {StatusCodes} = require("http-status-codes");

const registerUser = async(req, res, next)=>{
    const {name, email, password} = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id : "this is a sample id",
            url : "profilePicURL"
        }
    });

    const token = user.getJWTToken(); 

    res.status(201).json({
        success: true,
        token,
        message: "User Created successfully"
    })
}


const loginUser = catchAsyncErrors(async (req, res, next)=>{
    const {email, password} = req.body;

    if(!email || !password)
    {
        return next(new ErrorHandler("Please Enter email or Password", 400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or Password"));
    }

    const isPasswordMatched = user.comparePassword(password);
    
    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const token = user.getJWTToken();

    sendToken(user, 201, res);
});

// Logout Controller

const LogOut = catchAsyncErrors( async(req, res, next)=>{

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly : true,
    })

    res.status(201).json({
        success : true,
        message: "Logged Out",
    })
})

// Forgot Password

const forgotPassword = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user)
    {
        return next(new ErrorHandler(`User not found`, 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});


    const resetPasswordUrl =  `${req.protocol}://${req.hostname}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

    try{
        await sendEmail({
            email : user.email,
            subject : `Eat-RePeat Password Recovery`,
            message
        });

        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`,
        })
    }catch(error)
    {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500));

    }

})

// Reset Password
const resetPassword = catchAsyncErrors(async(req, res, next)=>{
    const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},
    });

    if(!user)
    {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 404));
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
});

const getUserDetails = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success : true,
        user,
    });
});

const updatePassword = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await User.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler(`Invalid email or password`, StatusCodes.BAD_REQUEST));
    }

    if(req.body.newPassword !== req.body.confirmPassword)
    {
        return next(new ErrorHandler(`Password does not match`, StatusCodes.BAD_REQUEST));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, StatusCodes.OK, res);
})


// Update User Profile
const updateProfile = catchAsyncErrors(async(req, res, next)=>{

    const newUserData = {
        name : req.body.name,
        email : req.body.email 
    }

    // Cloudinary Logic here

    // end Cloudinary logic

    const user = User.findByIdAndUpdate(req.params.user.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });

    sendToken(user, StatusCodes.OK, res);
});


// Get all users --- ADMIN
const getAllUsers = catchAsyncErrors(async(req, res, next)=>{
    const users = await User.find();


    res.status(StatusCodes.OK).json({
        success : true,
        users,
    })
})


// Get single user --- ADMIN
const getSingleUser = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findById(req.params.id);


    if(!user)
    {
        return next(new ErrorHandler(`User not found`, StatusCodes.BAD_REQUEST));
    }

    res.status(StatusCodes.OK).json({
        success : true,
        user,
    });
});

// Delete User ---- ADMIN
const deleteUser = catchAsyncErrors(async(req, res, next)=>{


    const user = await User.findById(req.params.id);

    // Remove cloudinary url logic here

    // end cloudinary remove logic

    if(!user)
    {
        return next(new ErrorHandler(`User does not exist`, StatusCodes.BAD_REQUEST));
    }

    await user.remove();
    return res.status(StatusCodes.OK).json({
        success : true,
        message : "User deleted successfully",
    })
});


// Update Role --- ADMIN
const updateUserRole = catchAsyncErrors(async(req, res, next)=>{
    const newUserData = {
        name : req.body.name,
        email : req.body.email,
        role : req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    });

    return res.status(StatusCodes.OK).json({
        success : true,
        user,
    })

});


module.exports = {
    registerUser, loginUser, LogOut, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser
}