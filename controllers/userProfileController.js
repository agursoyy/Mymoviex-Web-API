User = require('../models/userModel');
let mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('../config');

function fetchFavoriteIDs(userID,res) {
    User.findById(userID, function (err, user) {
        if (err) 
            res.status(500).json(err);
        else {
            if(user)
            {
                let favIds = [];
                for(let i=0; i<user.favorites.length; i++)
                    favIds[i] = user.favorites[i].id;
                res.status(200).json({
                    message: "ID's of favorite movies are loading",
                    results: favIds
                })
          
            }  
            else
                res.status(404).send('No user found.');
        }  
    });
}
function fetchFavorites(userID,page,res) {
    User.findById(userID, function (err, user) {
        if (err) 
            res.status(500).json(err);
        else {
            if(user)
            {
                const pagingOffSet = 20;
                const start = (page - 1) * pagingOffSet;
                const end = start + pagingOffSet;
                const result = user.favorites.slice(start, end);

                let totalPages = Math.floor(user.favorites.length / pagingOffSet);
                if(totalPages === 0)
                  totalPages = 1;
                else if(user.favorites.length % pagingOffSet > 0)
                    totalPages++;

                res.status(200).json({
                    message: 'favorite movies are loading',
                    results: result,
                    total_pages: totalPages
                })
               
            }  
            else
                res.status(404).send('No user found.');
        }  
    });
}

function newFavorite(userID,movie,res) {
   new Promise((resolve,reject) => {
    User.findById(userID,function (err, user) {
        if (err) 
            res.status(500).send(err);
        else {
            if(user)
            {
                let exists = checkFavoriteAlreadyExists(user.favorites,movie.id);
                console.log(exists);
                let favorites = user.favorites;
                resolve({exists, favorites})
            }  
            else
                res.status(404).send('No user found.');
        }  
    });
   }).then(data => {
       if(!data.exists) {  // if movie not already added into favorite list
            const id = mongoose.Types.ObjectId(userID);
             const newFavsData= [...data.favorites, movie];
            User.findOneAndUpdate({_id: id },{favorites: newFavsData}, {runValidator: false}, function(err,user) {
                if(err) 
                    res.status(500).send(err); // internal system error.
                else {
                    res.status(201).json({
                        message: 'movie added to favorites...',
                        movie: movie
                    })
                }
            })
       }
       else 
            res.status(400).send('this movie has been already added into favorites.')
   }).catch((err) => {
       res.status(500).send(err);
   });   
}
function removeFavorite(userID,movieID,res) {
    new Promise((resolve,reject) => {
     User.findById(userID,function (err, user) {
         if (err) 
             res.status(500).send(err);
         else {
             if(user)
             {
                 let exists = checkFavoriteAlreadyExists(user.favorites,movieID);
                 resolve({exists, user})
             }  
             else
                 res.status(404).send('No user found.');
         }  
     });
    }).then(data => {
        if(!data.exists) {  // if movie does not exists into favorite list
            res.status(400).send('movie with provided id not found in favorites.')    
        }
        else {
            for( var i = 0; i < data.user.favorites.length; i++){ 
                if (data.user.favorites[i].id === movieID) {
                  data.user.favorites.splice(i, 1);  // remove that movie
                  break;
                }
            }
            data.user.save();
            res.status(200).json({
                message: 'movie removed from favorites',
                movieId: movieID 
            })
        }
    }).catch((err) => {
        res.status(500).send(err);
    });   
 }
function checkFavoriteAlreadyExists(favorites,movieID) {
    for(var i=0; i<favorites.length; i++) {
        if(favorites[i].id === movieID) {
            return true;   
        }
    }
    return false;
}
exports.favoriteIDs = (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token)  res.status(401).send({ auth: false, message: 'No token provided.' });  // forbidden to access data.
    else {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) 
              res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                let userID = decoded.id;
                fetchFavoriteIDs(userID,res);
            }
         });
    }
}
exports.favorites = (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token)  res.status(401).send({ auth: false, message: 'No token provided.' });  // forbidden to access data.
    else {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) 
              res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                let userID = decoded.id;
                const page = req.query.page;
                fetchFavorites(userID,page,res);
            }
         });
    }

}

exports.addFavorite = (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token)  res.status(401).send({ auth: false, message: 'No token provided.' });  // forbidden to access data.
    else {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) 
                res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                if(!req.body.movie)
                    res.status(400).send('No movieId provided.');
                else {
                    let userID = decoded.id;
                    let movie = req.body.movie;             
                    newFavorite(userID,movie,res);
                }
             }
         });
    }

}
exports.removeFromFavorites = (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token)  res.status(401).send({ auth: false, message: 'No token provided.' });  // forbidden to access data.
    else {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) 
                res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                if(!req.body.movieId)
                    res.status(400).send('No movieId provided.');
                else {
                    let userID = decoded.id;
                    let movieID = parseInt(req.body.movieId);             
                    removeFavorite(userID,movieID,res);
                }
            }
        });
    }

}