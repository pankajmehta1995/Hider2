/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var faqs = sequelize.define('faqs', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    faq_topic_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    faq_question: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    faq_answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    faq_status: {
      type: DataTypes.INTEGER(11),
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
		tableName: 'faqs',
		freezeTableName: true,
		underscored: true,
		timestamps: false,
		classMethods: {
		  associate: function(models) {
			// associations can be defined here
		   faqs.belongsTo(models.faqs_topics, {
			  foreignKey: 'faq_topic_id'
			});
		  }
		}
	});
   return faqs;
};
