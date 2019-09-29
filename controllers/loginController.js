User = require('../models/userModel');
let mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');
const {check, validationResult} = require('express-validator/check');


exports.validateLoginInput = [  // öncelik sırası önemlidir ona göre ayarlı!
    check('email', 'E-posta adresi geçerli değil.').isEmail().normalizeEmail(),
    check('password').isLength({min: 8}).withMessage('Parola minimum 8 karakterden oluşmalıdır.'),
    check('email','Bu e-posta adresiyle eşleşen bir kullanıcı bulunamadı.').custom( async value => {
        let emailCheck = await User.findOne({ email: value });
        if (!emailCheck) {
          return Promise.reject();
        }
    }),
    check('email','Giriş yapabilmek için e-posta adresinizi doğrulayın.').custom( async value => {
        let emailCheck = await User.findOne({ email: value });
        if (!emailCheck.confirmed) {
          return Promise.reject();
        }
    }),
    check('password','Parolanız yanlış.').custom( async (value,{req}) => {
        let emailCheck = await User.findOne({ email: req.body.email });
        if (emailCheck) { // user exists
            var passwordIsValid = bcrypt.compareSync(value, emailCheck.password);
            if(!passwordIsValid)
                return Promise.reject();
        }
    })
]

exports.login = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array()); // bad request
    } 
    else {
        User.findOne({ email: req.body.email }, function (err, user) {
            if (err) {
              res.status(500).send(err);  
            }
            else {      
                var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).send({ auth: true, token: token });             
            }
        }); 
    }
 
};

