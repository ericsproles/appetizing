const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', authController.isLogginIn, storeController.addStore);
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore));
router.post('/add/:id', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/tags', catchErrors(storeController.getStoresbyTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresbyTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login)
router.get('/register', userController.registerForm);

router.post('/register', 
  userController.validateRegister, // 1. Validate the registration data
  userController.register, // 2. Register the user
  authController.login  // 3. Log the user in
  )
router.get('/logout', authController.logout);

// router.get('/reverse/:name', (req, res) => {
//   const reverse = [...req.params.name].reverse().join('');
//   res.send(reverse);
// })

module.exports = router;
