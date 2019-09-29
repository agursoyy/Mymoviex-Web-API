var mongoose = require('mongoose');
var validator = require('validator');

var userSchema = mongoose.Schema({
    username: {
        type: String,
    },
    role: {
        type: String,
        default: 'USER'
    },
    email: {
        type: String,
        required: [true,'Email gereklidir!'],
        unique: true
        /*validate: {
            validator: function(v) {
                return new Promise(function(resolve, reject) {
                    User.findOne({email: v}, function(err,user) {
                    
                        if( resolve)
                            resolve(false);
                        resolve(true)
                    } )
                  });
            },
            message: 'Bu email adresi sisteme kayıtlıdır!'
        }*/
    },
    password: {
        type: String,
        required: [true, 'parola gereklidir!'],
        minlength: [8,'parola minimum 8 karakterden oluşmalıdır.']
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    favorites: []
});


var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

// Export Contact model
var User = module.exports = mongoose.model('user', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}
