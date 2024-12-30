const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const User = require('../models/userModel');


const registerUser = async(req, res, next)=>{
    const {name, email, password} = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id : "this is a sample id",
            url : "profilePicURL"
        }
    });

    res.status(201).json({
        success: true,
        user,
        message: "User Created successfully"
    })
}


module.exports = {
    registerUser
}