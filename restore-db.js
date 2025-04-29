const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Backups directory
const backupsDir = path.join(__dirname, 'backups');
const targetDbPath = path.join(__dirname, '.data/university.db');

// Check if backups directory exists
if (!fs.existsSync(backupsDir)) {
  console.error('No backups directory found. Please run a backup first.');
  rl.close();
  process.exit(1);
}

// List all backups
const backups = fs.readdirSync(backupsDir)
  .filter(file => file.startsWith('university-'))
  .sort()
  .reverse();

if (backups.length === 0) {
  console.error('No backups found. Please run a backup first.');
  rl.close();
  process.exit(1);
}

console.log('Available backups:');
backups.forEach((backup, index) => {
  const stats = fs.statSync(path.join(backupsDir, backup));
  const size = (stats.size / 1024).toFixed(2) + ' KB';
  console.log(`${index + 1}. ${backup} (${size})`);
});

// Ask user which backup to restore
rl.question('\nEnter the number of the backup to restore: ', (answer) => {
  const backupIndex = parseInt(answer) - 1;
  
  if (isNaN(backupIndex) || backupIndex < 0 || backupIndex >= backups.length) {
    console.error('Invalid selection. Please run the script again and select a valid backup.');
    rl.close();
    return;
  }
  
  const selectedBackup = backups[backupIndex];
  const backupPath = path.join(backupsDir, selectedBackup);
  
  // Confirm restoration
  rl.question(`\nAre you sure you want to restore from ${selectedBackup}? This will overwrite your current database. (y/n): `, (confirm) => {
    if (confirm.toLowerCase() !== 'y') {
      console.log('Restoration cancelled.');
      rl.close();
      return;
    }
    
    // Create a backup of the current database before restoring
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentBackupPath = path.join(backupsDir, `pre-restore-${timestamp}.db`);
      
      if (fs.existsSync(targetDbPath)) {
        fs.copyFileSync(targetDbPath, currentBackupPath);
        console.log(`Created backup of current database at ${currentBackupPath}`);
      }
      
      // Copy the selected backup to the target location
      fs.copyFileSync(backupPath, targetDbPath);
      console.log(`\nDatabase successfully restored from ${selectedBackup}`);
      console.log('Please restart your application for changes to take effect.');
    } catch (err) {
      console.error('Error restoring database:', err.message);
    }
    
    rl.close();
  });
});
