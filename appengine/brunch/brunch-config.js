module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': /^app/
      }
    },
    stylesheets: {
      joinTo: 'app.css'
    },
  },
  plugins: {
    babel: {
      presets: ['es2015']
    }
  },
  server: {
    run: true,
    port: 8080
  },
  overrides: {
    production: {
      optimize: true,
      sourceMaps: false,
      plugins: {
        autoReload: {
          enabled: false
        }
      }
    }
  }
};
