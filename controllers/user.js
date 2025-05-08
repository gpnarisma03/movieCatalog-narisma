const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');


module.exports.registerUser = (req, res) => {
    const reqBody = req.body;

    // Check if req.body is present
    if (!reqBody) {
        return res.status(400).send({ success: false, message: 'Request body is missing' });
    }

    const { email, password } = reqBody;


    // Proceed to check if user already exists
    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(409).send({
                    success: false,
                    message: 'Email already in use'
                });
            }

            let newUser = new User({
                email,
                password: bcrypt.hashSync(password, 12)
            });

            return newUser.save()
            .then(result => {
                return res.status(201).send({
                    message: 'Registered Successfully'
                });
            })            
                .catch(err => {
                    return res.status(500).send({
                        success: false,
                        message: 'Internal server error while saving the user',
                        error: err.message
                    });
                });
        })
        .catch(err => {
            return res.status(500).send({
                success: false,
                message: 'Error checking if the user already exists',
                error: err.message
            });
        });
};

module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format with regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({ success: false, message: "Invalid email format" });
        }

        // Check if user exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            console.log("No user found with this email"); // Debugging log
            return res.status(404).send({ success: false, message: "No email found" }); // Change to 404
        }

        // Compare the entered password with the stored hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log("Incorrect password"); // Debugging log
            return res.status(401).send({ success: false, message: "Incorrect email or password" });
        }

        // Create access token for the user
        const accessToken = auth.createAccessToken(user);
        console.log("Access token created"); // Debugging log

        // Return success with the access token
        return res.status(200).send({ 
            // success: true, 
            // message: "User logged in successfully", 
            access: accessToken 
        });

    } catch (err) {
        console.error(err); // Log error for debugging
        return res.status(500).send({ success: false, message: 'Server error', error: err.message });
    }
};