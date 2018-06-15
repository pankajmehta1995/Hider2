/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var feedbacks =sequelize.define('feedbacks', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    user_feedback_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    feedback: {
      type: DataTypes.TEXT,
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
    }
  }, 

  {
    tableName: 'feedbacks',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
    
    
    classMethods: {
      associate: function(models) {
      // associations can be defined here
      feedbacks.belongsTo(models.users, {
        as: 'users',
        foreignKey: 'user_id'
      });
      feedbacks.belongsTo(models.users, {
        as: 'feedbackUsers',
        foreignKey: 'user_feedback_id'
      });
      }
    }

  });
  
  return feedbacks;
};
