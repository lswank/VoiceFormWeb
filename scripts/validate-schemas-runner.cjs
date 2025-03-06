// This is a CommonJS script that runs the TypeScript validation in a separate process
const { spawnSync } = require('child_process');
const path = require('path');

console.log('Running schema validation...');

// Run TypeScript file with ts-node in a separate process with CommonJS settings
const result = spawnSync('node', [
  // Force CommonJS mode for ts-node
  '--require', 'ts-node/register',
  // Register tsconfig-paths to handle path mappings
  '--require', 'tsconfig-paths/register',
  // Disable ESM for this script
  '--no-warnings',
  // Run the validate-schemas.ts file
  path.join(__dirname, 'validate-schemas.ts')
], {
  env: {
    ...process.env,
    // Force CommonJS mode
    TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS","esModuleInterop":true}'
  },
  stdio: 'inherit' // Show output in the console
});

// Return the same exit code
process.exit(result.status); 