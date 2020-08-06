const {app} = require('./app');
const pkg = require('./package.json');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
  console.log(`${pkg.name} listening on port ${PORT}`)
);