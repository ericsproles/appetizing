// This is the MongoDB store model

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // Take out white space before and after characters
    required: 'Please enter a store name',
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  }
});

// Presave hook in mongoDB to autogenerate a slug field before soemone saves a store
storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); //skip it
    return; //stop this function from running
  }
  this.slug = slug(this.name)
  next();
  // TODO make more resilient so slugs are unique
})

module.exports = mongoose.model('Store', storeSchema);
