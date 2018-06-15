var express = require('express');
var router = express.Router();

var Sequelize = require('sequelize');
var Promise = require('promise');
var session = require('express-session');
var md5     = require('md5');
//var flash   = require('express-flash-messages');
var session_auth = require('../session_auth');

var models = require('../models'); 
var feedbacks     = models.feedbacks;
var Users = models.users;
var Roles = models.roles;
var FaqsTopics = models.faqs_topics;
var Faqs = models.faqs;
var InvestmentPlans = models.investment_plans;
var unique = require('array-unique');
var common = require('./common.js');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});
router.get('/signup', function(req, res) {
	var json_data = {'err':	'0','successmsg':''};
	res.render('admin/signup.ejs',{
		title: 'Admin | Signup',
		json_data:json_data
	});
});
router.post('/signup', function(req, res,callback) {
	
	Users.findOne({
		where: {
			email: req.body.email
		}
	}).then(function(User){
		if(User){
			res.render('admin/signup.ejs',{'title': 'Admin | Signup','err':	'1','message':"Email already exits."});
		}
		else{
			Users.create(req.body).then(function(newUser) {
				if (!newUser) {
					res.render('admin/signup.ejs',{'title': 'Admin | Signup','err':	'1','message':"Data base error. Please contact to admin."});
				}
				if (newUser) {
					res.render('admin/signup.ejs',{'title': 'Admin | Signup','err':	'0','message':"User has been registered successfully."});
				}
			});
		}
	})
});
router.get('/login', function(req, res) {
	var json_data = {'err':	'0','successmsg':''};
	res.render('admin/login.ejs',{
		title: 'Admin | Login',
		json_data:json_data
	});
});
router.post('/login', function(req, res) {
	
	Users.findOne({
		where: { username: req.body.username },
		include: [{
			model: Roles
			}]
		}).then( function( users ){
			//console.log(JSON.stringify(users , null, 4));
			if(users){
				if(users.status == 0){
					var json_data = {'title': 'Admin | Login','err':'1','message':"Your account is currently inactive. Please contact admin."};
					res.render('admin/login.ejs',json_data);
				}
				else if(users.password!=md5(req.body.password)){
					var json_data = {'title': 'Admin | Login','err':'1','message':"Please enter valid password."};
					res.render('admin/login.ejs',json_data);
				}
				else{
					
					req.session.user_id    = users.id;
					req.session.first_name = users.first_name;
					req.session.last_name  = users.last_name;
					req.session.username   = users.username;
					req.session.email 	   = users.email;
					req.session.status     = users.status;
					req.session.role_id    = users.role.role_id;
					
					req.session.admin    = users;
					
					res.redirect('/admin/dashboard');
				}	
			}
			else{
				var json_data = {'title': 'Admin | Login','err':'1','message':"User is not exits."};
				res.render('admin/login.ejs',json_data);
			}	
		}).catch(function( e ){
			//console.log( 'eager loading error: ', e );
			//throw e;
			var json_data = {'title': 'Admin | Login','err':'1','message':e};
			res.render('admin/login.ejs',json_data);
		});
});
//=============User Logout Function Start=========================//
router.get('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/admin/login');
});
//=============User Logout Function End===========================//

router.get('/dashboard',session_auth.auth, function(req, res) {
	
	Users.findAndCountAll({
		where: { status: { $ne: 4 }, role_id: { $ne: 1 }}
	}).then(function(user){	
		
		res.render('admin/dashboard.ejs',{
			title: 'Admin | Dashboard',
			page_name: 'dashboard',
			userCount: user.count
		});
	})
});

router.get('/changepassword', session_auth.auth, function(req, res) {
	
	Users.findOne({ where: { id: req.session.user_id } })
		.then( function( user ) { 
			res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:JSON.stringify(user)} );
		}).catch(function( e ){
			res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:''} );
		});
});

router.post('/changepassword', session_auth.auth, function(req, res) {
	
	var oldpassword        = req.body.oldpassword;
	var newpassword        = req.body.newpassword;
	var confirmnewpassword = req.body.confirmnewpassword;
	
	
	Users.findOne({
		where: {
			id: req.session.user_id
		}
	}).then(function(user) {
		
		if(user){
			if(user.password !== md5(req.body.oldpassword)){
				res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:JSON.stringify(user),'err':'1','message':"Wrong old password!"} );
			}
			else if(req.body.newpassword!=req.body.confirmnewpassword){
				res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:JSON.stringify(user),'err':'1','message':"New password and  confirm password doesn't matches!"} );
			}
			else{
				Users.update({ password : md5(req.body.newpassword) },{where:{id : req.session.user_id }}).then(function(newUser) {
					res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:JSON.stringify(user),'err':'0','message':"Password updated successfully."} );
				}).catch(function( e ){
					res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:JSON.stringify(user),'err':'0','message':e} );
				});	
			}
		}
		else{
			
			res.render('admin/changepassword.ejs', {title: 'Admin | Change Password',page_name: 'changepassword',userdata:"",'err':'1','message':"User does not exist!"} );
		}
	})	
});

router.get('/updateprofile', session_auth.auth, function(req, res) {
	
	Users.findOne({ where: { id: req.session.user_id } })
		.then( function( user ) { 
			res.render('admin/updateprofile.ejs', {title: 'Admin | Update Profile',page_name: 'updateprofile',userdata:JSON.stringify(user)} );
		}).catch(function( e ){
			res.render('admin/updateprofile.ejs', {title: 'Admin | Update Profile',page_name: 'updateprofile',userdata:''} );
		});
});

router.post('/updateprofile', session_auth.auth, function(req, res) {
	
	Users.findOne({
		where: {
			id: req.session.user_id
		}
	}).then(function(user) {		
		if(user){
			Users.update(req.body,{where:{id : req.session.user_id }}).then(function(newUser) {
				res.render('admin/updateprofile.ejs', {title: 'Admin | Update Profile',page_name: 'updateprofile',userdata:JSON.stringify(user),'err':'0','message':"Profile updated successfully."} );
			}).catch(function( e ){
				res.render('admin/updateprofile.ejs', {title: 'Admin | Update Profile',page_name: 'updateprofile',userdata:JSON.stringify(user),'err':'0','message':e} );
			});	
			
		}
		else{
			
			res.render('admin/updateprofile.ejs', {title: 'Admin | Update Profile',page_name: 'updateprofile',userdata:"",'err':'1','message':"User does not exist!"} );
		}
	})	
});	
router.get('/manageUser',session_auth.auth,  function(req, res) {
	
	var filter = req.query.search;
  
	if (filter !== undefined) {
		$where = {role_id: { $ne: 1 },status: { $ne: 4 },$or: { first_name: { $like: '%' + filter + '%' },last_name: { $like: '%' + filter + '%' },email: { $like: '%' + filter + '%' } } }  
		
	}
	else{
		$where = {role_id: { $ne: 1 },status: { $ne: 4 } }; 
	}
	
	var offset = 0;
	if(req.query.page!== undefined){
		var page = req.query.page;  // page number
	}
	else{
		var page =1;
	}
	Users.findAndCountAll().then((data) => {
		   
		var pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
	
		Users.findAll({
			where: $where,
			limit: limit,
			offset: offset,
			include: [{
				model: Roles
			}]
		}).then( function ( resultset ){
			res.render('admin/manageUser.ejs',{ 'title': 'Admin | manageUser','page_name': 'manageUser', 'resultset': resultset,'filter':filter,'count': data.count,'pageCount': pages,'page':page });
		});
	})
});
router.get('/enable_disable_user',session_auth.auth, function(req, res) {
	
	if(req.query.status == 0){
		$show_status="deactivated";
	}
	else{
		$show_status="activated";
	} 
	Users.update({status:req.query.status},{where:{id : req.query.user_id }}).then(function(user) {
		req.flash('successmsg', 'User '+ $show_status +' successfully.');
		res.redirect('manageUser');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageUser');
	});
});
router.get('/archive_user',session_auth.auth,  function(req, res) {
	
	Users.update({status:4},{where:{id : req.query.user_id }}).then(function(user) {
		req.flash('successmsg', 'User archived successfully.');
		res.redirect('manageUser');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageUser');
	});
});
router.post('/archive_user', session_auth.auth, function(req, res) {
	var ids = req.body.chk;
	
	var index = ids.indexOf('on');
	if (index > -1) {
		ids.splice(index, 1);
	}
		
	Users.update({status:4},{where: {id: { $in: ids }}}).then(function(user) {
		req.flash('successmsg', 'Selected user archived successfully.');
		res.redirect('manageUser');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageUser');
	});
});
router.get('/viewUser', session_auth.auth, function(req, res) {
	
	Users.findOne({
		where: {
			id: req.query.user_id
		}
	}).then(function(user) {		
		res.render('admin/viewUser.ejs', {title: 'Admin | View User',page_name: 'viewUser',resultset:user} );
	})
});
router.get('/editUser', session_auth.auth, function(req, res) {

	Users.findOne({
		where: {
			id: req.query.user_id
		}
	}).then(function(user) {		
		res.render('admin/editUser.ejs', {title: 'Admin | Edit User',page_name: 'editUser',resultset:user} );
	})
});
router.post('/editUser', session_auth.auth, function(req, res) {
	
	Users.update(req.body,{where: {id: req.body.user_id }}).then(function(user) {
		req.flash('successmsg', 'User edited successfully.');
		res.redirect('editUser?user_id='+req.body.user_id+'');
	}).catch(function( e ){
		req.flash('errormsg', 'Data base error. Please contact to admin.');
		res.redirect('editUser?user_id='+req.body.user_id+'');
	});
});

router.get('/manageFaqTopics',session_auth.auth, function(req, res) {
	
	var filter = req.query.search;
  
	if (filter !== undefined) {
		$where = {status: { $ne: 4 },$or: { title: { $like: '%' + filter + '%' } } }  
	}
	else{
		$where = {status: { $ne: 4 } }; 
	}
	
	var offset = 0;
	if(req.query.page!== undefined){
		var page = req.query.page;  // page number
	}
	else{
		var page =1;
	}
	FaqsTopics.findAndCountAll().then((data) => {
		   
		var pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
	
		FaqsTopics.findAll({
			where: $where,
			limit: limit,
			offset: offset,
			
		}).then( function ( resultset ){
			res.render('admin/manageFaqTopics.ejs',{ 
				'title': SITE_NAME+ ' | Manage Faq Topics',
				'main_item': 'FAQ Management',
				'item':'FAQ Topics',
				'page_name': 'Manage Faq Topics', 
				'pagename': 'faqs', 
				'methodname': 'manageFaqTopics', 
				'resultset': resultset,
				'filter':filter,
				'count': data.count,
				'pageCount': pages,
				'page':page 
				});
		});
	})
});
router.get('/addFaqTopics', session_auth.auth, function(req, res) {

	res.render('admin/addFaqTopics.ejs',{
		'title': SITE_NAME+ ' | Add Faq Topics',
		'main_item': 'FAQ Management',
		'item':'FAQ Topics',
		'page_name': 'Add Faq Topics', 
		'pagename': 'faqs', 
		'methodname': 'addFaqTopics',
		'doaction': 'add',
		'resultset':''
		});
});
router.get('/editFaqTopics', session_auth.auth, function(req, res) {

	FaqsTopics.findOne({
		where: {
			id: req.query.faq_topics_id
		}
	}).then(function(faq_topics) {		
		res.render('admin/addFaqTopics.ejs', {
			'title': SITE_NAME+ ' | Edit Faq Topics',
			'main_item': 'FAQ Management',
			'item':'FAQ Topics',
			'page_name': 'Edit Faq Topics', 
			'pagename': 'faqs', 
			'methodname': 'editFaqTopics',
			'doaction': 'edit',
			resultset:faq_topics
			} );
	})
});
router.post('/add_edit_faq_topics_to_database',session_auth.auth, function(req, res) {
	
	if(req.body.faq_topics_id ==undefined){
		
		FaqsTopics.findOne({
			where: {
				title: req.body.title
			}
		}).then(function(faq_topics){
			if(faq_topics){
				req.flash('errormsg', 'Faq topics already exits.');
				res.redirect('addFaqTopics');
			}
			else{
				FaqsTopics.create(req.body).then(function(faq_topics) {
					if (!faq_topics) {
						req.flash('errormsg', 'Data base error. Please contact to admin.');
						res.redirect('addFaqTopics');
					}
					else {
						req.flash('successmsg', 'Faq topics added successfully.');
						res.redirect('addFaqTopics');
					}
				});
			}
		})
	}
	else{
		FaqsTopics.update(req.body,{where: {id: req.body.faq_topics_id }}).then(function(faq_topics) {
			req.flash('successmsg', 'Faq topics edited successfully.');
			res.redirect('editFaqTopics?faq_topics_id='+req.body.faq_topics_id+'');
		}).catch(function( e ){
			req.flash('errormsg', 'Data base error. Please contact to admin.');
			res.redirect('editFaqTopics?faq_topics_id='+req.body.faq_topics_id+'');
		});
	}
});
router.get('/enable_disable_faq_topic', session_auth.auth, function(req, res) {
	
	if(req.query.status == 0){
		$show_status="deactivated";
	}
	else{
		$show_status="activated";
	} 
	FaqsTopics.update({status:req.query.status},{where:{id : req.query.faq_topics_id }}).then(function(user) {
		req.flash('successmsg', 'Faq topics '+ $show_status +' successfully.');
		res.redirect('manageFaqTopics');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageFaqTopics');
	});
});
router.get('/archive_faq_topics', session_auth.auth, function(req, res) {
	
	FaqsTopics.update({status:4},{where:{id : req.query.faq_topics_id }}).then(function(user) {
		req.flash('successmsg', 'Faq topics archived successfully.');
		res.redirect('manageFaqTopics');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageFaqTopics');
	});
});
router.post('/archive_faq_topics', session_auth.auth,  function(req, res) {
	var ids = req.body.chk;
	
	var index = ids.indexOf('on');
	if (index > -1) {
		ids.splice(index, 1);
	}
		
	FaqsTopics.update({status:4},{where: {id: { $in: ids }}}).then(function(user) {
		req.flash('successmsg', 'Selected Faq topics archived successfully.');
		res.redirect('manageFaqTopics');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageFaqTopics');
	});
});

router.get('/manageFaqs', session_auth.auth, function(req, res) {
	
	var filter = req.query.search;
  
	if (filter !== undefined) {
		$where = {faq_status: { $ne: 4 },$or: { faq_question: { $like: '%' + filter + '%' } } }  
	}
	else{
		$where = {faq_status: { $ne: 4 } }; 
	}
	
	var offset = 0;
	if(req.query.page!== undefined){
		var page = req.query.page;  // page number
	}
	else{
		var page =1;
	}
	Faqs.findAndCountAll().then((data) => {
		   
		var pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
	
		Faqs.findAll({
			where: $where,
			limit: limit,
			offset: offset,
			
		}).then( function ( resultset ){
			res.render('admin/manageFaqs.ejs',{ 
				'title': SITE_NAME+ ' | Manage Faqs',
				'item':'FAQ',
				'main_item': 'FAQ Management',
				'page_name': 'Manage Faqs', 
				'pagename': 'faqs', 
				'methodname': 'manageFaqs', 
				'resultset': resultset,
				'filter':filter,
				'count': data.count,
				'pageCount': pages,
				'page':page 
				});
		});
	})
});
router.get('/addFaq', session_auth.auth, function(req, res) {
	
	$where = {status: { $ne: 4 } }; 
	
	FaqsTopics.findAll({
		where: $where 
	}).then(function (rowfaqsTopics){
		
		res.render('admin/addFaq.ejs',{
			'title': SITE_NAME+ ' | Add Faq ',
			'main_item': 'FAQ Management',
			'item':'FAQ ',
			'page_name': 'Add Faq', 
			'pagename': 'faqs', 
			'methodname': 'addFaq',
			'doaction': 'add',
			'faqTopics': rowfaqsTopics,
			'resultset':''
		});
	});
})
router.get('/editFaq', session_auth.auth, function(req, res) {
	$where = {status: { $ne: 4 } }; 
	Faqs.findOne({
		where: {
			id: req.query.faq_id
		}
	}).then(function(faq) {
		FaqsTopics.findAll({
			where: $where 
		}).then(function (rowfaqsTopics){
				
		res.render('admin/addFaq.ejs', {
			'title': SITE_NAME+ ' | Edit Faq',
			'main_item': 'FAQ Management',
			'item':'FAQ',
			'page_name': 'Edit Faq', 
			'pagename': 'faqs', 
			'methodname': 'editFaq',
			'doaction': 'edit',
			'faqTopics': rowfaqsTopics,
			'resultset':faq
			} );
		})	
	})
});
router.post('/add_edit_faq_to_database', session_auth.auth, function(req, res) {
	
	if(req.body.faq_id ==undefined){
		
		Faqs.findOne({
			where: {
				faq_question: req.body.faq_question
			}
		}).then(function(faq){
			if(faq){
				req.flash('errormsg', 'Question already exits.');
				res.redirect('addFaq');
			}
			else{
				Faqs.create(req.body).then(function(faq) {
					if (!faq) {
						req.flash('errormsg', 'Data base error. Please contact to admin.');
						res.redirect('addFaq');
					}
					else {
						req.flash('successmsg', 'Faq added successfully.');
						res.redirect('addFaq');
					}
				});
			}
		})
	}
	else{
		Faqs.update(req.body,{where: {id: req.body.faq_id }}).then(function(faq) {
			req.flash('successmsg', 'Faq edited successfully.');
			res.redirect('editFaq?faq_id='+req.body.faq_id+'');
		}).catch(function( e ){
			req.flash('errormsg', 'Data base error. Please contact to admin.');
			res.redirect('editFaq?faq_id='+req.body.faq_id+'');
		});
	}
});
router.get('/enable_disable_faq',session_auth.auth, function(req, res) {
	
	if(req.query.status == 0){
		$show_status="deactivated";
	}
	else{
		$show_status="activated";
	} 
	Faqs.update({faq_status:req.query.status},{where:{id : req.query.faq_id }}).then(function(user) {
		req.flash('successmsg', 'Faq '+ $show_status +' successfully.');
		res.redirect('manageFaqs');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageFaqs');
	});
});
router.get('/archive_faq',session_auth.auth,  function(req, res) {
	
	Faqs.update({faq_status:4},{where:{id : req.query.faq_id }}).then(function(user) {
		req.flash('successmsg', 'Faq archived successfully.');
		res.redirect('manageFaqs');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageFaqs');
	});
});
router.post('/archive_faq',session_auth.auth,  function(req, res) {
	var ids = req.body.chk;
	
	var index = ids.indexOf('on');
	if (index > -1) {
		ids.splice(index, 1);
	}
		
	Faqs.update({faq_status:4},{where: {id: { $in: ids }}}).then(function(user) {
		req.flash('successmsg', 'Selected faqs archived successfully.');
		res.redirect('manageFaqs');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageFaqs');
	});
});
router.get('/viewFaq',session_auth.auth,  function(req, res) {
	
	Faqs.findOne({
		where: { faq_status: { $ne: 4 }, id:req.query.faq_id },
		include: [{
			model: FaqsTopics
		}]
	}).then(function(faq) {		
		res.render('admin/viewFaq.ejs', {
			'title': SITE_NAME+ ' | View Faq',
			'main_item': 'FAQ Management',
			'item':'FAQ',
			'page_name': 'View Faq', 
			'pagename': 'faqs', 
			'methodname': 'viewFaq',
			'resultset':faq
		});
	})
});

router.get('/manageInvestmentPlan', session_auth.auth, function(req, res) {
	
	var filter = req.query.search;
  
	if (filter !== undefined) {
		$where = {status: { $ne: 4 },$or: { investment_name: { $like: '%' + filter + '%' } } }  
	}
	else{
		$where = {status: { $ne: 4 } }; 
	}
	
	var offset = 0;
	if(req.query.page!== undefined){
		var page = req.query.page;  // page number
	}
	else{
		var page =1;
	}
	InvestmentPlans.findAndCountAll().then((data) => {
		   
		var pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
	
		InvestmentPlans.findAll({
			where: $where,
			limit: limit,
			offset: offset,
			
		}).then( function ( resultset ){
			res.render('admin/manageInvestmentPlan.ejs',{ 
				'title': SITE_NAME+ ' | Manage Investment Plan',
				'item':'Investment Plan',
				'main_item': 'Investment Plan Management',
				'page_name': 'Manage Investment Plan', 
				'pagename': 'Investment Plan', 
				'methodname': 'manageInvestmentPlan', 
				'resultset': resultset,
				'filter':filter,
				'count': data.count,
				'pageCount': pages,
				'page':page 
				});
		});
	})
});
router.get('/enable_disable_invest_plan',session_auth.auth, function(req, res) {
	
	if(req.query.status == 0){
		$show_status="deactivated";
	}
	else{
		$show_status="activated";
	} 
	InvestmentPlans.update({status:req.query.status},{where:{id : req.query.investment_plan_id }}).then(function(user) {
		req.flash('successmsg', 'Investment plan '+ $show_status +' successfully.');
		res.redirect('manageInvestmentPlan');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageInvestmentPlan');
	});
});
router.get('/archive_invest_plan',session_auth.auth,  function(req, res) {
	
	InvestmentPlans.update({status:4},{where:{id : req.query.investment_plan_id }}).then(function(user) {
		req.flash('successmsg', 'Investment plan archived successfully.');
		res.redirect('manageInvestmentPlan');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageInvestmentPlan');
	});
});
router.post('/archive_invest_plan',session_auth.auth,  function(req, res) {
	var ids = req.body.chk;
	
	var index = ids.indexOf('on');
	if (index > -1) {
		ids.splice(index, 1);
	}
		
	InvestmentPlans.update({status:4},{where: {id: { $in: ids }}}).then(function(user) {
		req.flash('successmsg', 'Selected Investment plan archived successfully.');
		res.redirect('manageInvestmentPlan');
	}).catch(function( e ){
		req.flash('errormsg', e);
		res.redirect('manageInvestmentPlan');
	});
});
router.get('/editInvestmentPlan', session_auth.auth, function(req, res) {
	$where = {status: { $ne: 4 } }; 
	InvestmentPlans.findOne({
		where: {
			id: req.query.investment_plan_id
		}
	}).then(function(resultset) {
		
				
		res.render('admin/editInvestmentPlan.ejs', {
			'title': SITE_NAME+ ' | Edit Investment Plan',
			'item':'Investment Plan',
			'main_item': 'Investment Plan Management',
			'page_name': 'Edit Investment Plan', 
			'pagename': 'Investment Plan', 
			'methodname': 'editInvestmentPlan', 
			'doaction': 'edit',
			'resultset': resultset
			} );
			
	})
});
router.post('/add_edit_investmant_plan_to_database', session_auth.auth, function(req, res) {
	
		InvestmentPlans.update(req.body,{where: {id: req.body.investment_plan_id }}).then(function(faq) {
			req.flash('successmsg', 'Investment Plan edited successfully.');
			res.redirect('editInvestmentPlan?investment_plan_id='+req.body.investment_plan_id+'');
		}).catch(function( e ){
			req.flash('errormsg', 'Data base error. Please contact to admin.');
			res.redirect('editInvestmentPlan?investment_plan_id='+req.body.investment_plan_id+'');
		});
	
});


router.get('/criminalactivity', session_auth.auth, function(req, res){

	var filter = req.query.search;
  
	var search = req.query.search;
	console.log(search);
if(search){
	var user_id = [];
	var user_feedback_id = [];
	var mainuser = [];
	Users.findAll({
				raw:true,	
				where: {

					id: { $ne: 4 },
					$or: [
						{
							first_name: 
							{
								$like:  '%' + filter + '%'
							}
						},
						
						{
							last_name: 
							{
								$like:  '%' + filter + '%'
							}
						}, 
						{
							username: 
							{
								$like:  '%' + filter + '%'
							}
						}, 
						
					]
				}}).then( function ( resultset ){
					if(resultset){
						for (var i=0; i<resultset.length; i++){
							user_id.push(resultset[i]['id'])
						}
						for (var i=0; i<resultset.length; i++){
							user_feedback_id.push(resultset[i]['user_feedback_id'])
						}
						console.log(resultset);
					feedbacks.findAll({
						raw:true,
						where: {user_id:user_id}
					}).then(function(dataset){

								if(dataset){ 
									for (var i=0; i<dataset.length; i++){
										mainuser.push(dataset[i]['user_id'])
									}

									Users.findAll({
										raw:true,
										where: {id: mainuser}	
									}).then(function(dataset2){
										
										console.log("Hiiiiiiiiiiiiii");
										console.log(dataset2);
										
										if(dataset2){

										feedbacks.count({
											//where:{user_feedback_id: user_feedback_id}
											raw:true,
											group: ['user_feedback_id']
										}).then(function(counts) {
											console.log(counts);
										
									 		res.render('admin/complaints.ejs',{
						                  	                'resultset': resultset,
						                  	                'dataset': dataset,
						                  	                'dataset2': dataset2,
						                  	                'counts' : counts,	
					                  		});
					                  	 });	

					                }
									})	 
								}	 
						})	
				
					}	
				
					})
	
}

else{	
	feedbacks.findAll({
		raw:true,
	}).then(function(resultset) {
		if(resultset){
			// console.log(resultset[0]['id']);
			var user_id = [];
			var user_feedback_id = [];
			
			for (var i=0; i<resultset.length; i++){
				user_id.push(resultset[i]['user_id'])
			}

			for (var i=0; i<resultset.length; i++){
				user_feedback_id.push(resultset[i]['user_feedback_id'])
			}


			array1 = (unique(user_id));
			array2 = (unique(user_feedback_id));

			 Users.findAll({
			 		raw:true,
				 	where:{id: array1,
				 	 status: { $ne: 4 }}
				 }).then(function(dataset) {

					 	if(dataset){

					 		//console.log(dataset);

					 		Users.findAll({
					 			raw:true,
					 			where:{id: array2,
					 				status: { $ne: 4 }}
					 		}).then(function(dataset2) {

									if(dataset2){
										feedbacks.count({
											//where:{user_feedback_id: user_feedback_id}
											group: ['user_feedback_id']
										}).then(function(counts) {
										
									 		res.render('admin/criminalactivity.ejs',{
						                  	                'resultset': resultset,
						                  	                'dataset': dataset,
						                  	                'dataset2': dataset2,
						                  	                'counts' : counts,	
					                  		});
					                  	 });	

					                }
					            });    	        
	             			  
	             		}
	             	});		  	

		}
	 });			
}
});

router.get('/showcomplaints/:id', session_auth.auth, function(req, res){
	var id = req.params.id;
	
	feedbacks.findAll({
		raw:true,
		where:{user_feedback_id:id},
		include:[{
			model:Users,
			as:'users'
		},
		{
			model:Users,
			as:'feedbackUsers'
		}
		]
	}).then(function(resultset){
		res.render('admin/complaints.ejs',
			{'resultset': resultset,}
		);  
	 });

 });	


router.get('/deleteuser/:id', session_auth.auth, function(req, res){

	var id = req.params.id;	
	console.log(id);

	Users.update(
		{status : 4},
		{where: {id:id}}
	).then(function(resultset){
		if(resultset){	
			req.flash('successmsg', 'Account deactivated successfully.');
			res.redirect('/admin/criminalactivity');
		}
		else{
			req.flash('errormsg', 'Some error occured please try again.');
			res.redirect('/admin/criminalactivity');	
		}	
	})

 });


router.post('/search', session_auth.auth, function(req, res){
	var filter = req.body.search;
	var user_id = [];
	var user_feedback_id = [];
	var mainuser = [];
	Users.findAll({
				raw:true,	
				where: {

					id: { $ne: 4 },
					$or: [
						{
							first_name: 
							{
								$like:  '%' + filter + '%'
							}
						},
						
						{
							last_name: 
							{
								$like:  '%' + filter + '%'
							}
						}, 
						{
							username: 
							{
								$like:  '%' + filter + '%'
							}
						}, 
						
					]
				}}).then( function ( resultset ){
					if(resultset){
						for (var i=0; i<resultset.length; i++){
							user_id.push(resultset[i]['id'])
						}
						for (var i=0; i<resultset.length; i++){
							user_feedback_id.push(resultset[i]['user_feedback_id'])
						}
						console.log(resultset);
					feedbacks.findAll({
						raw:true,
						where: {user_id:user_id}
					}).then(function(dataset){

								if(dataset){ 
									for (var i=0; i<dataset.length; i++){
										mainuser.push(dataset[i]['user_id'])
									}

									Users.findAll({
										raw:true,
										where: {id: mainuser}	
									}).then(function(dataset2){
										
										console.log("Hiiiiiiiiiiiiii");
										console.log(dataset2);
										
										if(dataset2){

										feedbacks.count({
											//where:{user_feedback_id: user_feedback_id}
											raw:true,
											group: ['user_feedback_id']
										}).then(function(counts) {
											console.log(counts);
										
									 		res.render('admin/complaints.ejs',{
						                  	                'resultset': resultset,
						                  	                'dataset': dataset,
						                  	                'dataset2': dataset2,
						                  	                'counts' : counts,	
					                  		});
					                  	 });	

					                }
									})	 
								}	 
						})	
				
					}	
				
					})
		


});


module.exports = router;
