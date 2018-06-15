var express = require('express');
var router = express.Router();
var moment       = require('moment');
var models       = require('../models'); 

var Users 		  = models.users;
var Conversations = models.conversations;
var contactus = models.contactus;
var feedbacks     = models.feedbacks;
var Roles 		  = models.roles;
var chatHistorySave = models.chatHistorySave;
var blockUsers    = models.blockUsers;
var block         = models.blockUsers;
var nodemailer    = require('nodemailer');
var schedule = require('node-schedule');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('crons.ejs');
});
 

router.delete_conversation    =function(req,res){  
  chatHistorySave.findAll({}).then( function ( resultset ){
   
  if(resultset.length > 0){
    for(var i=0; i<resultset.length; i++){
        var conversation_id = resultset[i]['conversation_id'];
        var chat_save_time  = resultset[i]['chat_save_time'];

          Conversations.update({sender_archive:1,receiver_archive:1},
            {
              where:{
                conversation_id : conversation_id,
                created: {
                $lt: models.sequelize.fn(
                        'DATE_SUB',
                        models.sequelize.literal('NOW()'),
                        models.sequelize.literal('INTERVAL '+chat_save_time+' MINUTE')
                    )
                } 
              }
            }
            ).then(function(conversations) {
            console.log('Delete successfully')
          }).catch(function( e ){
            console.log(e.message)
          });
    }
  }
  else{
    console.log ("No Record Found.")
  }
  });
 }

module.exports = router;
