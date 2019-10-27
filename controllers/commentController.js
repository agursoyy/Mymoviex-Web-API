Comment = require('../models/commentModel');
User = require('../models/userModel');

const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');
const {check, validationResult} = require('express-validator');

exports.validateMakeCommentInput = [
    check('comment').not().isEmpty().withMessage('Your comment can not be empty.'),
    check('movieId').not().isEmpty().withMessage('Comment must belong to a movie.'),
];
exports.makeComment = (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token)  res.status(401).send({ auth: false, message: 'No token provided.' });  // forbidden to access data.
    else {
        const errors = validationResult(req); // validate with signupinput 
        if (!errors.isEmpty()) {
          return res.status(400).json(errors.array());
        } 
        else {
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) 
                  res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                else {
                    const userID = decoded.id;
                    const comment = new Comment();
                    comment.userId = userID;
                    comment.movieId = req.body.movieId;
                    comment.comment = req.body.comment;
                    comment.save(function (err) {
                        if (err) {
                            res.status(400).json(err);
                        }
                        else  {
                            res.status(201).send({
                                message: 'New comment has been created',
                                comment: comment.comment
                            });
                        }
                    });
                }
             });
        }
    }
};

exports.getComments = (req,res) => {
    Comment.find({}).populate('userId').exec(function(err,comments) {
        if(err) {
            res.status(500).send(err);
        }
        res.json ({
            status: "success",
            message: "comments retrieved succesfully",
            comments: comments
        });
    });
};

// get the comments posted to a specific movie.
exports.getMovieComments = (req,res) => {
    if(!req.params.movieId)
        return res.status(400).send('missing movieID input'); // bad request
    else {
        const movieId = Number(req.params.movieId);
        Comment.find({movieId: movieId}).populate('userId').exec((err,comments)=> {
            if(err){ // service error . cant fetch comments
                res.status(500).send(err);  
            }
            else {
                res.status(200).json({
                    status: "success",
                    message: "comments retrieved succesfully",
                    comments: comments
                })
            }
        })
    }
} 