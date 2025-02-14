const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        reqiured:[true, "Please Enter your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true, "Please enter your e-mail"],
        unique: true,
        validate:[validator.isEmail, "Please Enter valid Email ID"]
    },
    password: {
        type: String,
        required:[true, "Please Enter Your Password"],
        minLength : [8, "Password should be greater than 8 characters"],
        select: false
    },
    avatar: {
        public_id : {
            type: String,
            required : true
        },
        url: {
            type: String, 
            required: true
        }
    },
    role : {
        type: String,
        default: "user"
    },

    resetPasswordToken : String,
    resetPasswordExpire : Date,
});

userSchema.pre("save", async function(next)
{
    if(!this.isModified("password"))
    {
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
    
})

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

userSchema.methods.comparePassword = async function(enteredPassword)
{
    return await bcrypt.compare(enteredPassword, this.password)
}

// Generate password reset tokens
userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 100;

    return resetToken;
}

module.exports = mongoose.model("User", userSchema);