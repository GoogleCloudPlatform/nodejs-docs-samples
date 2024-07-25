/**
 * @license
 * Copyright 2023 Google Inc. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const router = express.Router();

const {
  home,
  signup,
  login,
  store,
  comment,
  onSignup,
  onLogin,
  onStoreCheckout,
  onCommentSubmit,
} = require('./controllers/controller');

// Template URL rules.
router.get('/', home);
router.get('/signup', signup);
router.get('/login', login);
router.get('/store', store);
router.get('/comment', comment);

// Submit action URL rules.
router.post('/on_signup', onSignup);
router.post('/on_login', onLogin);
router.post('/on_store_checkout', onStoreCheckout);
router.post('/on_comment_submit', onCommentSubmit);

module.exports = router;
