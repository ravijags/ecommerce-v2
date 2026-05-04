const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
// const hpp = require("hpp");
const { generalLimiter } = require("./middleware/rateLimiter");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
//app.use(mongoSanitize());
// app.use(hpp());

app.use(express.json());
app.use(generalLimiter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Failed",err.message)
  
 );

 

 app.use("/api/auth", authRoutes);
 app.use("/api/products", productRoutes);
 app.use("/api/cart", cartRoutes);
 app.use("/api/orders", orderRoutes );
 app.use(errorHandler);

 const PORT = process.env.PORT || 3000;

 app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
 });
