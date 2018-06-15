var express 	= require('express');
var router 		= express.Router();
var md5     	= require('md5');
var Sequelize 	= require('sequelize');
var session 	= require('express-session');
var session_auth= require('../session_auth');
var moment       = require('moment');
var Cryptr      = require('cryptr');
var cryptr      = new Cryptr('myTotalySecretKey');
var dateFormat = require('dateformat');

var models 		= require('../models'); 
var Users 		= models.users;
var Conversations = models.conversations;
var feedbacks     = models.feedbacks;
var Roles 		= models.roles;
var blockUsers  = models.blockUsers;
var block 		= models.blockUsers;
var nodemailer 	= require('nodemailer');
var random 		= require('random-number-generator')

/* GET friends listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});
router.get('/search',session_auth.frontend, function(req, res) {
	console.log(req.session.currentUser.id);
	var filter = req.query.search;
	var resultset = [];
	if (filter !== undefined) {
		$where1 = {username: { $like: '%' + filter + '%' }};
        $where2 = {first_name: [ filter.split(' ') ] };
        $where3 = {last_name:  [ filter.split(' ') ] };
        
        //$where2 = {first_name: { $like: '%' + filter.split(' ') + '%' }};
        //$where3 = {last_name: { $like: '%' + filter.split(' ') + '%' }};        
        $where = {
            id: { $ne: req.session.currentUser.id } ,
            role_id: { $ne: 1 },
            status: { $ne: 4 },
            $or: [$where1, $where2, $where3]
        }
	}
	
	var offset = 0;
	if(req.query.page!== undefined){
		var page = req.query.page;  // page number
	}
	else{
		var page =1;
	}
if (filter !== undefined) {
		Users.findAll({ where: $where }).then((data) => {
			
			var pages = Math.ceil(data.count / limit);
			offset = limit * (page - 1);
		
			Users.findAll({
				where: $where,
				limit: limit,
				offset: offset,
				include: [
					{
						model: Roles
					},
					{
						model: blockUsers,
						as: 'blocked_me',
						required:false	
					}
				]
			}).then( function ( resultset ){
				console.log(resultset)
				res.render('friends/search.ejs',{ 
						'title': 'Search',
						'resultset': resultset,
						'filter':filter,
						'count': data.count,
						'pageCount': pages,
						'page':page 
					});
			});
		});
	}
	else{
		res.render('friends/search.ejs',{ 
			'title': 'Search',
			'resultset': resultset,
			'filter':filter,
			'count': 0,
			'pageCount': 0,
			'page':0 
		});
	}
	
});
router.get('/view',session_auth.frontend, function(req, res) {
	/*var encryptedString = cryptr.encrypt('bacon'),
    decryptedString     = cryptr.decrypt(encryptedString);
    console.log(decryptedString);*/

	var user_id = req.query.user_id;
	Users.findOne({
		where: {
			id: req.query.user_id
		},
		include: [{
			model: Roles
		},
		]
	}).then(function(user) {	
		console.log("ANISGHSHSHSHHS");
		var date = dateFormat(user.date_of_birth, "dd-mm-yyyy");
			
		res.render('friends/view.ejs', {
			'title': 'View Profile',
			'resultset':user,
			'user_id': user_id,
			'moment':moment,
			'cryptr':cryptr,
			'date': date
		});
	});
});
router.get('/friend_block/:block_user_id',session_auth.frontend, function(req, res) {
	var request = {
		'user_id':req.session.currentUser.id,
		'block_user_id':req.params.block_user_id,
		'status':1
	};

	blockUsers.create(request).then(function(conversation) {
		if (!conversation) {
			req.flash('errormsg', 'User is not blocked.');
			res.redirect('/messages/inbox');
		}
		else {
			req.flash('successmsg', 'User has been blocked.');
			res.redirect('/messages/inbox');
		}
	});
});

router.get('/feedbacks/:id', session_auth.frontend, function(req, res) {

	res.render('friends/feedback.ejs',{
		'user_feedback_id':cryptr.decrypt(req.params.id)
	});
});
router.post('/feedbacks', session_auth.frontend, function(req, res) {
	
	var encrypt_feedback_id = cryptr.encrypt(req.body.user_feedback_id);
	var request = {
		'user_id':req.session.currentUser.id,
		'user_feedback_id':req.body.user_feedback_id,
		'feedback':req.body.exampleTextarea,
		'status':1
	};
	
	feedbacks.create(request).then(function(feedback) {	
		if (!feedback) {
			req.flash('errormsg', 'Feedback is not saved.');
			res.redirect('/friends/feedbacks/'+encrypt_feedback_id+'');
		}
		else{
			req.flash('successmsg', 'Feedback is saved.');
			res.redirect('/messages/inbox');
		}
	});
});


router.get('/block_report/:block_user_id',session_auth.frontend, function(req, res) {
	var request = {
		'user_id':req.session.currentUser.id,
		'block_user_id':req.params.block_user_id,
		'status':2
	};


	// Users.find({
	// 	where: {
	// 		email: req.body.email,
	// 		phone: req.body.phone,
	// 		username: req.body.username
	// 	}
	// }).then(function(user){
		
	// 	if(!user){
	blockUsers.findAndCountAll({
		where: { 
			block_user_id: req.params.block_user_id 
		}
	}).then(function(block_users){	
		
		if(block_users.count > 9){
			//update user table
			// var request = {
			// 	id : req.params.block_user_id
			// };
			console.log(block_users.count);

			Users.update(
				{ status: 2 },
				{ where: { id: req.params.block_user_id } }
			).then(function(rese, err) {
				if (rese) {
					console.log("Updated 1");
				} 
				else {
					console.log("Error 1");		
				}	
			  });

			blockUsers.create(request).then(function(conversation) {
				if (!conversation) {
					req.flash('errormsg', 'User is not blocked.');
					console.log("Saved 2");
					res.redirect('/messages/inbox');
				}

				else{
					console.log("Error 2");
				}
			});	

			
		}
		else{
			// Insert into block users table
				blockUsers.create(request).then(function(conversation) {
					if (!conversation) {
						req.flash('errormsg', 'User is not blocked.');
						console.log("Error 3");
					}

					else{
						console.log("Saved 3");
						req.flash('successmsg', 'Sender blocked successfully.');
						res.redirect('/messages/inbox');
					}
				});
		}
	 })	

	
});


router.get('/autoComplete',session_auth.frontend, function(req, res) {
	var filter=req.query.term;
    
    $where1 = {username: { $like: '%' + filter + '%' }};
    $where2 = {first_name: [ filter.split(' ') ] };
    $where3 = {last_name:  [ filter.split(' ') ] };
        
    $where = {
        id: { $ne: req.session.currentUser.id } ,
        role_id: { $ne: 1 },
        status: { $ne: 4 },
        $or: [$where1, $where2]
 	}
 	
	Users.findAll({where: {first_name: { $like: '%' + req.query.term + '%' }}}).then(function(result){
		console.log(result);
		var arr={};

		for(var i=0;i<result.length;i++){
			var image = "<img src ='/user_images/"+result[i].profile_image+"'>";
			arr[i] = {
				'label':result[i].first_name+" "+result[i].last_name,
				'value':result[i].first_name+" "+result[i].last_name,
				'id':result[i].id,
				'img':"/user_images/"+result[i].profile_image,
			};
		}
		//console.log(arr);
		res.send(arr);
	});
});

	
module.exports = router;
