/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var roles = sequelize.define('roles', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'roles',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
  },{
	  classMethods: {
		  associate: function(models) {
			// associations can be defined here
		   roles.belongsTo(models.users, {
			  foreignKey: 'role_id'
			});
		  }
		}
	});
	 return roles;
};
