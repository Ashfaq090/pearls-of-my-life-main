import { Module } from '@nestjs/common';
// Disabled Sequelize provider - using TypeORM instead
// import { databaseProvider } from './database.provider';

@Module({
  // providers: [...databaseProvider],
  // exports: [...databaseProvider],
})
export class DataBaseModule {}
