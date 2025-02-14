// Creating a Token and saving it in a cookie 
const sendToken = (user, statusCode, res)=>{
    const token = user.getJWTToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60*60*1000
        ),
        httpOnly:true
    };

    console.log(options.expires);
    
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    });
}


module.exports = sendToken;