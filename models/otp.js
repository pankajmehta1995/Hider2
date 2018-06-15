module.exports = function(sequelize, DataTypes) {
  var otp = sequelize.define('otp', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      
    },
    
    otp: {
      type: DataTypes.INTEGER(11),
      
    },

    is_expired: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0
    },

     status: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0
    },

    created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modified: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  },  
   {
    tableName: 'otp',
    freezeTableName: true,
    timestamps: false,
    
  });
  return otp;
};