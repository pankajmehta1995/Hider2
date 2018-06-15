var express 	= require('express');
var router 		= express.Router();
var md5     	= require('md5');
var Sequelize 	= require('sequelize');
var session 	= require('express-session');
var session_auth= require('../session_auth');
var moment      = require('moment');
var Cryptr      = require('cryptr');
var cryptr      = new Cryptr('myTotalySecretKey');

var models 		= require('../models'); 
var Users 		= models.users;
var Conversations = models.conversations;
var user_feedback = models.user_feedback;
var Roles 		= models.roles;
var blockUsers 	= models.blockUsers;
var userConversationKey 	= models.user_conversation_key;


var nodemailer 	= require('nodemailer');
var random 		= require('random-number-generator')

/* GET Inbox listing. */
router.get('/inbox',session_auth.frontend, function(req, res) {
	
	Conversations.findAll({
		where: {
			receiver_id: req.session.currentUser.id,
			//conversation_type:1,
			receiver_view:0
		}
	}).then(function(conversations) {

		$where = { where: { receiver_id: req.session.currentUser.id } } ;
		Conversations.update({ receiver_view: 1 },$where).then(function(response, err) {
			if (response) {
    		} 
			else {	
			}	
		});		
		res.render('messages/inbox.ejs', {
			'title': 'Inbox',
			'moment':moment,
			'cryptr':cryptr,
			'resultset':conversations
		});
	});
});
router.get('/send_message/:receiver_id',session_auth.frontend, function(req, res) {
	receiver_id    = cryptr.decrypt(req.params.receiver_id);
	res.render('messages/send_message.ejs',{ 
		'title': 'Send Message',
		'receiver_id':receiver_id
	});
});
router.post('/send_message',session_auth.frontend, function(req, res) {
	var encrypt_receiver_id = cryptr.encrypt(req.body.receiver_id);
	var request = req.body;
	request['message']=cryptr.encrypt(req.body.message);
	Conversations.create(request).then(function(conversation) {
		if (!conversation) {
			req.flash('errormsg', 'Data base error. Please contact to admin.');
			res.redirect('/messages/send_message/'+encrypt_receiver_id+'');
		}
		else {
			req.flash('successmsg', 'Message send successfully.');
			res.redirect('/messages/send_message/'+encrypt_receiver_id+'');
		}
	});
});
router.get('/conversations/:receiver_id',session_auth.frontend, function(req, res) {
	console.log("Anish");
	receiver_id     = cryptr.decrypt(req.params.receiver_id);
	// res.render('messages/conversations.ejs',{ 
	// 	'title': 'Conversations',
	// 	'receiver_id':receiver_id
	// });

	Conversations.findAll({
		where: {
			receiver_id: receiver_id,
			conversation_type: 2
		}
	}).then(function(result, err) {
			if (result) {
				console.log(result);
				console.log("ANISH");
				res.render('messages/conversations.ejs', {
					
					'msg_data': result
				});
			}	
		})
});

router.post('/send_msg_db',session_auth.frontend, function(req, res) {
	var encrypt_receiver_id = cryptr.encrypt(req.body.receiver_id);
	var sender_id   = req.body.sender_id;
	var receiver_id = req.body.receiver_id;
	

	$where1 = {sender_id:sender_id ,receiver_id: receiver_id  } ;
	$where2 = {sender_id:receiver_id ,receiver_id: sender_id  };
	

	Conversations.findOne({
		where:{
			$or:[$where1, $where2]
		}
	}).then(function(conversations) {
		
		if(conversations!=null  && (conversations.conversation_id!=null || conversations.conversation_id!='')){
			var request = req.body;
			request['conversation_id'] = conversations.conversation_id;
			request['conversation_type'] = 2;
			
			Conversations.create(request).then(function(conversation) {
				if (!conversation) {
					req.flash('errormsg', 'Data base error. Please contact to admin.');
					res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
				}
				else {
					req.flash('successmsg', 'Message send successfully.');
					res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
				}
			});
		}
		else{
			var request = req.body;
			request['conversation_id'] = random(10000000);
			request['conversation_type'] = 2;
			
			Conversations.create(request).then(function(conversation) {
				if (!conversation) {
					req.flash('errormsg', 'Data base error. Please contact to admin.');
					res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
				}
				else {
					req.flash('successmsg', 'Message send successfully.');
					res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
				}
			});
		}
	});	
	
	
	
});
router.get('/messageNotificationCount',session_auth.frontend, function(req, res) {
	
	Conversations.findAndCountAll({
		where: {
			receiver_id: req.session.currentUser.id,
			//conversation_type:1,
			receiver_view:0
		}
	}).then(function(conversations) {
		var json_array= {
			messageCount:conversations.count
		}		
		res.send(json_array);
	});
});
router.get('/my_message/:receiver_id',session_auth.frontend, function(req, res) {
	
	var user_id     = req.session.currentUser.id;
	var receiver_id = req.params.receiver_id;
	

	$where1 = {sender_id:user_id ,receiver_id: receiver_id  } ;
	$where2 = {sender_id:receiver_id ,receiver_id: user_id  };
	

	Conversations.findAll({
		where:{
			$or:[$where1, $where2]
		},
		limit: limit,
		include: [{
			model: userConversationKey,
			as:'receiverKey',
		},
		{
			model: Users,
			as:'senderUser',
		}
		],
		
		order: [
            ['id', 'DESC']
        ]
	}).then(function(conversations) {
		//console.log();
		var data = [];
		var html = '';
		if(conversations!=null && conversations.length > 0){
			for(var i=0; i < conversations.length; i++) {
				//console.log(conversations);
				if(conversations !=null && (conversations[i].receiverKey!= null && conversations[i].receiverKey!='')){
					var user_conversation_key = conversations[i].receiverKey.receiver_conversation_key;
				}
				else{
					var user_conversation_key = "";
				}
				if(conversations[i].sender_id==user_id){
					var sender_name = conversations[i].senderUser.username;
				}
				else{
					var sender_name= '';
				}
				if(conversations[i].sender_id!=user_id){
				html+='<div class="text" id="div_'+conversations[i].id+'">'+
						  '<div class="border">'+
							  '<h3>'+ user_conversation_key +' <br/> <span>'+moment(conversations[i].created, "YYYYMMDD").fromNow()+' </span></h3>'+
							  '<h4>'+conversations[i].message+'</h4>'+
						  '</div>'+
						'</div>';
				}
				else{
				html+='<div class="text sender" id="div_'+conversations[i].id+'">'+
						  '<div class="border">'+
							  '<h3>'+conversations[i].senderUser.username+' <br/> <span>'+moment(conversations[i].created, "YYYYMMDD").fromNow()+' </span></h3>'+
							  '<h4>'+conversations[i].message+'</h4>'+
						  '</div>'+
						'</div>';
				}
			}
			
			data[0] = 'success';
			data[1] = html;
		}
		else{
			data[0] = 'success';
			html+='<div class="text">'+
					  '<div class="border">'+
						  '<h3>Lorem Ipsum <br/> <span>xxxx </span></h3>'+
						  '<h4>No activity found..</h4>'+
					  '</div>'+
					'</div>';
			data[1] = html;		
		}
		

		res.send(data);
	});	
	
	
});
module.exports = router;
