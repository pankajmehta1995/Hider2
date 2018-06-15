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
var chatHistorySave = models.chatHistorySave;
var Conversations = models.conversations;
var user_feedback = models.user_feedback;
var Roles 		= models.roles;
var blockUsers 	= models.blockUsers;
var userConversationKey 	= models.user_conversation_key;


var nodemailer 	= require('nodemailer');
var randomstring 		= require('randomstring')

/* GET Inbox listing. */
router.get('/inbox',session_auth.frontend, function(req, res) {
	console.log("ANISH");

	blockUsers.findAll({
		where:{user_id: req.session.currentUser.id}
	}).then(function(data){
		
		Conversations.findAll({
			where: {
				receiver_id: req.session.currentUser.id,
				sender_archive: 0,
				receiver_archive: 0
				//conversation_type:1,

				// $or: [
	   //      {
	   //          receiver_view: 
	   //          {
	   //              $eq: 0
	   //          }
	   //      }, 
	   //      {
	   //          receiver_archive: 
	   //          {
	   //              $eq: 0
	   //          }
	   //      }

	   //  ]

			},

			//  order: [
	  //           ['conversation_id', 'DESC']
	  //       ],
		}).then(function(conversations) {
			console.log("THAKURRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
			console.log(conversations);
			// console.log(conversations[0]['sender_id']);
			$where = { where: { receiver_id: req.session.currentUser.id } } ;
			Conversations.update({ receiver_view: 1 },$where).then(function(response, err) {
				if (response) {
	    		} 
				else {	
				}	
			});		

			if(conversations.length>0){
				Users.findAll(
					{ where: { id: conversations[0]['sender_id'] }} 
				
			).then(function(dataset){
				console.log(dataset);
			
				res.render('messages/inbox.ejs', {
					'title': 'Inbox',
					'moment':moment,
					'cryptr':cryptr,
					'resultset':conversations,
					'dataset':dataset,
					'data':data 
				});
			})
		}

		else{
			res.render('messages/inbox.ejs', {
				'title': 'Inbox',
				'moment':moment,
				'cryptr':cryptr,
				'resultset':conversations,
				'data':data 
			
			});
		}

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
	console.log("Anish");
	console.log(req.body.message);
	request['message']=cryptr.encrypt(req.body.message);

	/* Unblocking user */
	//console.log(receiver_id);
	blockUsers.findOne({
		where: {
			user_id: req.session.currentUser.id,
			block_user_id: req.body.receiver_id
		}
	}).then(function(rese,err){
			if(rese){
				blockUsers.destroy(
					{ where: { block_user_id: req.body.receiver_id } }
		 		 ).then(function(result, err) {
					if (result) {
							//console.log("Unblocked");

							Conversations.create(request).then(function(conversation) {
								if (!conversation) {
									req.flash('errormsg', 'Data base error. Please contact admin.');
									res.redirect('/messages/send_message/'+encrypt_receiver_id+'');
								}
								else {
									req.flash('successmsg', 'Message sent successfully.');
									res.redirect('/messages/send_message/'+encrypt_receiver_id+'');
								}
							});
					} 

				});

			}
			else{
				Conversations.create(request).then(function(conversation) {
					if (!conversation) {
						req.flash('errormsg', 'Data base error. Please contact to admin.');
						res.redirect('/messages/send_message/'+encrypt_receiver_id+'');
					}
					else {
						req.flash('successmsg', 'Message sent successfully.');
						res.redirect('/messages/send_message/'+encrypt_receiver_id+'');
					}
				});			
			}
			
	 });	


	
});
/*2-05-2018*/
// router.get('/conversations/:receiver_id',session_auth.frontend, function(req, res) {
// 	console.log("Anish");
// 	receiver_id     = cryptr.decrypt(req.params.receiver_id);
// 	// res.render('messages/conversations.ejs',{ 
// 	// 	'title': 'Conversations',
// 	// 	'receiver_id':receiver_id
// 	// });

// 	Conversations.findAll({
// 		where: {
// 			receiver_id: receiver_id,
// 			conversation_type: 2
// 		}
// 	}).then(function(result, err) {
// 			if (result) {
// 				console.log(result);
// 				console.log("ANISH");
// 				res.render('messages/conversations.ejs', {
					
// 					'msg_data': result
// 				});
// 			}	
// 		})
// });
router.get('/conversations/:receiver_id',session_auth.frontend, function(req, res) {
	
	var receiver_id  = cryptr.decrypt(req.params.receiver_id);
	var sender_id    = req.session.currentUser.id; 
	
	$where1 = {sender_id:sender_id ,receiver_id: receiver_id  } ;
	$where2 = {sender_id:receiver_id ,receiver_id: sender_id  };
	$where3 = {sender_archive: 0 ,receiver_archive: 0  };

	

	Conversations.findAll({
		where: {
			conversation_type: 2,
			$or:[$where1, $where2]
			
		}
	}).then(function(result, err) {
			console.log("THAKURRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
			console.log(result);
			if (result!=null && result!="") {

				console.log(result[0]['id']);
				console.log(result.length);
				console.log(result[0]['conversation_id']);
				console.log(result[0]['receiver_id']);
				
					Conversations.findAll({
						where: {
							conversation_type: 2,
							sender_id: result[0]['receiver_id'],
							conversation_id: result[0]['conversation_id']
						}
					}).then(function(resu, err) {
						console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
						console.log(resu.length);
						if(resu.length == 3){

							res.render('messages/conversations.ejs', {
							'receiver_id':receiver_id,
							'resultset': result,
							'length': resu.length

							});

						}	

						else{
							res.render('messages/conversations.ejs', {
							'receiver_id':receiver_id,
							'resultset': result,
							'length': resu.length

							});
						}
					})

			}	

			else{
				res.render('messages/conversations.ejs', {
					'receiver_id':receiver_id,
					'resultset': result,
					'length': 0
					});
			}
		})
});
/*2-05-2018*/
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
							request['message'] = cryptr.encrypt(req.body.message);
							request['conversation_id'] = conversations.conversation_id;
							request['conversation_type'] = 2;
							
							Conversations.create(request).then(function(conversation) {
								if (!conversation) {
									req.flash('errormsg', 'Data base error. Please contact to admin.');
									res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
								}
								else {
									req.flash('successmsg', 'Message sent successfully.');
									res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
								}
							});
						}
						else{
							var request = req.body;
							request['message'] = cryptr.encrypt(req.body.message);
							request['conversation_id'] = randomstring.generate();
							request['conversation_type'] = 2;
							
							Conversations.create(request).then(function(conversation) {
								if (!conversation) {
									req.flash('errormsg', 'Data base error. Please contact to admin.');
									res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
								}
								else {
									req.flash('successmsg', 'Message sent successfully.');
									res.redirect('/messages/conversations/'+encrypt_receiver_id+'');
								}
							});
						}
					 });	

	
});


router.get('secretname', session_auth.frontend, function(req, res) {
	 res.render('messages/secretname.ejs');
});


router.post('secretname', session_auth.frontend, function(req, res) {
	 res.render('messages/secretname.ejs');
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
			$or:[$where1, $where2],
			conversation_type: 2
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
							  '<h4>'+cryptr.decrypt(conversations[i].message)+'</h4>'+
						  '</div>'+
						'</div>';
				}
				else{
				html+='<div class="text sender" id="div_'+conversations[i].id+'">'+
						  '<div class="border">'+
							  '<h3>'+conversations[i].senderUser.first_name+' '+conversations[i].senderUser.last_name+' <br/> <span>'+moment(conversations[i].created, "YYYYMMDD").fromNow()+' </span></h3>'+
							  '<h4>'+cryptr.decrypt(conversations[i].message)+'</h4>'+
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
						
						  '<h4>No activity found..</h4>'+
					  '</div>'+
					'</div>';
			data[1] = html;		
		}
		

		res.send(data);
	});	
	
	
});

/* 24-04-2018 Start */
// router.get('/checkConversationKey/:sender_id/:receiver_id',session_auth.frontend, function(req, res) {
	

// 	userConversationKey.findAndCountAll({
// 		where: {
// 			sender_id: req.params.sender_id,
// 			receiver_id:req.params.receiver_id
// 		}
// 	}).then(function(conversationkey) {
		
// 		var data = {
// 			conversationkeyCount:conversationkey.count
// 		};
		
// 		res.send(data);
// 	});
// });
// router.get('/addConversationKey/:sender_id/:receiver_id/:receiver_conversation_key',session_auth.frontend, function(req, res) {
	
// 	var request = req.params;
// 	userConversationKey.create(request).then(function(conversationkey) {
		
// 		if (!conversationkey) {
// 			var data = {
// 				err:1
// 			};
// 		}
// 		else {
// 			var data = {
// 				err:0
// 			};
// 		}
// 		res.send(data);
// 	});
	
// });	
/* 24-04-2018 End */	


/*27 - 04 -2018*/
router.get('/delete/:id',session_auth.frontend, function(req, res) {

	var id = req.params.id;

	Conversations.update(
  							{ receiver_archive: 1 },
  							{ where: { id: id } }
						).then(function(rese, err) {
		    				if (rese) {
		    					req.flash('successmsg', 'Message deleted successfully');
	   							res.redirect('/messages/inbox');
		    	    		} 
							else {
  				 				req.flash('errormsg', 'Message can not be deleted, please try again');
	   							res.redirect('/messages/inbox');
  							}	

    					});
	   //  where: {
				// id: id
	   //  }.then(function(result) {
	   //  	if(result){
	   //  		req.flash('successmsg', 'Message deleted successfully');
	   //  		res.redirect('/messages/inbox');
	   //  	}
	   //  	else{
	   //  		req.flash('errormsg', 'Message can not be deleted, please try again');
	   //  		res.redirect('/messages/inbox');
	   //  	}
	   //  })
	
});


/* 24-04-2018 Start */
router.get('/checkConversationKey/:sender_id/:receiver_id',session_auth.frontend, function(req, res) {
	

	userConversationKey.findAndCountAll({
		where: {
			sender_id: req.params.sender_id,
			receiver_id:req.params.receiver_id
		}
	}).then(function(conversationkey) {
		
		var data = {
			conversationkeyCount:conversationkey.count
		};
		
		res.send(data);
	});
});

router.get('/addConversationKey/:sender_id/:receiver_id/:receiver_conversation_key/:conversation_id/:chat_save_time',session_auth.frontend, function(req, res) {
	//console.log("PANKAJMEHTA");
	//console.log(req.params);
	//return false;
	var request= {
		'sender_id' : req.params.sender_id,
		'receiver_id': req.params.receiver_id,
		'receiver_conversation_key':req.params.receiver_conversation_key
	};
	
	
	userConversationKey.create(request).then(function(conversationkey) {
		
		if (!conversationkey) 
		{
			 var data = {err:1};
		}
		else 
		{
			if(req.params.chat_save_time !='0')
			{
				var  chatHistory = {
					'conversation_id':req.params.conversation_id,
					'user_id':req.params.sender_id,
					'chat_save_time':req.params.chat_save_time
				};
				chatHistorySave.create(chatHistory).then(function(chatHistoryData) 
				{
					if (!chatHistoryData) {var data = {err:1};	}
					else{var data = {err:0};}
					res.send(data);
				});
			}
			else
			{
				var data = {err:0};
				res.send(data);
			}
		}
	});
	
});	
/* 24-04-2018 End */	

router.get('/checkConversationWith/:verification/:receiver_id',session_auth.frontend, function(req, res) {
	
	$where1 = {phone: req.params.verification};
	$where2 = {email: req.params.verification};
	
	Users.findOne({ 
		where: {
			id:req.params.receiver_id,
			$or:[$where1, $where2]
		} 
	}).then( function( users ){
		console.log("kdlsjakldsakljsklajsakldjkl");
		if(users){
			var data = {result:1};
		}
		else{
			var data = {result:0};
		}
		res.send(data);
	});
})


module.exports = router;
