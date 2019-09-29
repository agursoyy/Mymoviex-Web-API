User = require('../models/userModel');
let mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');
const {check, validationResult} = require('express-validator');
const emailVerificationController = require('./emailVerificationController');

exports.validateSignupInput = [
    check('email', 'Your email address is not valid.').isEmail().normalizeEmail(),
    check('username').not().isEmpty().withMessage('Your username can not be empty.'),
    check('password').isLength({min: 8}).withMessage('Your password should have more than 8 characters.'),
    check('email','This email address is already in use').custom( async value => {
        let emailCheck = await User.findOne({ email: value });
        if (emailCheck !== null) {
          console.log('User Exists');
          return Promise.reject();
        }
    })
]

exports.signup = function (req, res) {
    const errors = validationResult(req); // validate with signupinput 
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    } 
    else {
        const user = new User();
        user.username = req.body.username;
        user.role = req.body.role;
        user.email = req.body.email;
        user.password = bcrypt.hashSync(req.body.password, 8); // to hash the user password.
        user.save(function (err) {
            if (err) {
                res.status(400).json(err);
            }
            else  {
                emailVerificationController.sendEmailVerification(user._id,user.email,req.hostname);
                res.status(201).send({
                    message: 'New user account created, please verify your email.',
                });
            }
    
        });
    }
 
};