var express      = require('express');
var router       = express.Router();
var md5          = require('md5');
var Sequelize    = require('sequelize');
var session      = require('express-session');
var session_auth = require('../session_auth');
var moment       = require('moment');
var models       = require('../models'); 
var dateFormat = require('dateformat');

var Users 		  = models.users;
var Conversations = models.conversations;
var contactus = models.contactus;
var feedbacks     = models.feedbacks;
var Roles 		  = models.roles;
var Otps 		  = models.otp;
var blockUsers    = models.blockUsers;
var Contact       = models.contactus_subject;
var contactus_subject       = models.contactus_subject;
var block         = models.blockUsers;
var Vehicle       = models.vehicle;
var Property      = models.property;
var nodemailer    = require('nodemailer');
var randomstring = require('randomstring')
var path = require('path'),
 	fs = require('fs'),
formidable = require('formidable');	
var random = require('random-number-generator')
//var msg91=require('msg91-sms');
//var msg91 = require("msg91")("216935AiEHxGxp5b068517", "611332",'1' )

/*SMS GATEWAY*/
var msg91=require('msg91-sms');


//var msg91=require('msg91-sms');
var msg91 = require("msg91")("216948AYpOsH0y5b069116", "611332",'1' )


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});


/* users login . */
router.get('/login', function(req, res) {
	
	var anish = moment().toISOString();
	//req.session.destroy();
	//req.session.currentUser = null; 
	//req.session.reset();
	res.render('users/login.ejs',{
		title: 'login',
		users: 0
	});
});
/* Check users login . */
router.post('/login', function(req, res) {

		var request = req.body;	
	$where = {
		role_id: { $ne: 1 },
		// status: { $ne: 4 },
		 $or: [
	        {
	            email: 
	            {
	                $eq: req.body.email
	            }
	        }, 
	        {
	            username: 
	            {
	                $eq: req.body.email
	            }
	        }
	       
	    ]

	};  

	Users.findOne({
		where: $where,
		include: [{
			model: Roles
			}]
		}).then( function( users ){
			//console.log(JSON.stringify(users , null, 4));
			if(users){

				 if(users.otp_verified == 0 && users.email_status == 0){
					req.flash('errormsg', 'Your Phone number and Email is not verified.');
					res.redirect('/users/resendotpl/'+users.id);
				}


				else if(users.email_status == 0 && users.otp_verified == 1){
					req.flash('errormsg', 'Your account is not verified. Please check your mail.');
					res.render('users/login.ejs',{
						title: 'login',
						users: request

					});
				}
				else if(users.otp_status == 0 && users.email_status == 1){
					req.flash('errormsg', 'Your phone number is not verified.');
					res.render('/users/otpl/'+users.id);
				}

				else if(users.status == 4){
					req.flash('errormsg', 'Your account is currently inactive. Please contact admin.');
					res.render('users/login.ejs',{
						title: 'login',
						users: request

					});
				}

				else if(users.password!=md5(req.body.password)){
					req.flash('errormsg', 'Please enter a valid password.');
					res.render('users/login.ejs',{
						title: 'login',
						users: request

					});
				}

				else if(users.deact_status == 0){
					req.flash('errormsg', 'Your account is not active.');
					res.render('users/login.ejs',{
						title: 'login',
						users: request

					});
				}

				else if(users.password==md5(req.body.password) && users.status == 1  ){

					req.session.currentUser = users;
					console.log("Hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
					Users.update(
							{ login_status: 1 },
							{ where: { id: users.id } }
					).then(function(rese, err) {
	    				if (rese) {
	    					console.log("Online");
	    					// req.flash('errormsg', 'Please enter a valid password.');
							res.redirect('/users/my_profile');
	    	    		} 
						else {
				 				console.log("Offline");		
							}	

	    			});	
	    		}	

			}
			else{
				console.log("hfudfsdusdvbsbsbcvbcv");
				req.flash('errormsg', 'User does not exist');
				res.render('users/login.ejs',{
					title: 'login',
					users: request

				});
			}	
		}).catch(function( e ){
			req.flash('errormsg', e);
			res.render('users/login.ejs',{
				title: 'login',
				users: request

			});

		});	
});

router.get('/otpl/:id', function(req, res) {

			res.render('users/loginotp.ejs', {
				
				resultset: req.params.id
			});
});

router.post('/otpl/:id', function(req, res) {

	console.log(req.params.id);
	console.log(req.body.ot);

	Otps.findOne(
			{ where: {user_id: req.params.id,
					 is_expired: 0}
			 }
			
		).then(function(rese,err){
			
			// var today = dateFormat(new Date(), "dd, mm, yyyy, hh:MM:ss ");
			var today = new Date();
			console.log(today);
			console.log(rese.created);
			var diff = Math.abs(today - rese.created);
			var minutes = Math.floor((diff/1000)/60);
			console.log(minutes);
			// console.log(diffMins);
				if(minutes<3){
					if(rese.otp == req.body.ot){
						console.log("MATCH");

						Users.findOne(
								{ where: {id: req.params.id} }
								
							).then(function(users, err) {

								
							})

							Users.update(
									{otp_verified: 1 },
									{ where: { id: req.params.id } }
							)

							Otps.update(
									{ is_expired: 1 },
									{ where: { user_id: req.params.id } }
							).then(function(resu, err) {

								if(resu){


								Users.findOne(
									{ where: {id: req.params.id} }
								
								).then(function(users, err) {	

									if(users.email_verified!=1){
										req.flash('successmsg', 'Phone number successfully verified, please verify your mail');	
										res.redirect('/users/login');
									}

									else{

											Users.update(
					  							{ status: 1 },
					  							{ where: { id: req.params.id } }
											)

										Users.update(
				  							{ login_status: 1 },
				  							{ where: { id: req.params.id } }
										).then(function(rese, err) {
						    				if (rese) {
						    					console.log("Online")
						    	    		} 
											else {
				  				 				console.log("Offline");		
				  							}	

				    					});	


										req.flash('successmsg', 'Phone number successfully verified');	
										res.redirect('/users/my_profile');
									}

								})


								}
							
							
						 		
							})

					}

					else {
						req.flash('errormsg', 'Wrong OTP please try again');
						res.redirect('/users/otpl/'+req.params.id);
					}
				}	

				else{
						Otps.update(
								{ is_expired: 1 },
								{ where: { user_id: req.params.id } }
						).then(function(resu, err) {
							req.flash('errormsg', 'OTP expired please try resending the OTP');
							res.redirect('/users/otpl/'+req.params.id);
							
					})
				}
		
		})		
  
});

router.get('/resendotpl/:id', function(req, res){

console.log(req.params.id);
	Users.findOne(
			{ where: {id: req.params.id} }
			
		).then(function(rese,err){
				console.log(rese);
		
				var authkey = '216948AYpOsH0y5b069116';
				//for single number
				var number=rese.phone;
				 
				//message
				var ran = random(9999);
				var message="OTP For Hider " + ran;
				 
				//Sender ID
				var senderid='Hider';
				 
				var dialcode='+91';
			 
			 
				msg91.send(number, message, function(err, response){
				    console.log(err);
				    console.log(message);
				    console.log(response);

				    if(response){

				    	Otps.update(
						{ is_expired: 1},
						{ where: { user_id: req.params.id } }
							).then(function(resu, err) {

									if(resu){
										Otps.create({
											user_id: req.params.id,
											otp: ran,
											is_expired: 0,
										 }) .then(function(data, err) {

											 	if(data){

											 		req.flash('successmsg', 'OTP re-sent on your mobile');
											 		res.redirect('/users/otpl/'+req.params.id);
											 	}	

										 	})
									}
							})
				    }
				});
		})		
	
})

/* GET Users My Profile */
router.get('/my_profile',session_auth.frontend, function(req, res) {
	//console.log(req.session.currentUser.id);
	//console.log(baseUrl);
	Users.findOne({
		where: {
			id: req.session.currentUser.id
		}
	}).then(function(user) {		
		var date = dateFormat(user.date_of_birth, "dd-mm-yyyy");
		res.render('users/my_profile.ejs', {
			title: 'My Profile',
			page_name: 'viewUser',
			resultset:user,
			date: date
		});
	});
});

router.get('/home', function(req, res) {
  res.render('users/home');
});

router.get('/updateprofile', session_auth.frontend, function(req, res) {
		
	Users.findOne({ where: { id: req.session.currentUser.id } })
		.then( function( user ) { 
			res.render('users/updateprofile.ejs', {
				title: 'Update Profile',
				moment:moment,
				resultset:user
			});
		}).catch(function( e ){
			res.render('users/updateprofile.ejs', {
				title: 'Update Profile',
				moment:moment,
				resultset:'' 
			});
		});
});
				
 router.post('/updateprofile', session_auth.frontend, function(req, res) {
	
	
	var form = new formidable.IncomingForm();
	
    form.parse(req, function(err, fields, files) {
    
/*Update cover Photo*/



if( files.bfile.size !=0 && files.file.size !=0){
		console.log("Anish");
		console.log(files.bfile.size);
	         var old_path = files.bfile.path,
	             file_size = files.bfile.size,
	             file_ext = files.bfile.name.split('.').pop(),
	           
	             file_name =moment().valueOf() + '.' + file_ext,
	             new_path = path.join(process.env.PWD, '/public/user_cover_images/', file_name);

	        var old_path2 = files.file.path,
	             file_size2 = files.file.size,
	             file_ext2 = files.file.name.split('.').pop(),
	           
	             file_name2 =moment().valueOf() + '.' + file_ext,
	             new_path2 = path.join(process.env.PWD, '/public/user_images/', file_name2);

	           	
	         fs.readFile(old_path, function(err, data) {
	             fs.writeFile(new_path, data,{ mode: 0o777 }, function(err) {
	                 fs.unlink(old_path, function(err) {
	                     if (err) {
	                         req.flash('errormsg', 'Profile not updated2.');
							 res.redirect('/users/updateprofile');
	                     } else {
	                     	fs.readFile(old_path2, function(err, data) {
	             			fs.writeFile(new_path2, data,{ mode: 0o777 }, function(err) {
	                 		fs.unlink(old_path2, function(err) {
		                 		if(err){	
		                			req.flash('errormsg', 'Profile not updated2.');
								 	res.redirect('/users/updateprofile');
								}	
								else{
									var request = fields;
							    	var date = dateFormat(request.date_of_birth, "yyyy-mm-dd");
									request.date_of_birth = date;
								 	request.cover_image = file_name;
								 	request.profile_image = file_name2;


									 Users.update(request,{where:{id : req.session.currentUser.id }}).then(function(newUser) {
									 	req.flash('successmsg', 'Profile updated successfully.');
									 	res.redirect('/users/updateprofile');
									 }).catch(function( e ){
									 	req.flash('errormsg', 'Profile not updated.');
									 	res.redirect('/users/updateprofile');
									 });
								}
	                 		})
	                 		})
	                 		})

		                     		
	                     }
	                 });
	             });
	         });
 }

/*Update Cover Photo*/


  	if( files.file.size !=0 && files.bfile.size ==0){
	        var old_path = files.file.path,
	            file_size = files.file.size,
	            file_ext = files.file.name.split('.').pop(),
	           
	            file_name =moment().valueOf() + '.' + file_ext,
	            new_path = path.join(process.env.PWD, '/public/user_images/', file_name);

	           	
	        fs.readFile(old_path, function(err, data) {
	            fs.writeFile(new_path, data,{ mode: 0o777 }, function(err) {
	                fs.unlink(old_path, function(err) {
	                    if (err) {
	                        req.flash('errormsg', 'Profile not updated2.');
							res.redirect('/users/updateprofile');
	                    } else {
	                    	var request = fields;
					    	var date = dateFormat(request.date_of_birth, "yyyy-mm-dd");
							request.date_of_birth = date;
							request.cover_image = file_name;
							
							console.log(request);

							Users.update({first_name: request.first_name,
										last_name: request.last_name,
										phone: request.phone,
										email: request.email,
										date_of_birth: request.date_of_birth,
										profile_image: request.profile_image	

								},
								{where:{id : req.session.currentUser.id }}).then(function(newUser) {
								req.flash('successmsg', 'Profile updated successfully.');
								res.redirect('/users/my_profile');
							}).catch(function( e ){
								req.flash('errormsg', 'Profile not updated.');
								res.redirect('/users/updateprofile');
							});	
	                    }
	                });
	            });
	        });
	    }

/*Update cover pic*/
if( files.bfile.size !=0 && files.file.size ==0){
		console.log("Anish");
		console.log(files.bfile.size);
	         var old_path = files.bfile.path,
	             file_size = files.bfile.size,
	             file_ext = files.bfile.name.split('.').pop(),
	           
	             file_name =moment().valueOf() + '.' + file_ext,
	             new_path = path.join(process.env.PWD, '/public/user_cover_images/', file_name);

	           	
	         fs.readFile(old_path, function(err, data) {
	             fs.writeFile(new_path, data,{ mode: 0o777 }, function(err) {
	                 fs.unlink(old_path, function(err) {
	                     if (err) {
	                         req.flash('errormsg', 'Profile not updated2.');
							 res.redirect('/users/updateprofile');
	                     } else {
	                     	var request = fields;
					    	var date = dateFormat(request.date_of_birth, "yyyy-mm-dd");
							request.date_of_birth = date;
							 request.cover_image = file_name;

							 // console.log(fields);
							console.log(request);

							 Users.update(request,{where:{id : req.session.currentUser.id }}).then(function(newUser) {
							 	req.flash('successmsg', 'Profile updated successfully.');
							 	res.redirect('/users/updateprofile');
							 }).catch(function( e ){
							 	req.flash('errormsg', 'Profile not updated.');
							 	res.redirect('/users/updateprofile');
							 });	
	                     }
	                 });
	             });
	         });
	    }

/*End*/
	    else{
	    	console.log("Anish");
	    	
	    	var request = fields;
	    	console.log(request);
	    	var date = dateFormat(request.date_of_birth, "yyyy-mm-dd");
			request.date_of_birth = date;
			request.profile_image = file_name;
			
			Users.update(request,{where:{id : req.session.currentUser.id }}).then(function(newUser) {
				req.flash('successmsg', 'Profile updated successfully.');
				res.redirect('/users/updateprofile');
			}).catch(function( e ){
				req.flash('errormsg', 'Profile not updated.');
				res.redirect('/users/updateprofile');
			});	
	    }
    });
 	
});

router.get('/deactivate_account', session_auth.frontend, function(req, res) {
	var request = {'deact_status':0};

	Users.update(request,{where:{id : req.session.currentUser.id }}).then(function(newUser) {
		
		req.flash('successmsg', 'Your account deactivated successfully.');
		res.redirect('/users/login');
		req.session.destroy();
	}).catch(function( e ){
		res.redirect('/users/my_profile');
	});
});
router.get('/logout', function(req, res) {
	
	var $where = { where: { id: req.session.currentUser.id } };

	Users.update({ login_status: 0 },$where).then(function(user) {
		if (!user) {
			req.session.destroy();
			res.redirect('/users/login');
		} 
		else {
			req.session.destroy();
			res.redirect('/users/login');	
		}	
	});
});
router.get('/register', function(req, res) {
	
	// var json_data = {'err':	'0','successmsg':''};
	
	var obj;
	fs.readFile('countrycode.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  else{
	  		var arr = [];
		  
		   console.log("hi");
		   var obj       =JSON.parse(data);
		   var countries =obj.countries;

		   //var countries = Object.keys(data.countries);
		   //console.log(countries);

			res.render('users/register.ejs', {
	            title: 'My Register',        
	            resultset:countries,
	            moment:moment,
	            users:0
            });
	  }
	});  

	// res.render('users/register.ejs',{
	// 	title: 'Register',
	// 	json_data:json_data
	// });
});
router.post('/register', function(req, res) {
	

	var obj;
	fs.readFile('countrycode.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  else{
	  		var arr = [];
		  
		   console.log("hi");
		   var obj       =JSON.parse(data);
		   var countries =obj.countries;


	var request = req.body;
	var fname = req.body.first_name;
	var lname = req.body.last_name;
	var username = req.body.username;
	var email = req.body.email;
	var country_code = req.body.country_code;
	var phone = req.body.phone;
	var password = md5(req.body.pass_confirmation);
	var role_id = 2;
	var status = 0;
	var login_status = 0;
	var profile_image = "";
	var profile_image_thumb = "";

	var date = dateFormat(request.date_of_birth, "yyyy-mm-dd");

	Users.find({
		raw:true,
					
		where: {
			$or:[{phone: phone}, {username:username},{email:email}]
			/*$or: [
				{
					phone: 
					{
						$eq: phone
					}
				},
				
				{
				username: 
					{
						$eq: username
					}
				}, 

				{
				email: 
					{
						$eq: email
					}
				}, 

			]*/
		}}).then(function(user){
		  if(!user){
			Users.create({
				first_name: fname,
			    last_name: lname,
			    username: username,
			    email: email,
			    gender: req.body.gender,
			    date_of_birth: date,
			    password: password,
			    country_code: req.body.country_code,
			    phone: phone,
			    role_id: role_id,
			    status: status,
			    login_status: login_status
			 })
			  .then(function(result, err) {
		    		if (err) {
		    			console.log("Not Saved");
		    			req.flash('errormsg', 'Error please try again.');	
		    			res.render('users/register.ejs', {
                            title: 'My Register',        
                            resultset:'',
                            moment:moment,
                            resultset:countries,
                            users:request
                        });
				   } 
		    		else {

		    				/*OTP*/

		    			console.log(result.id);
						Otps.update(
							{ is_expired: 1 },
							{ where: { user_id: result.id } }
												
						).then(function(rese,err){
							console.log("Done");
						})

						var authkey = '216948AYpOsH0y5b069116';
						//for single number
						
						var number = phone;
						console.log(number);
						 
						//message
						var ot = random(9999);
						var message= "OTP For Hider " + ot;
						 console.log(message);
						//Sender ID
						var senderid='Hider';
						 
						var dialcode = country_code;
					 
				 
				//send to single number
				 
					/*var message1 =msg91.sendOneandGetJson(authkey,number,message,senderid,dialcode,function(response,callback){
					 
					//Returns Message ID, If Sent Successfully or the appropriate Error Message
					callback(response);
					});*/
						msg91.send(number, message, function(err, response){
						    console.log(err);
						    console.log(message);
						    console.log(response);

						    if(response){

						    	Otps.findAll({

						    	})

						    	Otps.create({
										user_id: result.id,
										otp: ot,
										is_expired: 0,
									 }) .then(function(data, err) {

									 	console.log("Thakur");
									 	console.log(data);

									 	if(data){
									 		// req.session.currentUser = users;
									 		req.flash('successmsg', 'OTP has been sent on your registered number and verification link has been sent on your mail');
	    									
	    									res.redirect('/users/otpl/'+result.id);
									 	}

									 
									  })

						   		 }
						});
			    		/*OTP*/

		    				var transporter = nodemailer.createTransport({
					  		service: 'gmail',
					  		auth: {
					    		user: 'smtp.softprodigy@gmail.com',
					    		pass: 'S4%&gd34'
					  		}
						});


						var mailOptions = {
					  		from: 'smtp.softprodigy@gmail.com',
					  		to: email,
					  		subject: 'Verification Mail',
					  		html: 
					  		'<b>Hi</b><br> <p>Greetings For The Day.</p><br> <p>Please visit the following link to activate your account</p>  <p>'+baseUrl+'/users/verify/'+result.id+'</p> <br>Regards.<br> <p>Team Hider.</p>'
		
						};

						transporter.sendMail(mailOptions, function(error, info){
					  		if (error) {
					    	console.log(error);
					  		} else {
					    		
					    		req.flash('successmsg', 'A verification link has been sent on your mail.');
		    					
		    					res.redirect('/users/login');
					  		}
						});
						
		    		}
			  })
			
		}	
		else{
				if(user.email == email){
					req.flash('errormsg', 'Email already exists.');	
					res.render('users/register.ejs', {
                            title: 'My Register',        
                            resultset:'',
                            moment:moment,
                            resultset:countries,
                            users:request
                    });
			    }

			    if(user.phone == phone){
					req.flash('errormsg', 'Phone number already exists.');	
					res.render('users/register.ejs', {
                            title: 'My Register',        
                            resultset:'',
                            moment:moment,
                            resultset:countries,
                            users:request
                    });
				}

			    if(user.username == username){
					req.flash('errormsg', 'Username already exists.');	
					res.render('users/register.ejs', {
                            title: 'My Register',        
                            resultset:'',
                            moment:moment,
                            resultset:countries,
                            users:request
                    });
			    }
				
			}
	    });
	  }
	}); 
});	
router.get('/verify/:id', function(req, res) {
	console.log("Anish");
	req.session.currentUser = null;
	var id = req.params.id;

		Users.findOne({ 
			where: {id: id} 
		}).then(function(rese,err){
			console.log(rese);
			if(rese.email_verified == 1){
				req.flash('errormsg', 'Email already verified. Please Login');
				res.redirect('/users/login');
			}	
			else{
				Users.update({email_verified: 1 },
					{ where: { id: id } 
				}).then(function(rese, err) {
					if (rese){
						Users.findOne({ 
							where: {id: id} 
						}).then(function(users, err) {	
							if(users.otp_verified!=1){
								req.flash(
									'successmsg', 'Email successfully verified, please verify your phone number');	
								res.redirect('/users/otpl/'+req.params.id);
							}
							else{

								Users.update(
									{ status: 1 },
									{ where: { id: id } }
								)

								Users.update(
		  							{ login_status: 1 },
		  							{ where: { id: req.session.currentUser.id } }
								).then(function(rese, err) {
				    				if (rese) {
				    					console.log("Online")
				    	    		} 
									else {
		  				 				console.log("Offline");		
		  							}	

				    			});	
								req.flash('successmsg', 'Email verified successfully.');
								res.redirect('/users/login');
							}

						})	



					} 
					else {
						console.log("Not Saved");		
					}	
				});
			}
		 })	

});

/* User Profile */

router.get('/view',session_auth.frontend, function(req, res) {
	var user_id = req.query.user_id;
	console.log(user_id);
	Users.findOne({
		where: {
			id: req.query.user_id
		},
		include: [{
			model: Roles
		},
		{
			model: blockUsers,
			as: 'blockUsers'
			//where: { user_id: 1 }	
		}
		]
	}).then(function(user) {		
		res.render('users/view.ejs', {
			'title': 'View',
			'resultset':user,
			'userId': user_id
		});
	})
});

router.get('/secretmsg/:id', session_auth.frontend, function(req, res) {
  id = req.params.id;
  console.log(id);
  res.render('users/secretmessage.ejs');
});

router.post('/secretmsg/:id', session_auth.frontend, function(req, res) {
  var userid = req.params.id;
  var comment = req.body.comment;
  var conversation_id = randomstring.generate();
  var receiver_id;
  var status = 1;
  var type = 1;

console.log(req.session.currentUser.id);
  	Users.findOne({
		where: {
			id: userid
		}
	}).then(function(res, err) {
			if (res) {
				Conversations.create({
					conversation_id: conversation_id,
					sender_id: req.session.currentUser.id,
					receiver_id: userid,
					message: comment,
					conversation_type: type
				
			})
				.then(function(res, err) {
					if (err) {
						console.log("Not Saved");
					
		   			}
		   			else{
		   				console.log("Saved");
		   			}

				});
		    } 
			else {
			 	  console.log("Try Again");
				}	

       });
	
});	

router.get('/getmessage', session_auth.frontend, function(req, res) {
  
 	/*Conversations.findAll({
		where: {
			receiver_id: req.session.currentUser.id,
			conversation_type: 1
		}
	}).then(function(result, err) {
			if (result) {
				console.log(result);
				res.render('users/getmessage.ejs', {
					
					'msg_data': result
				});
			}	
	})*/
	res.render('users/getmessage.ejs', {
		
		'msg_data': ''
	});

});

router.get('/aboutus', function(req, res) {
  res.render('users/aboutus');
});

router.get('/contactus', function(req, res) {
	console.log("ANISH");
	contactus_subject.findAll().then(function(result, err){
		if(result){
			res.render('users/contactus',{'resultset':result})
		}

	})
  // res.render('users/contactus');
  
});
router.post('/contactus', function(req, res) {
  
  var name 		= req.body.name;
  var phone     = req.body.phone;
  var subject 	= req.body.subject;
  var email 	= req.body.email;
  var message 	= req.body.message;
  
  var request	= {'name':name,'phone':phone,'subject':subject,'email':email,'message':message}; 
  
  contactus.create(request).then(function(result, err) {
	
		if(err){
			console.log("Not Saved");
		}
		else{
			var transporter = nodemailer.createTransport({
	  			service: 'gmail',
	  			auth: {
	    			user: 'smtp.softprodigy@gmail.com',
	    			pass: 'S4%&gd34'
	  			}
			});
			var mailOptions = {
				from: 'smtp.softprodigy@gmail.com',
				to: 'anishvishu@gmail.com',
				subject: subject,
				html: 
				'<b>Hi</b><br><p>You have a message from User.</p><b>Sent By</b><br><p>Name: '+name+'</p> <p>Email: '+email+'</p> <p>Phone: '+req.body.phone+'</p> <p>Message: '+message+'</p> <br>Regards.<br> <p>Team Hider.</p>'
			};

			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					req.flash('errormsg', 'Could not send message please try again.');
					res.redirect('/users/contactus');
				}else{
					// console.log('Email sent: ' + info.response);
					req.flash('successmsg', 'Thank-You for the message.');
					res.redirect('/users/contactus');
				 }
			});
		}
	});
});


router.get('/forgetpass', function(req, res) {
  
	res.render('users/forgetpass.ejs',{
	title: 'login',
	users: 0
	});
});

router.post('/forgetpass', function(req, res) {
  var email = req.body.email;

  Users.findOne({
  	where: {email: email}
  }).then(function(result, err) {
					if (err) {
						req.flash('errormsg', 'Some error occured please try again');
	    				res.render('users/forgetpass.ejs',{
							title: 'login',
							users: req.body.email
						});
		   			}
		   		

		   			else if(result){

		    				var transporter = nodemailer.createTransport({
						  		service: 'gmail',
						  		auth: {
						    		user: 'smtp.softprodigy@gmail.com',
						    		pass: 'S4%&gd34'
						  		}
							});


						var mailOptions = {
					  		from: 'smtp.softprodigy@gmail.com',
					  		to: email,
					  		subject: 'Reset Password',
					  		html: 
					  		'<b>HI</b><br> <p>Greetings for the day.</p><br> <p>Please visit the following link to reset your password</p>  <p>'+baseUrl+'/users/resetpass/'+result.id+'</p> <br>Regards.<br> <p>Team Hider.</p>'
		
						};

						transporter.sendMail(mailOptions, function(error, info){
					  		if (error) {
					    	console.log(error);
					  		} else {					    		
					    		req.flash('successmsg', 'Link to reset password sent on your email.');
		    					res.redirect('/users/login');
					  		}
						});
						
		    		}

		    		else {
		    			
		    				req.flash('errormsg', 'Email id not registered');
	    					res.render('users/forgetpass.ejs',{
								title: 'login',
								users: req.body.email
							});
		    		}

	 });
		   
});

router.get('/resetpass/:id', function(req, res) {
  res.render('users/resetpass');
});

router.post('/resetpass/:id', function(req, res) {

  var id = req.params.id;
  var pa = req.body.password;
  var password = md5(pa);

		Users.update(
				{ password: password },
				{ where: { id: id } }
		  ).then(function(rese, err) {
					if (rese) {
						req.flash('successmsg', 'Password Changed.');
						res.redirect('/users/login');
					} 
					else {
						console.log("Not Saved");		
					}	
			});
		

});


router.get('/changepass', session_auth.frontend, function(req, res) {
  res.render('users/changepass');
});

router.post('/changepass', session_auth.frontend, function(req, res) {
  var pass = md5(req.body.pass);
  var newpass = md5(req.body.newpass);

  Users.findOne({
  	where: {id : req.session.currentUser.id}
  }).then(function(rese, err) {
				if (pass == rese.password ) {

					Users.update(
							{ password: newpass },
							{ where: { id: req.session.currentUser.id } }
		  			).then(function(rese, err) {
						if (rese) {
							req.flash('successmsg', 'Password Changed.');
							res.redirect('/users/changepass');
						} 
						else {
							req.flash('errormsg', 'Password Not Changed, please try again.');
							res.redirect('/users/changepass');		
						}	
					});		
						
				} 
					else {
							req.flash('errormsg', 'Incorrect previous password, please try again.');
							res.redirect('/users/changepass');			
					}	
	});
		
});

//pankaj
router.get('/vehicledetails_show', function(req, res) {
  console.log("PANKAJMEHAT");
    	Vehicle.findAll().then(function(result, err){
			if(result){
				res.render('users/vehicledetails_show.ejs',{'resultset':result});
			}else{
				res.render('error.ejs');
			}
	});
});

router.get('/vehicledetails_edit/:id', function(req, res){
  	var id = req.params.id;
  	 Vehicle.findAll({where : {'id': id}}).then(function(result, err){
			if(result){
				res.render('users/vehicledetails_edit.ejs',{'resultset':result});
			}else{
				res.render('error.ejs');
			}
	});
  	
});

router.post('/vehicledetails_update', function(req, res){

	var id = req.body.id;

  	var maker = req.body.maker;
    var type = req.body.type;
  	var model =req.body.model;
  	var number =req.body.number;
  	Vehicle.update({
		make: maker,
	    type: type,
	    model: model,
	    number: number
	 },
	 {
	 	where:{ 'id' : id }
	 }).then(function(newUser) {
		res.redirect('/users/vehicledetails_show');
		});	
});

router.get('/vehicledetails_add', function(req, res) {
  res.render('users/vehicledetails_add.ejs');
});

router.post('/vehicledetails_add', function(req, res) {
  //console.log(req.body);
    var maker = req.body.maker;
    var type = req.body.type;
  	var model =req.body.model;
  	var number =req.body.number;
  	Vehicle.create({
				make: maker,
			    type: type,
			    model: model,
			    number: number
			 })
			  .then(function(result, err) {
			if (err){
				res.send({"status":{"code":500,"message":"Something went wrong"}});
			}
			else {
  				 res.redirect('/users/vehicledetails_show')		
  			}	

    });

});

router.get('/vehicledetails_delete/:id', function(req, res) {
 Vehicle.destroy({
		where : {
			'id' : req.params.id
		}
	}).then(function(result, err){
		if(result)
			res.redirect('/users/vehicledetails_show');
		else
			res.render('error.ejs');
	});
});
//pankaj

/* Movable */

router.get('/movable_prop', session_auth.frontend, function(req, res) {
  Vehicle.findAll({}).then (function(result, err){
	if(result){
		console.log(result);
		res.render('users/showmovab',{'dataset':result})
	}


  })
});

router.get('/add_mova', session_auth.frontend, function(req, res) {
	res.render('users/add_mov.ejs');
});

router.post('/add_mova', session_auth.frontend, function(req, res) {
	console.log(req.body.regno);
	console.log(req.body.type);
	console.log(req.body.make);
	console.log(req.body.model);

	Vehicle.create({
		reg_no: req.body.regno,
		type: req.body.type,
		make: req.body.make,
		model: req.body.model
	}).then(function(result, error){
		if(result){
			req.flash('successmsg', 'Phone number successfully verified, please verify your mail');
			res.redirect('/users/movable_prop');	
		}	
		else{
			res.render('error.ejs');
		}
	})
});

router.get('/mov_delete/:id', session_auth.frontend, function(req, res) {
  Vehicle.destroy({
	where : {
		'id' : req.params.id
	}
  }).then (function(result, err){
	if(result){
		
		res.redirect('/users/movable_prop');
	}


  })
});

router.get('/mov_edit/:id', session_auth.frontend, function(req, res) {
  Vehicle.findOne({
	where : {
		'id' : req.params.id
	}
  }).then (function(result, err){
	if(result){
		res.render('users/movedit',{'dataset':result})
	}


  })
});

router.post('/mov_edit/:id', session_auth.frontend, function(req, res) {
	Vehicle.update(
		{	reg_no: req.body.regno,
			type: req.body.type,
			make: req.body.make,
			model: req.body.model },
		{ where: { id: req.params.id } 
					
  }).then (function(result, err){
	if(result){
		res.redirect('/users/movable_prop');
	}


  })
});


/* IMMovable */

router.get('/immovable_prop', session_auth.frontend, function(req, res) {
  Property.findAll({}).then (function(result, err){
	if(result){
		console.log(result);
		res.render('users/showimmovab',{'dataset':result})
	}
  })
});

router.get('/add_immova', session_auth.frontend, function(req, res) {
		
	var obj;
	fs.readFile('countrycode.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  else{
	  		var arr = [];
		  
		   console.log("hi");
		   var obj       =JSON.parse(data);
		   var countries =obj.countries;

		   //var countries = Object.keys(data.countries);
		   //console.log(countries);

			res.render('users/add_immov.ejs', {
	            title: 'My Register',        
	            resultset:countries,
            });
	  }
	});  
});

router.post('/add_immova', session_auth.frontend, function(req, res) {


	Property.create({
		address: req.body.address,
		type: req.body.type,
		country: req.body.country_code
	}).then(function(result, error){
		if(result){
			req.flash('successmsg', 'Property successfully added');
			res.redirect('/users/immovable_prop');	
		}	
		else{
			res.render('error.ejs');
		}
	})
});

router.get('/immov_delete/:id', session_auth.frontend, function(req, res) {
  Property.destroy({
	where : {
		'id' : req.params.id
	}
  }).then (function(result, err){
	if(result){
		
		res.redirect('/users/immovable_prop');
	}


  })
});

router.get('/immov_edit/:id', session_auth.frontend, function(req, res) {
  Property.findOne({
	where : {
		'id' : req.params.id
	}
  }).then (function(result, err){
	if(result){
		res.render('users/immovedit',{'dataset':result})
	}


  })
});

router.post('/immov_edit/:id', session_auth.frontend, function(req, res) {
	Property.update(
		{	
			address: req.body.address,
			type: req.body.type,
			country: req.body.country },
		{ where: { id: req.params.id } 
					
  }).then (function(result, err){
	if(result){
		res.redirect('/users/immovable_prop');
	}


  })
});


module.exports = router;
