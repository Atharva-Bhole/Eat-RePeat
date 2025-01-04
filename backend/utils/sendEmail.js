const nodeMailer = require("nodemailer");

const sendEmail = async(options) =>{

    console.log(process.env.MAIL_HOST, process.env.EMAIL_USER, process.env.EMAIL_PASSWORD);
    
    const transporter = nodeMailer.createTransport({
        host : process.env.MAIL_HOST,
        service: "gmail",
        port : 587,
        secure: false, 
        auth: {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASSWORD,
        }
    });
    console.log(options);
    const mailOptions = {
        from : process.env.EMAIL_USER,
        to : options.email,
        subject : options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;