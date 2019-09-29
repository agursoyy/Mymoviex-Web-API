User = require('../models/userModel');
let mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');
const {check, validationResult} = require('express-validator/check');
const nodemailer = require('nodemailer');

function createTransporter() {
    let transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'alptekin_1997@hotmail.com', // generated ethereal user
            pass: 'Artist.1997' // generated ethereal password
        }
    });
    return transporter;
}

exports.sendForgetPasswordLink = (userId,userMail) => {
    new Promise((resolve,reject) => {
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
            const url = `http://localhost:5000/api/redirect-password-change/${emailToken}`;
            transporter.sendMail({
                to:  userMail,  // alptekin_1997@hotmail.com -> kendi mailim
                subject : 'Şifre Yenileme',
                html: `<h3>Şifrenizi yenilemek için linke tıklayınız.</h3> 
                    <a href="${url}">${url}</a>`
            });
            if(err)
                console.error(err);
        });
    })
}


exports.validateForgetPasswordInput = [
    check('email', 'Geçerli bir e-posta adresi giriniz.').isEmail().normalizeEmail(),
    check('email','Bu e-posta adresiyle eşleşen bir kullanıcı bulunamadı.').custom( async value => {
        let emailCheck = await User.findOne({ email: value });
        if (!emailCheck) {
          return Promise.reject();
        }
    })
]

exports.forgetPassword = (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array()); // bad request
    } 
    else {
        User.findOne({email: req.body.email},(err,user) => {
            if (err) {
                res.status(500).send(err);
            }
            else {
                this.sendForgetPasswordLink(user._id,user.email);
                res.status(201).json({
                    message: 'If user exists, new password link has been send.',
                });
            }
        });
    }
}

exports.redirectPasswordChange = (req,res) => {
    jwt.verify(req.params.token, config.secret, function(err, decoded) {
        if (err) 
          res.status(500).json({ message: 'Failed to change password.' });
        else {
            res.redirect('http://localhost:3000/uyelik/sifre-yenileme/'+req.params.token); // verification completed successfully.
        }
    });
} 
exports.changePassword = (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token)  res.status(401).send({ auth: false, message: 'No token provided.' });  // forbidden to access data.
    else {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) 
              res.status(500).send({ auth: false, verification: false, message: 'Failed to change password.' });
            else {
                const newPassword = bcrypt.hashSync(req.body.password, 8); // to hash the user password.
                User.findByIdAndUpdate(decoded.id,{password: newPassword},function(err,user) {
                    if(err) 
                        res.status(500).send(err);
                    else {
                        res.status(200).send('Password has been changed successfully');
                    }
                })
             }
        });
    }
    
}