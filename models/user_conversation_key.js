/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var user_conversation_key =sequelize.define('user_conversation_key', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    receiver_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    receiver_conversation_key: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'user_conversation_key',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
    
  });

  return user_conversation_key;
};
