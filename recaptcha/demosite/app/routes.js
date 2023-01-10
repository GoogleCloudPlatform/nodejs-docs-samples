const express = require('express');
const router = express.Router();

const {loginController} = require('./controllers/loginController');
const {signupController} = require('./controllers/signupController');
const {assessmentController} = require('./controllers/assessmentController');

router.get('/login', loginController);
router.get('/signup', signupController);
router.post('/create_assessment', assessmentController);

module.exports = router;
