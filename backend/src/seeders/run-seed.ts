import { AppDataSource } from '../config/data-source';
import { seedDatabase } from './seed';

async function runSeed() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    console.log('Starting database seeding...');
    await seedDatabase(AppDataSource);
    console.log('✓ Seeding completed successfully');

    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runSeed();

