// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Local record of users
const users = new Map();

// Record socket ID with user's name and chat room
function addUser(id, name, room) {
  if (!name && !room) return new Error('Username and room are required');
  if (!name) return new Error('Username is required');
  if (!room) return new Error('Room is required');
  users.set(id, {user: name, room});
}

// Return user's name and chat room from socket ID
function getUser(id) {
  return users.get(id) || {};
}

// Delete user record
function deleteUser(id) {
  const user = getUser(id);
  users.delete(id);
  return user;
}

module.exports = {
  addUser,
  getUser,
  deleteUser,
};
