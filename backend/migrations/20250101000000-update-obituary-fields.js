module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('obituary_info', 'birth_city', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'birth_state', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'biological_mother_first', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn(
      'obituary_info',
      'biological_mother_middle',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    );
    await queryInterface.addColumn('obituary_info', 'biological_mother_last', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'biological_father_first', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn(
      'obituary_info',
      'biological_father_middle',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    );
    await queryInterface.addColumn('obituary_info', 'biological_father_last', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'stepmother_first', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'stepmother_middle', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'stepmother_last', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'stepfather_first', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'stepfather_middle', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('obituary_info', 'stepfather_last', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('obituary_info', 'birth_city');
    await queryInterface.removeColumn('obituary_info', 'birth_state');
    await queryInterface.removeColumn(
      'obituary_info',
      'biological_mother_first',
    );
    await queryInterface.removeColumn(
      'obituary_info',
      'biological_mother_middle',
    );
    await queryInterface.removeColumn(
      'obituary_info',
      'biological_mother_last',
    );
    await queryInterface.removeColumn(
      'obituary_info',
      'biological_father_first',
    );
    await queryInterface.removeColumn(
      'obituary_info',
      'biological_father_middle',
    );
    await queryInterface.removeColumn(
      'obituary_info',
      'biological_father_last',
    );
    await queryInterface.removeColumn('obituary_info', 'stepmother_first');
    await queryInterface.removeColumn('obituary_info', 'stepmother_middle');
    await queryInterface.removeColumn('obituary_info', 'stepmother_last');
    await queryInterface.removeColumn('obituary_info', 'stepfather_first');
    await queryInterface.removeColumn('obituary_info', 'stepfather_middle');
    await queryInterface.removeColumn('obituary_info', 'stepfather_last');
  },
};
