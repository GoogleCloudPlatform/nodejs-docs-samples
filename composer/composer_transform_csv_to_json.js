// Copyright 2020 Google LLC
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

//Note to maintainers: Skipping these lint rules
//Is required to make code run in Dataflow
/* eslint-disable func-style */
/* eslint-disable no-var */
module.exports = function main(
  line = 'tampa, 106, january, null, null, 08-17-2019'
) {
  // [START composer_transform_csv_to_json]

  function transformCSVtoJSON(line) {
    var values = line.split(',');
    var properties = [
      'location',
      'average_temperature',
      'month',
      'inches_of_rain',
      'is_current',
      'latest_measurement',
    ];
    var weatherInCity = {};

    for (var count = 0; count < values.length; count++) {
      if (values[count] !== 'null') {
        weatherInCity[properties[count]] = values[count];
      }
    }

    const jsonString = JSON.stringify(weatherInCity);
    return jsonString;
  }

  // [END composer_transform_csv_to_json]

  return transformCSVtoJSON(line);
};
