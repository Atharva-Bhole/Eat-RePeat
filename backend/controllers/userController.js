const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail.js');


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


    const resetPasswordUrl =  `${req.protocol}://${req.host}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

    try{
        await sendEmail({
            email : user.email,
            message : `Eat-RePeat Password Recovery`,
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

module.exports = {
    registerUser, loginUser, LogOut, forgotPassword
}