const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes");

dotenv.config(); // Load variables from .env file

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Enable CORS for the specified frontend URL
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true // If you want to allow cookies or authorization headers
}));

app.use(express.json());
app.use('', routes);

module.exports = app;
