const nodemailer = require("nodemailer");




const sendWelcomeEmail = async (name,email) => {
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    
});
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Our Store! 🛒",
        html:`
        <h1>Welcome ${name}!</h1>
        <p>Thank you for registering on our store.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Ecommerce Team</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

const sendOrderConfirmationEmail = async (name, email, order) => {
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    
});  
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Order Confirmed!",
        html: `
          <h1>"Order Confirmed"</h1>
          <p>Hi ${name},</p>
          <p>Your order has been placed successfully!</p>
          <h3>Order Details:</h3>
          <p>Order ID: ${order._id}</p>
          <p>Total Amount: ₹${order.totalAmount}</p>
          <p>Shipping Address: ${order.shippingAddress}</p>
          <br/>
          <p>Thank you for shopping with us</p>
          <p>The Ecommerce Team</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};


module.exports = { sendWelcomeEmail, sendOrderConfirmationEmail};

