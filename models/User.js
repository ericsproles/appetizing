const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; // tell Mongoose to use ES6 promises
const md5 = require('md5');
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    require: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please enter your name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    { type: mongoose.Schema.ObjectId, ref: 'Store' } // Id's related to a store
  ]
});

userSchema.virtual('gravatar').get(function() {
  // return `http://cdn2us.denofgeek.com/sites/denofgeekus/files/arnold-schwarzenegger-end21.jpg`
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema)