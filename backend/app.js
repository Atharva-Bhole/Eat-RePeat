const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/error');
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require("./routes/orderRoute");

app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", user)


module.exports = app