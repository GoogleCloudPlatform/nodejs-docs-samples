const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');

const router = require('./routes');

const app = express();
const port = 8000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.use('/static', express.static('static'));
app.use('/', router);

app.listen(port, () => {
  console.log(`Recaptcha demosite app listening on port ${port}`);
});
