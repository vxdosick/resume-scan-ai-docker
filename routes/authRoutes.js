const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController')
const authMiddlewares = require('../middlewares/authMiddleware');

router.get('/login', (req, res) => {
    res.render('login', {title: "Login"});
});
router.get('/register', (req, res) => {
    res.render('register', {title: "Register"});
});

router.post('/register-form', AuthController.registration);
router.post('/login-form', AuthController.login);

router.get('/logout', AuthController.logout)
router.get('/activate/:link', AuthController.activate)
router.get('/refresh', AuthController.refresh)
router.get('/users', authMiddlewares ,AuthController.getUsers)

module.exports = router;