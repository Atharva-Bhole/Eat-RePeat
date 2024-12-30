const mongoose = require('mongoose');
const validator = require('validator');

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

module.exports = mongoose.model("User", userSchema);