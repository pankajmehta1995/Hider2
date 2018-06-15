module.exports = function(sequelize, DataTypes) {
  var contactus = sequelize.define('contactus', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    phone: {
      type: DataTypes.STRING(11),
      allowNull: true
    },
     subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'contactus',
    freezeTableName: true,
    timestamps: false,
    
  });
  return contactus;
};