/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var investment_plans = sequelize.define('investment_plans', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    investment_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    investment_amount_usd: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    investment_amount_eur: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    investment_amount_btc: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'investment_plans',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
  });
  return investment_plans;
};
