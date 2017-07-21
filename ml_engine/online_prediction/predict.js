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

