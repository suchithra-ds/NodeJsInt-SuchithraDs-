const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');  // Add this line for JWT functionality
const User = require('../models/User');

const verifyToken = require('../middleware/Verify')

// Validate email format using a regex
const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

// Validate password complexity (at least 8 characters, contains number)
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/;
    return passwordRegex.test(password);
};
// *****************API for Registration****************//
router.post('/UserRegistration', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body, "body");

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }



        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one number.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, '#123456789suchi', { expiresIn: '24h' });

        return res.status(201).json({
            message: 'User successfully registered.',
            token, 
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});



// URL: http://localhost:5000/register/UserRegistration

// Method: POST

// Body (JSON):
// {
//     "name": "suchi",
//     "email": "suchthra@gmail.com",
//     "password": "123456789"
// }

// Response :
// {
//     "message": "User successfully registered.",
//     "token": "<JWT_TOKEN>",
//     "user": {
//         "id": "45453453345234",
//         "name": "suchi",
//         "email": "suchthra@gmail.com"
//     }
// }














//******************API for User Login*********************//
router.post('/UserLogin', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(req.body, "body");

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

       
        const token = jwt.sign({ userId: existingUser._id }, '#123456789suchi', { expiresIn: '24h' });

        return res.status(200).json({
            message: 'Login successful.',
            token,  
            user: { id: existingUser._id, name: existingUser.name, email: existingUser.email }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});



// Testing User Login in Postman
// URL: http://localhost:5000/register/login

// Method: POST

// Body (JSON):
// {
//     "email": "suchthra@gmail.com",
//     "password": "123456789"
// }

// resposne
// {
//     "message": "Login successful.",
//     "token": "<JWT_TOKEN>",
//     "user": {
//         "id": "user_id_here",
//         "name": "suchi",
//         "email": "suchithra@gmail.com"
//     }
// }


//***************api for update a user details**************//
router.put('/updateusers/:id', verifyToken, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updatedData = { name, email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


//***************get all the users api*****************//
router.get('/GetAllusers', verifyToken, async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({users,message:"uccesfully get all users"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

//********************GET User based on id*********************//
router.get('/GetAllusersBasedOnId/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});










//*******************API for delete users based on user id**********************//
router.delete('/deleteusers/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
