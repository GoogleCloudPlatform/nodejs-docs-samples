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

'use strict';

const grpc = require('grpc');
const structjson = require('./structjson.js');
const prompt = require('prompt');

// /////////////////////////////////////////////////////////////////////////////
// Operations for entity types.
// /////////////////////////////////////////////////////////////////////////////

function createEntityTypes(projectId) {
  // [START dialogflow_create_entity]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();
  const intentsClient = new dialogflow.IntentsClient();

  // The path to the agent the created entity type belongs to.
  const agentPath = intentsClient.projectAgentPath(projectId);

  const promises = [];

  // Create an entity type named "size", with possible values of small, medium
  // and large and some synonyms.
  const sizeRequest = {
    parent: agentPath,
    entityType: {
      displayName: 'size',
      kind: 'KIND_MAP',
      autoExpansionMode: 'AUTO_EXPANSION_MODE_UNSPECIFIED',
      entities: [
        {value: 'small', synonyms: ['small', 'petit']},
        {value: 'medium', synonyms: ['medium']},
        {value: 'large', synonyms: ['large', 'big']},
      ],
    },
  };
  promises.push(
    entityTypesClient
      .createEntityType(sizeRequest)
      .then(responses => {
        console.log('Created size entity type:');
        logEntityType(responses[0]);
      })
      .catch(err => {
        console.error('Failed to create size entity type:', err);
      })
  );

  // Create an entity of type named "topping", with possible values without
  // synonyms.
  const toppingRequest = {
    parent: agentPath,
    entityType: {
      displayName: 'topping',
      kind: 'KIND_LIST',
      autoExpansionMode: 'AUTO_EXPANSION_MODE_UNSPECIFIED',
      entities: [
        {value: 'tomato', synonyms: ['tomato']},
        {value: 'tuna', synonyms: ['tuna']},
        {value: 'cheddar', synonyms: ['cheddar']},
        {value: 'mushrooms', synonyms: ['mushrooms']},
      ],
    },
  };
  promises.push(
    entityTypesClient
      .createEntityType(toppingRequest)
      .then(responses => {
        console.log('Created topping entity type:');
        logEntityType(responses[0]);
      })
      .catch(err => {
        console.error('Failed to create topping entity type:', err);
      })
  );

  return Promise.all(promises);
  // [END dialogflow_create_entity]
}

function listEntityTypes(projectId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();
  const intentsClient = new dialogflow.IntentsClient();

  // The path to the agent the entity types belong to.
  const agentPath = intentsClient.projectAgentPath(projectId);

  // The request.
  const request = {
    parent: agentPath,
  };

  // Call the client library to retrieve a list of all existing entity types.
  return entityTypesClient
    .listEntityTypes(request)
    .then(responses => {
      return responses[0];
    })
    .catch(err => {
      console.error('Failed to list entity types:', err);
    });
}

function clearEntityTypes(projectId) {
  // List all entity types then delete all of them.
  return listEntityTypes(projectId).then(entityTypes => {
    return Promise.all(
      entityTypes.map(entityType => {
        return deleteEntityType(entityType);
      })
    );
  });
}

function deleteEntityType(entityType) {
  // [START dialogflow_delete_entity]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The request.
  const request = {
    name: entityType.name,
  };
  // Call the client library to delete the entity type.
  return entityTypesClient
    .deleteEntityType(request)
    .then(() => {
      console.log(`Entity type ${entityType.displayName} deleted`);
    })
    .catch(err => {
      console.error(
        `Failed to delete entity type ${entityType.displayName}:`,
        err
      );
    });
  // [END dialogflow_delete_entity]
}

function showEntityTypes(projectId) {
  // List all entity types then delete all of them.
  return listEntityTypes(projectId).then(entityTypes => {
    return Promise.all(
      entityTypes.map(entityType => {
        return getEntityType(entityType);
      })
    );
  });
}

function getEntityType(entityType) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates client
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The request.
  const request = {name: entityType.name};

  // Call the client library to retrieve an entity type.
  return entityTypesClient
    .getEntityType(request)
    .then(responses => {
      console.log('Found entity type:');
      logEntityType(responses[0]);
    })
    .catch(err => {
      console.error(`Failed to get entity type ${entityType.displayName}`, err);
    });
}

function updateEntityType(projectId, entityTypeId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates client
  const entityTypesClient = new dialogflow.EntityTypesClient();

  // The path to the entity type to be updated.
  const entityTypePath = entityTypesClient.entityTypePath(
    projectId,
    entityTypeId
  );

  // UpdateEntityType does full snapshot update. For incremental update
  // fetch the entity type first then modify it.
  const getEntityTypeRequest = {
    name: entityTypePath,
  };

  entityTypesClient
    .getEntityType(getEntityTypeRequest)
    .then(responses => {
      const entityType = responses[0];
      // Add a new entity foo to the entity type.
      entityType.entities.push({value: 'foo', synonyms: ['foo']});
      const request = {
        entityType: entityType,
      };

      return entityTypesClient.updateEntityType(request);
    })
    .then(responses => {
      console.log('Updated entity type:');
      logEntityType(responses[0]);
    })
    .catch(err => {
      console.error('Failed to update entity type', err);
    });
}

function logEntityType(entityType) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates client.
  const entityTypesClient = new dialogflow.EntityTypesClient();

  console.log(
    '  ID:',
    entityTypesClient.matchEntityTypeFromEntityTypeName(entityType.name)
  );
  console.log('  Display Name:', entityType.displayName);
  console.log(
    '  Auto expansion:',
    entityType.autoExpansionMode === 'AUTO_EXPANSION_MODE_DEFAULT'
  );
  if (!entityType.entities) {
    console.log('  No entity defined.');
  } else {
    console.log('  Entities: ');
    entityType.entities.forEach(entity => {
      if (entityType.kind === 'KIND_MAP') {
        console.log(`    ${entity.value}: ${entity.synonyms.join(', ')}`);
      } else {
        console.log(`    ${entity.value}`);
      }
    });
  }
  console.log('');
}

// /////////////////////////////////////////////////////////////////////////////
// Operations for intents
// /////////////////////////////////////////////////////////////////////////////

function createIntents(projectId) {
  // [START dialogflow_create_intent]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();
  const intentsClient = new dialogflow.IntentsClient();

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId);

  // Setup intents for ordering a pizza.

  // First of all, let's create an intent that triggers pizza order flow.

  // Output contexts for ordering pizza. They are used for matching follow-up
  // intents. For pizza ordering intents, a "pizza" output context is used for
  // hinting the conversation is about pizza ordering, not beer or something
  // else. For the first intent, it returns responses asking users to provide
  // size information, with a "size" output context for matching the intent
  // asking for the size of the pizza.

  // Note that session ID is unknown here, using asterisk.
  const pizzaOutputContexts = [
    {
      name: contextsClient.contextPath(
        projectId,
        '*' /* sessionId */,
        'pizza_order'
      ),
      lifespanCount: 5,
    },
  ];

  // The result of the matched intent.
  const pizzaResult = {
    action: 'pizza',
    parameters: [
      {
        displayName: 'size',
        value: '$size',
        entityTypeDisplayName: '@size',
        mandatory: true,
        prompts: [
          'What size pizza would you like to order?',
          'Would you like a large, medium, or small pizza?',
        ],
      },
      {
        displayName: 'topping',
        value: '$topping',
        entityTypeDisplayName: '@topping',
        mandatory: true,
        prompts: ['What toppings would you like?'],
        isList: true,
      },
      {
        displayName: 'address',
        value: '$address',
        // The API provides a built-in entity type @sys.address for addresses.
        entityTypeDisplayName: '@sys.location',
        mandatory: true,
        prompts: ['What is the delivery address?'],
      },
    ],
    messages: [
      {
        text: {
          text: [
            'No problem. Getting a $size pizza with $topping and delivering ' +
              'to $address.',
          ],
        },
      },
      {
        text: {
          text: [
            'Reply "check" to place your order. Reply "cancel" to cancel ' +
              'your order. You can change your delivery address as well.',
          ],
        },
      },
      {
        quickReplies: {
          title:
            'No problem. Getting a $size pizza with $topping and ' +
            'delivering to $address.',
          quickReplies: ['Place order', 'Cancel'],
        },
        platform: 'PLATFORM_FACEBOOK',
      },
    ],
    outputContexts: pizzaOutputContexts,
  };

  // The phrases for training the linguistic model.
  const pizzaPhrases = [
    {type: 'EXAMPLE', parts: [{text: 'Order pizza'}]},
    {type: 'EXAMPLE', parts: [{text: 'Pizza'}]},
    {
      type: 'EXAMPLE',
      parts: [
        {text: 'Get me a '},
        {text: 'large', entityType: '@size', alias: 'size'},
        {text: ' '},
        {text: 'mushrooms', entityType: '@topping', alias: 'topping'},
        {text: ' for '},
        {
          text: '1 1st st, New York, NY',
          entityType: '@sys.location',
          alias: 'address',
        },
      ],
    },
    {
      type: 'EXAMPLE',
      parts: [
        {text: "I'd like to order a "},
        {text: 'large', entityType: '@size', alias: 'size'},
        {text: ' pizza with '},
        {text: 'mushrooms', entityType: '@topping', alias: 'topping'},
      ],
    },
    {
      type: 'TEMPLATE',
      parts: [{text: "I'd like a @size:size pizza"}],
    },
  ];

  // The intent to be created.
  const pizzaIntent = {
    displayName: 'Pizza',
    events: ['order_pizza'],
    // Webhook is disabled because we are not ready to call the webhook yet.
    webhookState: 'WEBHOOK_STATE_DISABLED',
    trainingPhrases: pizzaPhrases,
    mlEnabled: true,
    priority: 500000,
    result: pizzaResult,
  };

  const pizzaRequest = {
    parent: agentPath,
    intent: pizzaIntent,
  };

  // Create the pizza intent
  intentsClient
    .createIntent(pizzaRequest)
    .then(responses => {
      console.log('Created Pizza intent:');
      logIntent(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  // Create an intent to change the delivery address. This intent sets input
  // contexts to make sure it's triggered in the conversation with the pizza
  // intent created above.

  // The input contexts are the output contexts of the pizza intent.
  const changeDeliveryAddressInputContexts = [
    contextsClient.contextPath(projectId, '*' /* sessionId */, 'pizza_order'),
  ];

  // Renew the pizza_order intent. Without doing so the lifespan count of the
  // pizza_order intent will decrease and eventually disappear if the user
  // changes the delivery address a couple times.
  const changeDeliveryAddressOutputContexts = [
    {
      name: contextsClient.contextPath(
        projectId,
        '*' /* sessionId */,
        'pizza_order'
      ),
      lifespanCount: 5,
    },
  ];

  // This intent requires the $address parameter to be provided. The other
  // parameters are collected from the pizza_order context.
  const changeDeliveryAddressParameters = [
    {
      displayName: 'address',
      entityTypeDisplayName: '@sys.location',
      mandatory: true,
      prompts: ['What is new address?'],
    },
    {
      displayName: 'size',
      value: '#pizza_order.size',
      entityTypeDisplayName: '@size',
    },
    {
      displayName: 'topping',
      value: '#pizza_order.topping',
      entityTypeDisplayName: '@topping',
      isList: true,
    },
  ];

  const changeDeliveryAddressResult = {
    action: 'change-delivery-address',
    parameters: changeDeliveryAddressParameters,
    messages: [
      {
        text: {
          text: ['OK, the delivery address is changed to $address'],
        },
      },
      {text: {text: ['You ordered a $size pizza with $topping.']}},
      {
        text: {
          text: [
            'Reply "check" to place your order. Reply "cancel" to cancel ' +
              'your order. You can change your delivery address as well.',
          ],
        },
      },
    ],
    outputContexts: changeDeliveryAddressOutputContexts,
  };

  // The triggering phrases. One is an annotated example, the other is a
  // template.
  const changeDeliveryAddressPhrases = [
    {
      type: 'EXAMPLE',
      parts: [
        {text: 'Change address to '},
        {
          text: '1 1st st, new york, ny',
          entityType: '@sys.location',
          alias: 'address',
        },
      ],
    },
    {
      type: 'EXAMPLE',
      parts: [
        {
          text: '1 1st st, new york, ny',
          entityType: '@sys.location',
          alias: 'address',
        },
      ],
    },
  ];

  const changeDeliveryAddressIntent = {
    displayName: 'ChangeDeliveryAddress',
    webhookState: 'WEBHOOK_STATE_DISABLED',
    trainingPhrases: changeDeliveryAddressPhrases,
    inputContexts: changeDeliveryAddressInputContexts,
    mlEnabled: true,
    priority: 500000,
    result: changeDeliveryAddressResult,
  };

  const changeDeliveryAddressRequest = {
    parent: agentPath,
    intent: changeDeliveryAddressIntent,
  };

  // Create the size intent
  intentsClient
    .createIntent(changeDeliveryAddressRequest)
    .then(responses => {
      console.log('Created ChangeDeliveryAddress intent: ');
      logIntent(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  // Finally, create two intents, one to place the order, and the other one to
  // cancel it.

  const placeOrderInputContexts = [
    contextsClient.contextPath(projectId, '*' /* sessionId */, 'pizza_order'),
  ];

  // Collect all parameters from the "pizza_output".
  const placeOrderParameters = [
    {
      displayName: 'size',
      value: '#pizza_order.size',
      entityTypeDisplayName: '@size',
    },
    {
      displayName: 'topping',
      value: '#pizza_order.topping',
      entityTypeDisplayName: '@topping',
      isList: true,
    },
    {
      displayName: 'address',
      value: '#pizza_order.address',
      entityTypeDisplayName: '@sys.location',
    },
  ];

  const placeOrderResult = {
    action: 'pizza_confirm',
    parameters: placeOrderParameters,
    messages: [
      {
        text: {
          text: [
            'Sure! Getting a $size pizza with $topping and shipping to $address.',
          ],
        },
      },
    ],
    // Conclude the conversation by setting no output contexts and setting
    // resetContexts to true. This clears all existing contexts.
    outputContexts: [],
    resetContexts: true,
  };

  const placeOrderPhrases = [
    {type: 'EXAMPLE', parts: [{text: 'check'}]},
    {type: 'EXAMPLE', parts: [{text: 'confirm'}]},
    {type: 'EXAMPLE', parts: [{text: 'yes'}]},
    {type: 'EXAMPLE', parts: [{text: 'place order'}]},
  ];

  const placeOrderIntent = {
    displayName: 'PlaceOrder',
    webhookState: 'WEBHOOK_STATE_ENABLED',
    trainingPhrases: placeOrderPhrases,
    inputContexts: placeOrderInputContexts,
    mlEnabled: true,
    priority: 500000,
    result: placeOrderResult,
  };

  const placeOrderRequest = {
    parent: agentPath,
    intent: placeOrderIntent,
  };

  intentsClient
    .createIntent(placeOrderRequest)
    .then(responses => {
      console.log('Created PlaceOrder intent: ');
      logIntent(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  const cancelOrderInputContexts = [
    contextsClient.contextPath(projectId, '*' /* sessionId */, 'pizza_order'),
  ];

  const cancelOrderResult = {
    action: 'cancel-order',
    parameters: [],
    messages: [{text: {text: ['Your order is canceled.']}}],
    outputContexts: [],
    resetContexts: true,
  };

  const cancelOrderPhrases = [
    {type: 'EXAMPLE', parts: [{text: 'cancel'}]},
    {type: 'EXAMPLE', parts: [{text: 'no'}]},
    {type: 'EXAMPLE', parts: [{text: 'cancel order'}]},
    {type: 'EXAMPLE', parts: [{text: "I don't want it any more"}]},
  ];

  const cancelOrderIntent = {
    displayName: 'CancelOrder',
    webhookState: 'WEBHOOK_STATE_DISABLED',
    trainingPhrases: cancelOrderPhrases,
    inputContexts: cancelOrderInputContexts,
    mlEnabled: true,
    priority: 500000,
    result: cancelOrderResult,
  };

  const cancelOrderRequest = {
    parent: agentPath,
    intent: cancelOrderIntent,
  };

  intentsClient
    .createIntent(cancelOrderRequest)
    .then(responses => {
      console.log('Created Cancel Order intent: ');
      logIntent(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END dialogflow_create_intent]
}

function listIntents(projectId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath(projectId);

  const request = {
    parent: projectAgentPath,
  };

  // Send the request for listing intents.
  return intentsClient
    .listIntents(request)
    .then(responses => {
      return responses[0];
    })
    .catch(err => {
      console.error('Failed to list intents:', err);
    });
}

function showIntents(projectId) {
  return listIntents(projectId).then(intents => {
    return Promise.all(
      intents.map(intent => {
        return getIntent(intent);
      })
    );
  });
}

function getIntent(intent) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  const request = {
    // By default training phrases are not returned. If you want training
    // phrases included in the returned intent, uncomment the line below.
    //
    // intentView: 'INTENT_VIEW_FULL',
    name: intent.name,
  };

  // Send the request for retrieving the intent.
  return intentsClient
    .getIntent(request)
    .then(responses => {
      console.log('Found intent:');
      logIntent(responses[0]);
    })
    .catch(err => {
      console.error(`Failed to get intent ${intent.displayName}`, err);
    });
}

function clearIntents(projectId) {
  // Send the request for listing intents.
  return listIntents(projectId)
    .then(intents => {
      return Promise.all(
        intents.map(intent => {
          return deleteIntent(intent);
        })
      );
    })
    .catch(err => {
      console.error('Failed to list intents:', err);
    });
}

function deleteIntent(intent) {
  // [START dialogflow_delete_intent]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  const request = {name: intent.name};

  // Send the request for retrieving the intent.
  return intentsClient
    .deleteIntent(request)
    .then(() => {
      console.log(`Intent ${intent.displayName} deleted`);
    })
    .catch(err => {
      console.error(`Failed to delete intent ${intent.displayName}:`, err);
    });
  // [END dialogflow_delete_intent]
}

function updateIntent(projectId, intentId) {
  // [START dialogflow_update_intent]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  // The path to identify the intent to be deleted.
  const intentPath = intentsClient.intentPath(projectId, intentId);

  // UpdateIntent does full snapshot updates. For incremental update
  // fetch the intent first then modify it.
  const getIntentRequest = {
    name: intentPath,
    // It's important to have INTENT_VIEW_FULL here, otherwise the training
    // phrases are not returned and updating will remove all training phrases.
    intentView: 'INTENT_VIEW_FULL',
  };

  intentsClient
    .getIntent(getIntentRequest)
    .then(responses => {
      const intent = responses[0];
      // Add a new response message for telegram to the intent.
      intent.messages.push({
        image: {imageUri: 'http://www.example.com/logo.png'},
        platform: 'PLATFORM_TELEGRAM',
      });
      // And make sure telegram uses default messages as well.
      if (intent.defaultResponsePlatforms.indexOf('PLATFORM_TELEGRAM') < 0) {
        intent.defaultResponsePlatforms.push('PLATFORM_TELEGRAM');
      }

      // Now update the intent.
      const updateIntentRequest = {
        intent: intent,
      };

      return intentsClient.updateIntent(updateIntentRequest);
    })
    .then(responses => {
      console.log('Intent updated:');
      logIntent(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END dialogflow_update_intent]
}

function logIntent(intent) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();
  const intentsClient = new dialogflow.IntentsClient();

  console.log(`  ID:`, intentsClient.matchIntentFromIntentName(intent.name));
  console.log(`  Display Name: ${intent.displayName}`);
  const outputContexts = intent.outputContexts
    .map(context => {
      return contextsClient.matchContextFromContextName(context.name);
    })
    .join(', ');
  console.log(`  Priority: ${intent.priority}`);
  console.log(`  Output contexts: ${outputContexts}`);

  console.log(`  Action: ${intent.action}`);
  console.log(`  Parameters:`);
  intent.parameters.forEach(parameter => {
    console.log(
      `    ${parameter.displayName}: ${parameter.entityTypeDisplayName}`
    );
  });

  console.log(`  Responses:`);
  intent.messages.forEach(message => {
    const messageContent = JSON.stringify(message[message.message]);
    console.log(
      `    (${message.platform}) ${message.message}: ${messageContent}`
    );
  });

  const defaultResponsePlatforms = intent.defaultResponsePlatforms.join(', ');
  console.log(
    `  Platforms using default responses: ${defaultResponsePlatforms}`
  );
  console.log('');
}

// /////////////////////////////////////////////////////////////////////////////
// Operations for contexts
// /////////////////////////////////////////////////////////////////////////////

function createContext(projectId, sessionId) {
  // [START dialogflow_create_context]
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  const sessionPath = contextsClient.sessionPath(projectId, sessionId);

  // Create a pizza_order context with the same parameters as the Pizza intent
  // created by createIntent().
  const pizzaContextPath = contextsClient.contextPath(
    projectId,
    sessionId,
    'pizza_order'
  );
  const pizzaContextRequest = {
    parent: sessionPath,
    context: {
      name: pizzaContextPath,
      lifespanCount: 5,
      parameters: structjson.jsonToStructProto({
        size: 'large',
        topping: ['tuna', 'cheddar'],
        address: {
          'street-address': '1600 Amphitheatre Pkwy',
          city: 'Mountain View',
          'admin-area': 'California',
          'zip-code': '94043',
        },
      }),
    },
  };

  contextsClient.createContext(pizzaContextRequest).then(responses => {
    console.log('Created pizza_order context');
    logContext(responses[0]);
  });
  // [END dialogflow_create_context]
}

function listContexts(projectId, sessionId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  // The path to identify the agent that owns the contexts.
  const sessionPath = contextsClient.sessionPath(projectId, sessionId);

  const request = {
    parent: sessionPath,
  };

  // Send the request for listing contexts.
  return contextsClient
    .listContexts(request)
    .then(responses => {
      return responses[0];
    })
    .catch(err => {
      console.error('Failed to list contexts:', err);
    });
}

function showContexts(projectId, sessionId) {
  return listContexts(projectId, sessionId).then(contexts => {
    return Promise.all(
      contexts.map(context => {
        return getContext(context);
      })
    );
  });
}

function getContext(context) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  const request = {
    name: context.name,
  };

  const contextId = contextsClient.matchContextFromContextName(context.name);

  // Send the request for retrieving the context.
  return contextsClient
    .getContext(request)
    .then(responses => {
      console.log('Found context:');
      logContext(responses[0]);
    })
    .catch(err => {
      console.error(`Failed to get context ${contextId}:`, err);
    });
}

function clearContexts(projectId, sessionId) {
  return listContexts(projectId, sessionId).then(contexts => {
    return Promise.all(
      contexts.map(context => {
        return deleteContext(context);
      })
    );
  });
}

function deleteContext(context) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  const request = {
    name: context.name,
  };

  const contextId = contextsClient.matchContextFromContextName(context.name);

  // Send the request for retrieving the context.
  return contextsClient
    .deleteContext(request)
    .then(() => {
      console.log(`Context ${contextId} deleted`);
    })
    .catch(err => {
      console.error(`Failed to delete context ${contextId}`, err);
    });
}

function updateContext(projectId, sessionId, contextId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  // The path to identify the context to be deleted.
  const contextPath = contextsClient.contextPath(
    projectId,
    sessionId,
    contextId
  );

  // UpdateContext does full snapshot updates. For incremental update
  // fetch the context first then modify it.
  const getContextRequest = {
    name: contextPath,
  };

  contextsClient
    .getContext(getContextRequest)
    .then(responses => {
      const context = responses[0];
      // Add a new parameter value.

      const parametersJson = structjson.structProtoToJson(context.parameters);
      parametersJson['foo'] = 'bar';
      context.parameters = structjson.jsonToStructProto(parametersJson);

      // Now update the context.
      const updateContextRequest = {
        context: context,
      };

      return contextsClient.updateContext(updateContextRequest);
    })
    .then(responses => {
      console.log('Context updated:');
      logContext(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function logContext(context) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const contextsClient = new dialogflow.ContextsClient();

  console.log(
    `  Name:`,
    contextsClient.matchContextFromContextName(context.name)
  );
  console.log(`  Lifespan: ${context.lifespanCount}`);
  console.log(`  Parameters:`);
  const parameters = structjson.structProtoToJson(context.parameters);
  for (let k in parameters) {
    console.log(`    ${k}: ${parameters[k]}`);
  }
  console.log('');
}

// /////////////////////////////////////////////////////////////////////////////
// Operations for session entity type
// /////////////////////////////////////////////////////////////////////////////

function createSessionEntityType(projectId, sessionId) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();
  const contextsClient = new dialogflow.ContextsClient();

  const sessionPath = contextsClient.sessionPath(projectId, sessionId);

  // Create a session entity type that overrides the @size entity type.
  //
  // NOTE: Unlike other resources, the resource name of the session entity type
  // is the display name of the entity type, not the ID.
  const sizeSessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    'size'
  );
  const sizeSessionEntityTypeRequest = {
    parent: sessionPath,
    sessionEntityType: {
      name: sizeSessionEntityTypePath,
      entityOverrideMode: 'ENTITY_OVERRIDE_MODE_OVERRIDE',
      entities: [
        {value: 'short', synonyms: ['short', 'small', 'petit']},
        {value: 'tall', synonyms: ['tall', 'medium']},
        {value: 'grande', synonyms: ['grande', 'large', 'big']},
      ],
    },
  };

  sessionEntityTypesClient
    .createSessionEntityType(sizeSessionEntityTypeRequest)
    .then(responses => {
      console.log('Overrode @size entity type:');
      logSessionEntityType(responses[0]);
    });

  // Create a session entity type that extends the @topping entity type.
  const toppingSessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    'topping'
  );
  const toppingSessionEntityTypeRequest = {
    parent: sessionPath,
    sessionEntityType: {
      name: toppingSessionEntityTypePath,
      entityOverrideMode: 'ENTITY_OVERRIDE_MODE_SUPPLEMENT',
      entities: [
        {value: 'feta', synonyms: ['feta']},
        {value: 'parmesan', synonyms: ['parmesan']},
      ],
    },
  };

  sessionEntityTypesClient
    .createSessionEntityType(toppingSessionEntityTypeRequest)
    .then(responses => {
      console.log('Extended @topping entity type:');
      logSessionEntityType(responses[0]);
    });
}

function showSessionEntityTypes(projectId, sessionId) {
  // There is no listSessionEntityTypes API, use listEntityTypes to get possible
  // entity type names.
  listEntityTypes(projectId).then(entityTypes => {
    return Promise.all(
      entityTypes.map(entityType => {
        return getSessionEntityType(
          projectId,
          sessionId,
          entityType.displayName
        );
      })
    );
  });
}

function getSessionEntityType(projectId, sessionId, entityTypeName) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  // The path to identify the sessionEntityType to be retrieved.
  const sessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    entityTypeName
  );

  const request = {
    name: sessionEntityTypePath,
  };

  // Send the request for retrieving the sessionEntityType.
  return sessionEntityTypesClient
    .getSessionEntityType(request)
    .then(responses => {
      console.log('Found session entity type:');
      logSessionEntityType(responses[0]);
    })
    .catch(err => {
      if (err.code === grpc.status.NOT_FOUND) {
        console.log(`Session entity type ${entityTypeName} is not found.`);
      } else {
        console.error(
          `Failed to get session entity type ${entityTypeName}:`,
          err
        );
      }
    });
}

function clearSessionEntityTypes(projectId, sessionId) {
  // There is no listSessionEntityTypes API, use listEntityTypes to get possible
  // entity type names.
  listEntityTypes(projectId).then(entityTypes => {
    return Promise.all(
      entityTypes.map(entityType => {
        return deleteSessionEntityType(
          projectId,
          sessionId,
          entityType.displayName
        );
      })
    );
  });
}

function deleteSessionEntityType(projectId, sessionId, entityTypeName) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  // The path to identify the sessionEntityType to be deleted.
  const sessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    entityTypeName
  );

  const request = {
    name: sessionEntityTypePath,
  };

  // Send the request for retrieving the sessionEntityType.
  return sessionEntityTypesClient
    .deleteSessionEntityType(request)
    .then(() => {
      console.log(`Session entity type ${entityTypeName} deleted`);
    })
    .catch(err => {
      if (err.code === grpc.status.NOT_FOUND) {
        console.log(
          `Cannot delete session entity type ${entityTypeName} because ` +
            `it is not found.`
        );
      } else {
        console.error(`Failed to delete ${entityTypeName}:`, err);
      }
    });
}

function updateSessionEntityType(projectId, sessionId, entityTypeName) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  // The path to identify the sessionEntityType to be deleted.
  const sessionEntityTypePath = sessionEntityTypesClient.sessionEntityTypePath(
    projectId,
    sessionId,
    entityTypeName
  );

  // Update the session entity type.
  //
  // Note: this overrides the existing entities of the session entity type being
  // updated, even if entityOverrideMode is set to
  // ENTITY_OVERRIDE_MODE_SUPPLEMENT.
  const request = {
    sessionEntityType: {
      name: sessionEntityTypePath,
      entityOverrideMode: 'ENTITY_OVERRIDE_MODE_SUPPLEMENT',
      entities: [
        {value: 'foo', synonyms: ['foo']},
        {value: 'bar', synonyms: ['bar']},
      ],
    },
  };
  sessionEntityTypesClient
    .updateSessionEntityType(request)
    .then(responses => {
      console.log('Session entity type updated:');
      logSessionEntityType(responses[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function logSessionEntityType(sessionEntityType) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  console.log(
    `  Name:`,
    sessionEntityTypesClient.matchEntityTypeFromSessionEntityTypeName(
      sessionEntityType.name
    )
  );
  console.log(
    `  Entity override mode: ${sessionEntityType.entityOverrideMode}`
  );
  console.log(`  Entities:`);
  sessionEntityType.entities.forEach(entity => {
    console.log(`    ${entity.value}: ${entity.synonyms.join(', ')}`);
  });
  console.log('');
}

// /////////////////////////////////////////////////////////////////////////////
// Operations for restoring agents
// /////////////////////////////////////////////////////////////////////////////

function restoreRoomAgent(projectId) {
  const fs = require('fs');
  fs.readFile('./resources/RoomReservation.zip', function(err, data) {
    if (err) {
      console.error(err);
    }
    restoreAgent(projectId, data);
  });
}

function restoreAgent(projectId, data) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates agent client
  const agentsClient = new dialogflow.AgentsClient();

  const agentPath = agentsClient.projectPath(projectId);

  // construct restore agent request
  const request = {
    agentContent: data,
    parent: agentPath,
  };

  agentsClient.restoreAgent(request).catch(err => {
    console.error(err);
  });
}

// /////////////////////////////////////////////////////////////////////////////
// Command line interface.
// /////////////////////////////////////////////////////////////////////////////

function setupAgent(projectId) {
  clearAgent(projectId)
    .then(() => createEntityTypes(projectId))
    .then(() => createIntents(projectId));
}

function clearAgent(projectId) {
  return (
    clearIntents(projectId)
      // Give api.ai some time to clean up the references to existing entity
      // types.
      .then(() => {
        console.log('Waiting 10 seconds before deleting entity types.');
        return setTimeoutPromise(10000);
      })
      .then(() => clearEntityTypes(projectId))
  );
}

function showAgent(projectId) {
  showEntityTypes(projectId).then(() => showIntents(projectId));
}

function setupSession(projectId, sessionId) {
  createContext(projectId, sessionId);
  createSessionEntityType(projectId, sessionId);
}

function showSession(projectId, sessionId) {
  showContexts(projectId, sessionId).then(() =>
    showSessionEntityTypes(projectId, sessionId)
  );
}

function clearSession(projectId, sessionId) {
  clearContexts(projectId, sessionId).then(() =>
    clearSessionEntityTypes(projectId, sessionId)
  );
}

function setTimeoutPromise(delayMillis) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), delayMillis);
  });
}

function verifyCommand(callback, force, projectId, arg2, arg3) {
  if (force) {
    callback(projectId, arg2, arg3);
    return;
  }
  //add a special warning for these functions because they delete the agent
  const deletionWarningFunctions = [setupAgent, clearAgent];
  // Prompt the user for confirmation
  // This action may change their agent's behavior
  let userConfirmationPrompt =
    '\nWarning! This operation will alter the Dialogflow agent with the ' +
    `project ID '${projectId}' for ALL users and developers.`;
  if (deletionWarningFunctions.includes(callback)) {
    userConfirmationPrompt +=
      '\nTHIS WILL DELETE ALL EXISTING INTENTS AND ENTITIES';
  }
  userConfirmationPrompt += `\nAre you sure you want to continue?`;

  prompt.start();
  prompt.get(
    {
      properties: {
        confirm: {
          pattern: /^(yes|no|y|n)$/gi,
          description: userConfirmationPrompt,
          required: true,
          default: 'yes/no',
        },
      },
    },
    function(err, result) {
      var input = result.confirm.toLowerCase();
      // If the user didn't say yes/y, abort
      if (input !== 'y' && input !== 'yes') {
        console.log('Operation aborted.');
        return;
      }
      // If the user says yes/y call intended function
      callback(projectId, arg2, arg3);
    }
  );
}

const cli = require(`yargs`)
  .demand(1)
  .options({
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the ' +
        'GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
  })
  .demandOption(
    'projectId',
    "Please provide your Dialogflow agent's project ID with the -p flag or through the GOOGLE_CLOUD_PROJECT env var"
  )
  .boolean('force')
  .alias('force', ['f'])
  .describe('force', 'force operation without a prompt')
  .command(
    `setup-agent`,
    `Create entity types and intent for ordering pizzas.`,
    {},
    opts => verifyCommand(setupAgent, opts.force, opts.projectId)
  )
  .command(
    `clear-agent`,
    `Delete all intents and entity types from an agent.`,
    {},
    opts => verifyCommand(clearAgent, opts.force, opts.projectId)
  )
  .command(
    `show-agent`,
    `Show all intents and entity types from an agent.`,
    {},
    opts => showAgent(opts.projectId)
  )
  .command(
    `update-entity-type <entityTypeId>`,
    `Update an entity type.`,
    {},
    opts =>
      verifyCommand(
        updateEntityType,
        opts.force,
        opts.projectId,
        opts.entityTypeId
      )
  )
  .command(`update-intent <intentId>`, `Update an intent.`, {}, opts =>
    verifyCommand(updateIntent, opts.force, opts.projectId, opts.intentId)
  )
  .command(
    `setup-session <sessionId>`,
    `Create contexts and session entity types for a session. It assumes ` +
      `the agents is set up by setup-agent command.`,
    {},
    opts => setupSession(opts.projectId, opts.sessionId)
  )
  .command(
    `show-session <sessionId>`,
    `Show all contexts and session entity types in a session.`,
    {},
    opts => showSession(opts.projectId, opts.sessionId)
  )
  .command(
    `clear-session <sessionId>`,
    `Delete all contexts and session entity types.`,
    {},
    opts =>
      verifyCommand(clearSession, opts.force, opts.projectId, opts.sessionId)
  )
  .command(
    `update-context <sessionId> <contextId>`,
    `Update a context.`,
    {},
    opts =>
      verifyCommand(
        updateContext,
        opts.force,
        opts.projectId,
        opts.sessionId,
        opts.contextId
      )
  )
  .command(
    `update-session-entity-type <sessionId> <entityTypeName>`,
    `Update a session entity type.`,
    {},
    opts =>
      verifyCommand(
        updateSessionEntityType,
        opts.force,
        opts.projectId,
        opts.sessionId,
        opts.entityTypeName
      )
  )
  .command(
    `restore-room-agent`,
    `Restore the room booking Dialogflow agent`,
    {},
    opts => verifyCommand(restoreRoomAgent, opts.force, opts.projectId)
  )
  .example(`node $0 setup-agent`)
  .example(`node $0 show-agent`)
  .example(`node $0 clear-agent`)
  .example(`node $0 update-entity-type "my-entity-type-id"`)
  .example(`node $0 update-intent "my-intent-id"`)
  .example(`node $0 setup-session "my-session-id"`)
  .example(`node $0 show-session "my-session-id"`)
  .example(`node $0 clear-session "my-session-id"`)
  .example(`node $0 update-context "my-session-id" "my-context-id"`)
  .example(
    `node $0 update-session-entity-type "my-session-id" ` +
      `"my-entity-type-name"`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/conversation/docs`
  )
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
