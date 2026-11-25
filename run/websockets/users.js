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

const MAX_USERNAME_LENGTH = 50;
const MAX_ROOM_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 1000;

// Local record of users
const users = new Map();

// Remove C0/C1 control characters and trim surrounding whitespace
function sanitizeText(value) {
  if (typeof value !== 'string') {
    return null;
  }
  let cleaned = '';
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0x20 && code !== 0x7f && (code < 0x80 || code > 0x9f)) {
      cleaned += value[i];
    }
  }
  return cleaned.trim();
}

// Validate a chat message string before broadcasting or caching
function validateMessage(message) {
  const sanitized = sanitizeText(message);
  if (!sanitized) {
    throw new Error('Message is required');
  }
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`
    );
  }
  return sanitized;
}

// Record socket ID with user's name and chat room
function addUser(id, name, room) {
  const sanitizedName = sanitizeText(name);
  const sanitizedRoom = sanitizeText(room);
  if (!sanitizedName && !sanitizedRoom) {
    throw new Error('Username and room are required');
  }
  if (!sanitizedName) {
    throw new Error('Username is required');
  }
  if (!sanitizedRoom) {
    throw new Error('Room is required');
  }
  if (sanitizedName.length > MAX_USERNAME_LENGTH) {
    throw new Error(
      `Username must be ${MAX_USERNAME_LENGTH} characters or fewer`
    );
  }
  if (sanitizedRoom.length > MAX_ROOM_LENGTH) {
    throw new Error(`Room must be ${MAX_ROOM_LENGTH} characters or fewer`);
  }
  const record = {user: sanitizedName, room: sanitizedRoom};
  users.set(id, record);
  return record;
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
  MAX_USERNAME_LENGTH,
  MAX_ROOM_LENGTH,
  MAX_MESSAGE_LENGTH,
  sanitizeText,
  validateMessage,
  addUser,
  getUser,
  deleteUser,
};
