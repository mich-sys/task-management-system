const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming you have a User model

const router = express.Router();


// Register route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = await jwt.sign(
            payload,
            process.env.JWT_SECRET, // Ensure you use process.env.JWT_SECRET everywhere
            { expiresIn: 3600 }
        );
        

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login route
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     console.log( "login attempt:", {email, password })

//     try {
//         // Check if user exists
//         // let user = await User.findOne({ email });
//         // if (!user) {
//         //     return res.status(400).json({ msg: 'Invalid credentials' });
//         // }
//         let user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });

//         if (!user) {
//             console.log(`No user found with email: ${email}`);
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }
//         console.log('Plaintext password:', password);
// console.log('Hashed password:', user.password);

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ msg: 'Invalid credentialss' });
//         }
        

//         // Return JWT
//         const payload = {
//             user: {
//                 id: user.id
//             }
//         };

//         const token = await jwt.sign(
//             payload,
//             process.env.JWT_SECRET, // Ensure consistency
//             { expiresIn: 3600 }
//         );

//         res.json({ token });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists (case-insensitive)
        let user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        
        if (!user) {
            console.log(`No user found with email: ${email}`);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Log the passwords being compared
        console.log('Plaintext password:', password);  // This is what you’re passing in from Postman
        console.log('Hashed password from DB:', user.password);  // This is from the DB

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch);  // Log the result of bcrypt.compare

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 }
        );

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Authentication middleware
function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user.id; // Ensure this matches the payload structure
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
}

module.exports = router;


// // Register route
// router.post('/register', async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         // Check if user already exists
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }

//         // Create new user
//         user = new User({
//             username,
//             email,
//             password
//         });

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);

//         // Save user
//         await user.save();

//         // Return JWT
//         const payload = {
//             user: {
//                 id: user.id
//             }
//         };

//         jwt.sign(
//             payload,
//             'your_jwt_secret', // Replace with your JWT secret
//             { expiresIn: 3600 },
//             (err, token) => {
//                 if (err) throw err;
//                 res.json({ token });
//             }
//         );
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// // Login route
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Check if user exists
//         let user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }

//         // Return JWT
//         const payload = {
//             user: {
//                 id: user.id
//             }
//         };

//         jwt.sign(
//             payload,
//             'your_jwt_secret', // Replace with your JWT secret
//             { expiresIn: 3600 },
//             (err, token) => {
//                 if (err) throw err;
//                 res.json({ token });
//             }
//         );
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });
// function auth(req, res, next) {
//     const token = req.header('x-auth-token');
//     if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.id;
//         next();
//     } catch (err) {
//         res.status(400).json({ message: 'Invalid token' });
//     }
// }



// module.exports = {
//     router,
//     auth,
// };