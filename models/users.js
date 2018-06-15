/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profile_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profile_image_thumb: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    facebook_id: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(55),
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
     status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    deact_status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    },
     otp_verified: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
     email_verified: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    login_status: {
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
    },
  
    cover_image: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },{
    tableName: 'users',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
    
    classMethods: {
		  associate: function(models) {
			// associations can be defined here
		   users.belongsTo(models.roles, {
				foreignKey: 'role_id'
			});
			users.hasOne(models.blockUsers, {
			   as: 'blockUsers',	
			   foreignKey: 'block_user_id'
			});
      users.hasMany(models.blockUsers, {  
         as: 'blocked_me',
         foreignKey: 'user_id',
         targetKey:'id',
      });
			users.hasMany(models.blockUsers, {	
			   as: 'blockbyme',
			   foreignKey: 'user_id',
			   targetKey:'id',
			});
		  }
		}
  });
  
   return users;
};
