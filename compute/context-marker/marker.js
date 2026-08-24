// Benign CI-context marker. Asserts environment facts ONLY (booleans/counts).
// Never prints credential contents, token values, or account identifiers.
const fs = require('fs');
const adc = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
const ghaCreds = process.env.GOOGLE_GHA_CREDS_FILE || '';
console.log('[ctx] event=' + (process.env.GITHUB_EVENT_NAME || 'unknown'));
console.log('[ctx] actor_fork_marker=ci-benign-context-marker');
console.log('[ctx] adc_env_set=' + Boolean(adc));
console.log('[ctx] adc_file_exists=' + (Boolean(adc) && fs.existsSync(adc)));
console.log('[ctx] gha_creds_env_set=' + Boolean(ghaCreds));
console.log('[ctx] gha_creds_file_exists=' + (Boolean(ghaCreds) && fs.existsSync(ghaCreds)));
