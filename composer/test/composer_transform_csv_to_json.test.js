const {assert} = require('chai');
const tutorial = require('../composer_transform_csv_to_json.js');

const lineTest = 'tampa, 106, january, null, null, 08-17-2019';

describe('composer_transform_csv_to_json', () => {
  it('should separate out a line and turn into a json string', () => {
    const output = tutorial(lineTest);
    assert.match(
      output,
      new RegExp(
        '{"location":"tampa","average_temperature":" 106","month":" january","inches_of_rain":" null","is_current":" null","latest_measurement":" 08-17-2019"}'
      )
    );
  });
});
