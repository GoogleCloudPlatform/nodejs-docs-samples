// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
