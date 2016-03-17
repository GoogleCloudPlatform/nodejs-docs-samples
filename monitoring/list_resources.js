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
 * @fileoverview Simple command-line program to demonstrate connecting to the
 * Google Monitoring API to retrieve API data.
 */
'use strict';

var google = require('googleapis');
var async = require('async');

var args = process.argv.slice(2);
if (args.length !== 1) {
    console.log('Usage: node list_resources.js <project_id>');
    process.exit();
}

var monitoringScopes = [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/monitoring',
    'https://www.googleapis.com/auth/monitoring.read',
    'https://www.googleapis.com/auth/monitoring.write'
];

var PROJECT_ID = 'projects/' + args[0];
var METRIC = 'compute.googleapis.com/instance/cpu/usage_time';


/**
 * Returns an hour ago minus 5 minutes in RFC33339 format.
 */
function getStartTime() {
    var d = new Date();
    d.setHours(d.getHours() - 1);
    d.setMinutes(d.getMinutes() - 5);
    return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

/**
 * Returns an hour ago in RFC33339 format.
 */
function getEndTime() {
    var d = new Date();
    d.setHours(d.getHours() - 1);
    return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

/**
 * This Lists all the resources available to be monitored in the API.
 *
 * @param {googleAuthClient} authClient - The authenticated Google api client
 * @param {String} projectId - the project id
 * @param {requestCallback} callback - a function to be called when the server
 *     responds with the list of monitored resource descriptors
 */
function listMonitoredResourceDescriptors(authClient, projectId, callback) {
    var monitoring = google.monitoring('v3');
    monitoring.projects.monitoredResourceDescriptors.list({
        auth: authClient,
        name: projectId,
    }, function (error, monitoredResources) {
        if (error) {
            console.error(
                'Error Retrieving Monitored Resource Descriptors', error);
            return;
        }
        console.log('listMonitoredResourceDescriptors: ');
        console.log(monitoredResources);
        callback();
    });
}

/**
 * This Lists the metric descriptors that start with our METRIC name, in this
 * case the CPU usage time.
 * @param {googleAuthClient} authClient - The authenticated Google api client
 * @param {String} projectId - the project id
 * @param {requestCallback} callback - a function to be called when the server
 *     responds with the list of monitored resource descriptors
 */
function listMetricDescriptors(authClient, projectId, callback) {
    var monitoring = google.monitoring('v3');
    monitoring.projects.metricDescriptors.list({
        auth: authClient,
        filter: 'metric.type="' + METRIC + '"',
        name: projectId
    }, function (error, metricDescriptors) {
        if (error) {
            console.error('Error Retrieving Metric Descriptors', error);
            return;
        }
        console.log('listMetricDescriptors');
        console.log(metricDescriptors);
        callback();
    });
}

/**
 * This Lists all the timeseries created between START_TIME and END_TIME
 * for our METRIC.
 * @param {googleAuthClient} authClient - The authenticated Google api client
 * @param {String} projectId - the project id
 * @param {requestCallback} callback - a function to be called when the server
 *     responds with the list of monitored resource descriptors
 */
function listTimeseries(authClient, projectId, callback) {
    var monitoring = google.monitoring('v3');
    var startTime = getStartTime();
    var endTime = getEndTime();

    monitoring.projects.timeSeries.list({
        auth: authClient,
        filter: 'metric.type="' + METRIC + '"',
        pageSize: 3,
        'interval.startTime': startTime,
        'interval.endTime': endTime,
        name: projectId
    }, function (error, timeSeries) {
        if (error) {
            console.error('Error Retrieving Timeseries', error);
            return;
        }
        console.log('listTimeseries');
        console.log(timeSeries);
        callback();
    });
}


google.auth.getApplicationDefault(function (error, authClient) {
    if (error) {
        console.error(error);
        process.exit();
    }

    // Depending on the environment that provides the default credentials
    // (e.g. Compute Engine, App Engine), the credentials retrieved may require
    // you to specify the scopes you need explicitly.
    // Check for this case, and inject the Cloud Storage scope if required.
    if (authClient.createScopedRequired &&
        authClient.createScopedRequired()) {
        authClient = authClient.createScoped(monitoringScopes);
    }

    // Create the service object.
    async.series([
        function (callback) {
            listMonitoredResourceDescriptors(authClient, PROJECT_ID, callback);
        }, function (callback) {
            listMetricDescriptors(authClient, PROJECT_ID, callback);
        }, function (callback) {
            listTimeseries(authClient, PROJECT_ID, callback);
        }]
    );
});
