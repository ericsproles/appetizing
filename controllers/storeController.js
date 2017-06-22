const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }), false
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: ' Add Store 🏪' }); 
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if(!req.file) {
    next(); //skip to next middleware
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize 
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going
  next();
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  await store.save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // Query the database for a list of all stores
  const stores = await Store.find();
  // Pass data to stores template
  res.render('stores', { title: 'Stores', stores });
}

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {  //mongoose equals method
    throw Error('You must own a store in order to edit it!');
  }
}

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id })
  // TODO 2. Confirm they are the owner of the store
  confirmOwner(store, req.user);
  // 3. Render out the edit form so the user can edit their store
  res.render('editStore', { title: `Edit ${store.name}`, store: store })
}

exports.updateStore = async (req, res) => {
  // Set the location data to be a point
  req.body.location.type = 'Point';
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true, //return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated ${store.name}. <a href="/store/${store.slug}"><strong>View Store</strong> ➡️</a>`);
  res.redirect(`/stores/${store.id}/edit`);
  // Redirect them to the store and tell them it worked
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug }).populate('author');
  if(!store) return next();
  res.render('store', { store: store, title: store.name });
}

exports.getStoresbyTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery }); // find all stores where tag property includes tag const above
  // await tagsPromise and storesPromise, store 1st result into 'tags' and 2nd into 'stores' const's. This is ES6 destructuring
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]); 

  res.render('tags', { tags, title: 'Tags', tag, stores }); 
}

exports.searchStores = async (req, res) => {
  const stores = await Store
  // first find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  }) // then sort them by score
  .sort({
    score: { $meta: 'textScore' }
  })
  .limit(5)
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };

const stores = await Store.find(q).select('slug name description location photo').limit(10);
res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
}

  // Get list of user's hearts (array), check if that heart is in that array, if it is, pull it(take out), if not it will set it(add it in) 
exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  // Is this store ID already in the array? If so, remove it. If not, add it
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User // find user and update hearts property
    .findByIdAndUpdate(req.user.id,
    { [operator]: { hearts: req.params.id }}, // because we put it in a variable we can use can use computed property name in a variable with es6, either replace itself with $pull or $addToSet
    { new: true } // return updated user
    )
  res.json(user);
}