module.exports = function(sequelize, DataTypes) {
  var otp = sequelize.define('contactus_subject', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    subject: {
       type: DataTypes.STRING(255),
       allowNull: false 
    },
    
     status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
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
    tableName: 'contactus_subject',
    freezeTableName: true,
    timestamps: false,
    
  });
  return otp;
};