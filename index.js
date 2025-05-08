const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_STRING)
  .then(() => console.log('Now connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas', err));

  app.use(express.json());


const userRoutes = require("./routes/user");
const movieRoutes = require("./routes/movie");


app.use("/users", userRoutes);
app.use("/movies", movieRoutes);


if (require.main === module) {
    app.listen(port, () => console.log(`API is now online on port ${port}`));
 }
 
 module.exports = { app, mongoose };