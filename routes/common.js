var express = require('express');
var router = express.Router();

var models = require('../models'); 
var FaqsTopics = models.faqs_topics;

router.getData = function(callback){
  //body that work on data or what ever the logic including a callback
	return new Promise(function (resolve, reject){
		FaqsTopics.findAll({
			where: {status: { $ne: 4 } },
		}).then( function ( resultset ){
			resolve(resultset);
		}).catch(function( e ){
			reject(e);
		});
		
		//~ FaqsTopics.findAll({}, function(err, resultset) {
    
			//~ if (err)
				//~ return done(err);
				
			//~ if (resultset) {
				//~ return done(null, resultset); // user found, return that user
			//~ } 
		//~ });
		
  });
}

module.exports = router;
