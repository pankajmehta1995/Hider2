/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var conversations =  sequelize.define('conversations', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    conversation_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conversation_type: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    receiver_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    sender_view: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    receiver_view: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    sender_archive: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    receiver_archive: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    file_upload: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_upload_thumb: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_type: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'conversations',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
    classMethods: {
      associate: function(models) {
      // associations can be defined here
      conversations.belongsTo(models.user_conversation_key, {
        as: 'receiverKey',
        foreignKey: 'sender_id',
        targetKey:'receiver_id',
      });
      conversations.belongsTo(models.users, {
        as: 'senderUser',
        foreignKey: 'sender_id',
        targetKey:'id',
      });
      }
    }
  });
  
  return conversations;
};
