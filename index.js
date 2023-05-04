// Import required libraries
const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const env=require('dotenv');

// Create an instances
const app = express();
env.config()

// Set up express to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')))

// Connect to MongoDB database
mongoose.connect(process.env.DB_LOCAL_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// Start the server

app.listen(process.env.PORT,()=>{
  console.log(`server is running on port ${process.env.PORT}`);
})