// Copyright 2018 Google LLC
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

'use strict';

exports.lightComputation = () => {
  // Addition is a "simple" calculation
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.reduce((t, x) => t + x);
};

exports.heavyComputation = () => {
  // Multiplication is "more computationally expensive" than addition
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.reduce((t, x) => t * x);
};
