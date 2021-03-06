User = require('../models/userModel');
let mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');
const nodemailer = require('nodemailer');
var cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();

exports.verifyEmail = (req,res) => {
    jwt.verify(req.params.token, config.secret, function(err, decoded) {
        if (err) 
          res.status(500).send({ auth: false, verification: false, message: 'Failed to email verification.' });
        else {
            User.findByIdAndUpdate(decoded.id,{confirmed: true},function(err,user) {
                if(err) 
                    res.status(500).send(err);
                else {
                    res.redirect(process.env.FRONTEND_LOGIN_URI); // verification completed successfully.
                }
            })
         }
    });
} 

function createTransporter() {
    let transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: process.env.EMAIL_VERIFICATION_MAIL, // generated ethereal user
            pass: process.env.EMAIL_VERIFICATION_PASSWORD // generated ethereal password
        }
    });
    return transporter;
}

exports.sendEmailVerification = (userId,userMail,hostname) => {
        new Promise((resolve) => {
            const transporter = createTransporter();
            resolve(transporter);
        }).then(transporter => {
            jwt.sign({
                id: userId   
            },
            config.secret,
            {
                expiresIn: '1d'
            },(err,emailToken) => {
                const url = `https://${hostname}/api/confirmation/${emailToken}`;
                console.log('MAIL SENDED');
                transporter.sendMail({
                    to:  userMail,  // alptekin_1997@hotmail.com -> kendi mailim
                    subject : 'Email Confirmation',
                    html: `<h3>Email adresinizi doğrulamak için linke tıklayınız.</h3> 
                        <a href="${url}">${url}</a>`
                });
                if(err)
                    console.error(err);
            })
        })
}
