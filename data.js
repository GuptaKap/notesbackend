const mongoose = require('mongoose');

async function connectToMongo() {
    try {
      await mongoose.connect('mongodb+srv://anushkagupta5020:root@cluster0.5xgxif3.mongodb.net/inotebook', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.log("Error connecting to MongoDB:", error.message);
    }
  }
module.exports = connectToMongo;