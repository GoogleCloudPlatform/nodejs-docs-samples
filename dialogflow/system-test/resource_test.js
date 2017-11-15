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

const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = 'node resource.js';
const sessionId = require('uuid/v1')();

test.before.serial('Remove all existing resources', async () => {
  await tools.runAsync(`${cmd} clear-agent -f`);
});

test.serial('setup-agent should create entity types and intents.', async t => {
  const output = await tools.runAsync(`${cmd} setup-agent -f`);
  t.true(output.includes('Created size entity type'));
  t.true(output.includes('Created topping entity type'));
  t.true(output.includes('Created Pizza intent'));
  t.true(output.includes('Created ChangeDeliveryAddress intent'));
  t.true(output.includes('Created PlaceOrder intent'));
  t.true(output.includes('Created Cancel Order intent'));
});

test.serial(
  'show-agent should show all created intents and entity types',
  async t => {
    const output = await tools.runAsync(`${cmd} show-agent -f`);
    t.true(output.indexOf('  Display Name: Pizza') >= 0);
    t.true(output.indexOf('  Display Name: ChangeDeliveryAddress') >= 0);
    t.true(output.indexOf('  Display Name: PlaceOrder') >= 0);
    t.true(output.indexOf('  Display Name: CancelOrder') >= 0);
    t.true(output.indexOf('  Display Name: size') >= 0);
    t.true(output.indexOf('  Display Name: topping') >= 0);
  }
);

// /////////////////////////////////////////////////////////////////////////////
// Context and session entity type operations.
// /////////////////////////////////////////////////////////////////////////////

test.serial(
  'setup-session should create contexts and session entity types',
  async t => {
    const output = await tools.runAsync(`${cmd} setup-session ${sessionId} -f`);
    t.true(output.includes('Created pizza_order context'));
    t.true(output.includes('Overrode @size entity type'));
    t.true(output.includes('Extended @topping entity type'));
  }
);

test.serial(
  'show-session should retrieve the created contexts and session entity types',
  async t => {
    const output = await tools.runAsync(`${cmd} show-session ${sessionId} -f`);
    t.true(output.includes('Found context:\n  Name: pizza_order'));
  }
);

test.serial(
  'update-session-entity-type should update session entity type @size',
  async t => {
    const output = await tools.runAsync(
      `${cmd} update-session-entity-type ${sessionId} size -f`
    );
    t.true(output.includes('Session entity'));
  }
);

test.serial('update-context should update context "pizza_order"', async t => {
  const output = await tools.runAsync(
    `${cmd} update-context ${sessionId} pizza_order -f`
  );
  t.true(output.includes('Context updated'));
  t.true(output.includes('foo: bar'));
});

test.serial(
  'clear-session should delete contexts session entity types',
  async t => {
    const output = await tools.runAsync(`${cmd} clear-session ${sessionId} -f`);
    t.true(output.includes('Context pizza_order deleted'));
  }
);

// /////////////////////////////////////////////////////////////////////////////
// Other intent and entity type operations.
// /////////////////////////////////////////////////////////////////////////////

test.serial('update-entity-type should update entity type', async t => {
  const showAgentOutput = await tools.runAsync(`${cmd} show-agent -f`);
  const toppingEntityId = showAgentOutput.match(
    /Found entity type:\n {2}ID: (.*)\n {2}Display Name: topping/
  )[1];
  const output = await tools.runAsync(
    `${cmd} update-entity-type ${toppingEntityId} -f`
  );
  t.truthy(output.includes('Updated entity type'));
  t.truthy(output.includes('foo'));
});

test.serial('update-intent should update intent "pizza"', async t => {
  const showAgentOutput = await tools.runAsync(`${cmd} show-agent -f`);
  const pizzaIntentId = showAgentOutput.match(
    /Found intent:\n {2}ID: (.*)\n {2}Display Name: Pizza/
  )[1];
  const output = await tools.runAsync(
    `${cmd} update-intent ${pizzaIntentId} -f`
  );
  t.truthy(output.includes('Intent updated'));
});

test.serial(
  'clear-agent should delete all intents and entity types',
  async t => {
    const output = await tools.runAsync(`${cmd} clear-agent -f`);
    t.true(output.includes('Intent Pizza deleted'));
    t.true(output.includes('Intent ChangeDeliveryAddress deleted'));
    t.true(output.includes('Intent PlaceOrder deleted'));
    t.true(output.includes('Intent CancelOrder deleted'));
  }
);

test.after.serial('Setting up agent for other tests', async () => {
  await tools.runAsync(`${cmd} restore-room-agent -f`);
});
