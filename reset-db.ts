import { execSync } from 'child_process';

console.log('🔄 Starting database reset...\n');

try {
  // Reset database and run migrations
  console.log('📦 Resetting database and applying migrations...');
  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('\n✅ Database reset complete!');
  console.log('✅ All migrations applied!');
  console.log('✅ Seed data created!\n');

} catch (error) {
  console.error('\n❌ Error resetting database:', error);
  process.exit(1);
}
