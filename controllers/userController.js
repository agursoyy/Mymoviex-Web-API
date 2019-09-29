User = require('../models/userModel');
let mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');


exports.index = function(req,res) {
    User.get(function(err,users) {
        if(err) {
            res.status(500).send(err);
        }
        res.json ({
            status: "success",
            message: "users retrieved succesfully",
            users: users
        });
    });
};


exports.new = function (req, res) {
    const user = new User();
    user.username = req.body.username;
    user.role = req.body.role;
    user.email = req.body.email;
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    user.password = hashedPassword;
    user.save(function (err) {
        if (err) {
            console.log('ajfjas');
            res.status(400).json(err);
        }
        else  {
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.status(201).json({
                message: 'New user account created!',
                newuser: user,
                auth: true,
                token: token
            });
        }

    });
};

exports.view = function (req, res) {
    var userID = mongoose.Types.ObjectId(req.params.user_id);
    User.findById(userID, function (err, user) {
        if (err) 
            res.status(500).json(err);
        else {
            if(user)
                res.json({
                    message: 'user details loading..',
                    user: user
                });
            else
                res.status(404).json( {
                    message: 'user not found'
                })
        }  
    });
};

exports.update = function (req, res) {
    var userID = mongoose.Types.ObjectId(req.params.user_id);
    User.findById(user, function (err, contact) {
            if (err)
                res.send(err);
            else {
                user.username = req.body.username;
                user.role = req.body.role;
                user.email = req.body.email;
                user.password = req.body.password;
        // save the contact and check for errors
                user.save(function (err) {
                    if (err)
                        res.json(err);
                    res.json({
                        message: 'User Info updated',
                        user: user
                    });
                });
            }
           
        });
    };
    exports.delete = function (req, res) {
        User.remove({
            _id: req.params.user_,d
        }, function (err, user) {
            if (err)
                res.send(err);
    res.json({
                status: "success",
                message: 'user deleted successfully'
            });
        });
    };