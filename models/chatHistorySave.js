module.exports = function(sequalize, DataTypes){
	var chatHistorySave = sequalize.define('chatHistorySave',{
		id: { 
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		conversation_id: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		chat_save_time: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		created: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequalize.literal('CURRENT_TIMESTAMP')
		},
		modified: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequalize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'chatHistorySave',
		freezeTableName: true,
		underscored: true,
		timestamps: false,
	});
	return chatHistorySave;
};