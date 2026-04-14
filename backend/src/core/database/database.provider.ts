// import { join } from 'path';
// import { Sequelize } from 'sequelize-typescript';
// import * as connection from './database.config';
// import { ConfigService } from '@nestjs/config';
// import Users from 'src/modules/users/entities/users.entity';
// // import Users from "src/modules/users/entities/users.entity";

// export const databaseProvider = [
//   {
//     //  provide: 'SEQUELIZE',
//     // useFactory: async (configService: ConfigService) => {
//     //     const sequelize = new Sequelize({
//     //         ...((connection[configService.get('ENVIRONMENT')] as any) || {}),
//     //         models: [join(__dirname,'../../','/modules/**/*.entity.js')]
//     //     });
//     //     return sequelize;
//     // },
//     inject: [ConfigService],
//     provide: 'SEQUELIZE',
//     useFactory: async () => {
//       const sequelize = new Sequelize({
//         dialect: 'mssql',
//         host: 'SAADSQLEXPRESS',
//         port: 1433,
//         username: 'sa',
//         password: 'bnmbnm',
//         database: 'PearlsOfLife',
//       });
//       sequelize.addModels([Users]);
//       await sequelize.sync();
//       return sequelize;
//     },
//   },
// ];

// DISABLED - Using TypeORM instead of Sequelize
// All imports commented out as they're no longer needed
// import { Sequelize } from 'sequelize-typescript';
// import { ConfigService } from '@nestjs/config';

// DISABLED - Using TypeORM instead of Sequelize
// This provider is kept for reference but not used
export const databaseProvider = [
  // {
  //   provide: 'SEQUELIZE',
  //   useFactory: async (configService: ConfigService) => {
  //     // Sequelize connection code disabled - using TypeORM
  //     return null;
  //   },
  //   inject: [ConfigService],
  // },
];
