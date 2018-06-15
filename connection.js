//Including dependency
var Sequelize  = require('sequelize');
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/./config/config.json')[env];
 
//Setting up the config
var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    define: {
        timestamps: false
    }
});
//Checking connection status
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message);
  });
  
//Models
var models = require("./models");
 
//Sync Database
/*models.sequelize.sync(false).then(function() {
 
    console.log('Nice! Database looks fine')
 
}).catch(function(err) {
 
    console.log(err, "Something went wrong with the Database Update!")
 
});*/  
