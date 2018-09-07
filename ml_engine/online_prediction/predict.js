# Copyright 2017 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

var google = require('googleapis');

var ml = google.ml('v1');

function auth(callback) {
    google.auth.getApplicationDefault(function(err, authClient) {
        if (err) {
            return callback(err);
        }

        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
            authClient = authClient.createScoped([
                'https://www.googleapis.com/auth/cloud-platform'
            ]);
        }
        callback(null, authClient);
    });
}

var instance = {
    age: 25,
    workclass: " Private",
    education: " 11th",
    education_num: 7,
    marital_status: " Never - married",
    occupation: " Machine - op - inspct",
    relationship: " Own - child",
    race: " Black",
    gender: " Male",
    capital_gain: 0,
    capital_loss: 0,
    hours_per_week: 40,
    native_country: " United - Stats"
}

auth(function(err, authClient) {
    if (err) {
        console.error(err);
    } else {
        var ml = google.ml({
            version: 'v1',
            auth: authClient
        });

        // Predict
        ml.projects.predict({
            name: 'projects/op-beta-walkthrough/models/census',
            resource: {
                instances: [instance]
            }
        }, function(err, result) {
            if (err) {
                return callback(err);
            }

            console.log(JSON.stringify(result));
        });
    }
});

