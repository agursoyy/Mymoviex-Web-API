let router = require('express').Router();
let jwt = require('jsonwebtoken')
let config = require('./config')
let User = require('./models/userModel');
router.get('/', function (req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to RESTHub crafted with love!'
    });
});

// Import controllers 
const userController = require('./controllers/userController');
const signupController = require('./controllers/signupController');
const loginController = require('./controllers/loginController');
const  logoutController = require('./controllers/logoutController');
const userProfileController = require('./controllers/userProfileController');
const emailVerificationController = require('./controllers/emailVerificationController');
const forgetPasswordController = require('./controllers/forgetPassswordController');
const commentController = require('./controllers/commentController');
// Contact routes

router.route('/message').get((req,res)=> {
    res.send('Hello');
});

router.route('/users').get(userController.index);
//router.route('/users/signup').post(signupController.signup);
router.post('/users/signup',signupController.validateSignupInput,signupController.signup);
router.route('/confirmation/:token').get(emailVerificationController.verifyEmail); // verify email after signup
router.post('/users/login',loginController.validateLoginInput,loginController.login);
router.post('/forgetpassword',forgetPasswordController.validateForgetPasswordInput,forgetPasswordController.forgetPassword);
router.route('/redirect-password-change/:token').get(forgetPasswordController.redirectPasswordChange);
router.route('/changepassword').post(forgetPasswordController.changePassword);
//router.route('/users/login').post(loginController.login);
router.route('/users/logout').get(logoutController.logout);
router.route('/users/favoriteIDs').get(userProfileController.favoriteIDs);
router.route('/users/favorites').get(userProfileController.favorites);
router.route('/users/addfavorite').post(userProfileController.addFavorite);
router.route('/users/favorites/remove').delete(userProfileController.removeFromFavorites);
router.route('/comments').get(commentController.getComments);
router.post('/user/make-comment',commentController.validateMakeCommentInput,commentController.makeComment);
router.route('/movie/comments/:movieId').get(commentController.getMovieComments);
/*
router.route('/users/:user_id')
    .get(userController.view)
    .patch(userController.update)
    .put(userController.update)
    .delete(userController.delete); */
// Export API routes



module.exports = router;
