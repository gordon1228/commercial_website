// Database setup script
// Run this with: node scripts/setup-database.js

const { exec } = require('child_process');
const path = require('path');

console.log('Setting up database schema...');

// Change to the project directory
process.chdir(path.join(__dirname, '..'));

// Run Prisma commands sequentially
const commands = [
  'npx prisma generate',
  'npx prisma db push'
];

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });

    // Set a longer timeout for database operations
    child.timeout = 300000; // 5 minutes
  });
}

async function setupDatabase() {
  try {
    for (const command of commands) {
      await runCommand(command);
      console.log(`✓ ${command} completed successfully\n`);
    }
    
    console.log('✓ Database setup completed successfully!');
    console.log('You can now use the contact info management feature.');
    
  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your database is running and accessible');
    console.log('3. Try running the commands manually:');
    commands.forEach(cmd => console.log(`   ${cmd}`));
  }
}

setupDatabase();