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
  homeController,
  loginController,
  signupController,
  storeController,
  commentController,
  gameController,
  assessmentController,
} = require('./controllers/controller');

router.get('/', homeController);
router.get('/store', storeController);
router.get('/login', loginController);
router.get('/comment', commentController);
router.get('/signup', signupController);
router.get('/game', gameController);
router.post('/create_assessment', assessmentController);

module.exports = router;
