'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old address column (if exists)
    await queryInterface.removeColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'address',
    );

    // Add new columns
    await queryInterface.addColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'street',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'city',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'state',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'zip',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert new fields and restore address
    await queryInterface.addColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'address',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );

    await queryInterface.removeColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'street',
    );
    await queryInterface.removeColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'city',
    );
    await queryInterface.removeColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'state',
    );
    await queryInterface.removeColumn(
      { tableName: 'KeyHolders', schema: 'dbo' },
      'zip',
    );
  },
};
