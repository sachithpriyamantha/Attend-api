const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();
const Routes = require("./routes/route.js");

const PORT = process.env.PORT || 5000;

dotenv.config();

// Enable JSON parsing
app.use(express.json());

// CORS Configuration (allowing frontend URL)

// Handle preflight requests (OPTIONS)
app.options('*', cors());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// Route setup
app.use('/', Routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`);
});
