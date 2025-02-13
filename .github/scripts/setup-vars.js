module.exports = ({core, process}) => {
  const setup = JSON.parse(process.env.CI_SETUP);
  const env = {
    GOOGLE_SAMPLES_PROJECT: setup['project-id'],
    PROJECT_ID: setup['project-id'],
    ...setup.env,
  };
  for (const key in env) {
    console.log(`${key}: ${env[key]}`);
    core.exportVariable(key, env[key]);
  }
  return {
    env: env,
    secrets: Object.keys(setup.secrets)
      .map(key => `${key}:${setup.secrets[key]}`)
      .join('\n'),
  };
};
