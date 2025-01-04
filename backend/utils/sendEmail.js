const nodeMailer = require("nodemailer");

const sendEmail = async(options) =>{

    console.log(process.env.SMTP_SERVICE, process.env.EMAIL_USER, process.env.EMAIL_PASSWORD);
    
    const transporter = nodeMailer.createTransport({
        host : "smtp.gmail.com",
        service: process.env.SMTP_SERVICE,
        port : 587,
        secure: false, 
        auth: {
            user : process.env.EMAIL_USER,
            password : process.env.EMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from : process.env.EMAIL_USER,
        to : options.email,
        subject : options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;