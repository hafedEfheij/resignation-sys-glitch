const fs = require('fs');
const path = require('path');

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
  console.log('Created backups directory');
}

// Source database path
const sourceDbPath = path.join(__dirname, '.data/university.db');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDbPath = path.join(backupsDir, `university-${timestamp}.db`);

// Check if source database exists
if (!fs.existsSync(sourceDbPath)) {
  console.error(`Source database not found at ${sourceDbPath}`);
  process.exit(1);
}

// Copy the database file
try {
  fs.copyFileSync(sourceDbPath, backupDbPath);
  console.log(`Database backed up to ${backupDbPath}`);
} catch (err) {
  console.error('Error backing up database:', err.message);
  process.exit(1);
}

// List all backups
console.log('\nAvailable backups:');
const backups = fs.readdirSync(backupsDir)
  .filter(file => file.startsWith('university-'))
  .sort()
  .reverse();

backups.forEach((backup, index) => {
  const stats = fs.statSync(path.join(backupsDir, backup));
  const size = (stats.size / 1024).toFixed(2) + ' KB';
  console.log(`${index + 1}. ${backup} (${size})`);
});

// Keep only the last 5 backups to save space
if (backups.length > 5) {
  console.log('\nRemoving old backups to save space...');
  backups.slice(5).forEach(oldBackup => {
    const oldBackupPath = path.join(backupsDir, oldBackup);
    fs.unlinkSync(oldBackupPath);
    console.log(`Removed old backup: ${oldBackup}`);
  });
}

console.log('\nBackup completed successfully!');
