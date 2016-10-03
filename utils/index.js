// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var execSync = require('child_process').execSync;

exports.run = function (cmd, cwd) {
  return execSync(cmd, { cwd: cwd }).toString().trim();
};

exports.pick = function (obj, field) {
  if (Array.isArray(field)) {
    var _obj = {};
    field.forEach(function (_field) {
      _obj[_field] = obj[_field];
    });
    return _obj;
  }
  return obj[field];
};

exports.prettyPick = function (obj, field) {
  if (Array.isArray(field)) {
    return JSON.stringify(exports.pick(obj, field));
  }
  return exports.pick(obj, field);
};

exports.makeHandler = function (print, field) {
  return function (err, result) {
    if (err) {
      console.log(err);
      throw err;
    }
    if (print === false) {
      return;
    }
    if (Array.isArray(result) && field) {
      var mapped = result.map(function (_result) {
        return exports.prettyPick(_result, field);
      });
      console.log(mapped.join('\n'));
    } else if (field) {
      console.log(exports.prettyPick(result, field));
    } else {
      console.log(result);
    }
  };
};

exports.noop = (err) => {
  if (err) {
    throw err;
  }
};
