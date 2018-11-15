/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how programatically grant access to the Google
 * Cloud IoT Core service account on a given PubSub topic.
 *
 * For more information, see https://cloud.google.com/iot.
 */

function setTopicPolicy(topicName) {
  // Imports the Google Cloud client library
  const PubSub = require('@google-cloud/pubsub');

  // Instantiates a client
  const pubsub = PubSub();

  // References an existing topic, e.g. "my-topic"
  const topic = pubsub.topic(topicName);

  // The new IAM policy
  const serviceAccount = 'serviceAccount:cloud-iot@system.gserviceaccount.com';

  topic.iam
    .getPolicy()
    .then(results => {
      const policy = results[0] || {};
      policy.bindings || (policy.bindings = []);
      console.log(JSON.stringify(policy, null, 2));

      let hasRole = false;
      let binding = {
        role: 'roles/pubsub.publisher',
        members: [serviceAccount],
      };

      policy.bindings.forEach(_binding => {
        if (_binding.role === binding.role) {
          binding = _binding;
          hasRole = true;
          return false;
        }
      });

      if (hasRole) {
        binding.members || (binding.members = []);
        if (binding.members.indexOf(serviceAccount) === -1) {
          binding.members.push(serviceAccount);
        }
      } else {
        policy.bindings.push(binding);
      }

      // Updates the IAM policy for the topic
      return topic.iam.setPolicy(policy);
    })
    .then(results => {
      const updatedPolicy = results[0];

      console.log(JSON.stringify(updatedPolicy, null, 2));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

if (module === require.main) {
  setTopicPolicy(process.argv[2]);
}
