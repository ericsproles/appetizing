const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/add', authController.isLogginIn, storeController.addStore);
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore));
router.post('/add/:id', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore));

router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresbyTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresbyTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login)
router.get('/logout', authController.logout);

router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister, // 1. Validate the registration data
  userController.register, // 2. Register the user
  authController.login  // 3. Log the user in
)
router.get('/account', authController.isLogginIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
  authController.confirmedPasswords, 
  catchErrors(authController.update)
  );
  
router.get('/map', storeController.mapPage);

router.get('/hearts', authController.isLogginIn, catchErrors(storeController.getHearts));

router.get('/top', catchErrors(storeController.getTopStores));


/*
 //////////////////////---------- API -----------///////////////////////////////
*/

router.get('/api/v1/search', catchErrors(storeController.searchStores));
router.get('/api/v1/stores/near', catchErrors(storeController.mapStores));
router.post('/api/v1/stores/:id/heart', catchErrors(storeController.heartStore));
router.post('/reviews/:id', authController.isLogginIn, catchErrors(reviewController.addReview));

module.exports = router;



// TEST CODE
// router.get('/reverse/:name', (req, res) => {
//   const reverse = [...req.params.name].reverse().join('');
//   res.send(reverse);
// })