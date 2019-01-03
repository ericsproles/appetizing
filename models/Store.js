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
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  toJSON: { virtuals: true },  // So it shows up in .dump
  toObject: { virtuals: true }, // So it shows up in .dump
}
);

// Define our indexes
storeSchema.index({
  name: 'text',
  description: 'text' 
})

storeSchema.index({
  location: '2dsphere'
})

// Presave hook in mongoDB to autogenerate a slug field before soemone saves a store
storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //skip it
    return; //stop this function from running
  }
  this.slug = slug(this.name)
  // find other stores that have a slug of name-1, name-2, name-3...
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
  // TODO make more resilient so slugs are unique
})

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' }, // create a store instance for each tag (duplicates content)
    { $group: { _id: '$tags', count: { $sum: 1 } }}, // group store instances based on tag, then count(add 1)
    { $sort: { count: -1 } }
    ]);
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Lookup Stores and populate their reviews
    { $lookup: {
        from: 'reviews', // from 'Review'. NOTE: MongoDB lower cases it and adds an 's'.
        localField: '_id', // how we link the two
        foreignField: 'store', // how we link the two
        as: 'reviews' } },// can be named anything
    // filter for only items that have 2 more reviews
    { $match: { 'reviews.1': { $exists: true} }}, // where the second item in StoreReviews is true
    // Add the average reviews field
    { $project: {  // add in all fields needed, with mongodb 3.4+ you can just use '$addfield'.
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
      averageRating: { $avg: '$reviews.rating' }  // create new field 'averageRating' and set it to each of review's rating field
    } },
    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 }},
    // limit it to at most 10
    { $limit: 10 }
  ])
}

// find reviews where the stores _id property === reviews store property
// NOTE: by default virtual fiedls do not go into an object or json unless specifically 
// asked to (will not show in dump). Can change this by adding toJSON and toObject
// in the model.
storeSchema.virtual('reviews', { 
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
})

function autopopulate(next) {
  this.populate('reviews')
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
 