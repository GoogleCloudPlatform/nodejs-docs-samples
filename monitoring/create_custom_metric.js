// Copyright 2015, Google, Inc.
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

/**
 * @fileoverview Simple command-line program to demonstrate creating a custom
 * metric with the Google Cloud Monitoring API, writing a random value to it,
 * and reading it back.
 */
'use strict';

/* jshint camelcase: false */

var google = require('googleapis');
var async = require('async');

var args = process.argv.slice(2);
if (args.length !== 1) {
    console.log('Usage: node auth_and_list_env.js <project_id>');
    process.exit();
}

var monitoringScopes = [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/monitoring',
    'https://www.googleapis.com/auth/monitoring.read',
    'https://www.googleapis.com/auth/monitoring.write'
];


/** The project resource created from the project ID */
var PROJECT_RESOURCE = 'projects/' + args[0];

/** This domain should be used for all custom metrics. */
var CUSTOM_METRIC_DOMAIN = 'custom.googleapis.com';

/** This is the type of the custom metric */
var CUSTOM_METRIC_TYPE = CUSTOM_METRIC_DOMAIN + '/custom_measurement';

/** This is the name of the custom metric */
var CUSTOM_METRIC_NAME = PROJECT_RESOURCE + '/metricDescriptors/' +
    CUSTOM_METRIC_TYPE;

/**
 * Returns the current timestamp in RFC33339 with milliseconds format.
 */
function getNow() {
    var d = new Date();
    return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

/**
 * Returns an hour ago in RFC33339 with milliseconds format. This is used
 * to start the window to view the metric written in.
 */
function getStartTime() {
    var d = new Date();
    d.setHours(d.getHours() - 1);
    return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

/**
 * Gets random integer between low and high (exclusive). Used to fill in
 * a random value for the measurement.
 */
function getRandomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


/**
 * Creates a custo metric. For demonstration purposes, this is a hypothetical
 * measurement (measured in the 'items' unit, with random values written to
 * it.
 * @param authClient The authorized Monitoring client.
 * @param projectId
 * @param callback
 */
function createCustomMetric(authClient, projectResource, callback) {
    var monitoring = google.monitoring('v3');

    monitoring.projects.metricDescriptors.create({
        auth: authClient,
        name: projectResource,
        resource: {
            name: CUSTOM_METRIC_NAME,
            type: CUSTOM_METRIC_TYPE,
            labels: [
                {
                    key: 'environment',
                    valueType: 'STRING',
                    description: 'An abritrary measurement'
                }
            ],
            metricKind: 'GAUGE',
            valueType: 'INT64',
            unit: 'items',
            description: 'An arbitrary measurement.',
            displayName: 'Custom Metric'
        }
    }, function (error, customMetric) {
        if (error) {
            console.error('Error Creating Custom Metric', error);
            return;
        }
        console.log('createCustomMetric: ');
        console.log(customMetric);
        callback();
    });
}

/**
 * Writes a time series value for the custom metric just created. It uses a
 * GAUGE measurement which indicates the value at this point in time. For
 * demonstration purposes, this is a random value. For GAUGE measurements,
 * the start time and end time of the value must be the same. The
 * resource for this value is a hypothetical GCE instance.
 * @param authClient The authorized Google Cloud Monitoring API client
 * @param projectResource The project resource created from the project ID
 * @param callback
 */
function writeTimeSeriesForCustomMetric(client, projectResource, callback) {
    var monitoring = google.monitoring('v3');
    var now = getNow();
    monitoring.projects.timeSeries.create({
        auth: client,
        name: projectResource,
        resource: {
            timeSeries: [{
                metric: {
                    type: CUSTOM_METRIC_TYPE,
                    labels: {
                        environment: 'STAGING'
                    }
                },
                resource: {
                    type: 'gce_instance',
                    labels: {
                        instance_id: 'test_instance',
                        zone: 'us-central1-f'
                    }
                },
                metricKind: 'GAUGE',
                valueType: 'INT64',
                points: {
                    interval: {
                        startTime: now,
                        endTime: now
                    },
                    value: {
                        int64Value: getRandomInt(1, 20)
                    }
                }
            }]
        }
    }, function (error, timeSeries) {
        if (error) {
            console.error('Error writing time series', error);
            return;
        }
        console.log('timeSeries: ');
        console.log(timeSeries);
        callback();
    });
}

/**
 * Lists the time series written for the custom metric. The window
 * to read the timeseries starts an hour ago and extends unti the current
 * time, so should include the metric value written by
 * the earlier calls.
 * @param authClient The authorized Google Cloud Monitoring API client
 * @param projectResource The project resource created from the project ID
 * @param callback
 */
function listTimeSeries(client, projectResource, callback) {
    var monitoring = google.monitoring('v3');
    var startTime = getStartTime();
    var endTime = getNow();
    monitoring.projects.timeSeries.list({
        auth: client,
        name: projectResource,
        filter: 'metric.type="' + CUSTOM_METRIC_TYPE + '"',
        pageSize: 3,
        'interval.startTime': startTime,
        'interval.endTime': endTime
    }, function (error, timeSeries) {
        if (error) {
            console.error('Error readTimeseries', error);
            return;
        }
        console.log('readTimeseries ');
        console.log(JSON.stringify(timeSeries));
        callback();
    });
}

google.auth.getApplicationDefault(function (error, authClient) {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    // Depending on the environment that provides the default credentials
    // (e.g. Compute Engine, App Engine), the credentials retrieved may
    // require you to specify the scopes you need explicitly.
    // Check for this case, and inject the Cloud Storage scope if required.
    if (authClient.createScopedRequired &&
        authClient.createScopedRequired()) {
        authClient = authClient.createScoped(monitoringScopes);
    }

    // Create the service object.
    async.series([
        function (callback) {
            createCustomMetric(authClient, PROJECT_RESOURCE, callback);
        }, function (callback) {
            writeTimeSeriesForCustomMetric(authClient,
                PROJECT_RESOURCE, callback);
        }, function (callback) {
            // wait 2 seconds for the write to be received
            setTimeout(function () {
                listTimeSeries(authClient, PROJECT_RESOURCE, callback);
            }, 2000);
        }]);
});
