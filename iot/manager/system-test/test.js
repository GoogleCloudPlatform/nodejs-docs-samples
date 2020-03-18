const path = require('path');

function test() {
   const current =  `${path.join(__dirname, '..')}/../mqtt_example`;
   console.log(current);
}

test();