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

const cors = require('cors');
app.use(cors({
  origin: 'https://attend-tuition.vercel.app', // your frontend origin
  methods: ['GET', 'POST', 'OPTIONS'], // allowed methods
  credentials: true, // if you're sending cookies or auth tokens
  allowedHeaders: ['Content-Type', 'Authorization'] // allow specific headers
}));


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
