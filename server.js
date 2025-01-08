require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const database = require('./database/db');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '50000' }));
app.use('/register', require('./routes/User'));  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server successfully connected, running on port ${PORT}`);
});


 
