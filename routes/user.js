var express = require('express');
var router = express.Router();
var User = require('../db/models/user');
const bcrypt = require('bcrypt');

router.get('/register', (req, res)=>{
	//console.log(req.session.registerErrors);
	res.render('register');
});

router.post('/register',async (req, res)=>{
	let user = await User.findOne({email: req.body.email})
	console.log("user", user);
	if(!user) {
		
	console.log(req.body);
	const new_user = new User(req.body);
	try
	{
		await new_user.save();
		console.log("saved")
	} catch(e) {
			//console.log(registerErrors);
			return res.render('register',{
				errors: req.flash('registerErrors')
			});
	}
	} else {
		return res.redirect('/user/register');
	}
	res.redirect('/user/login');
});

router.get('/login', (req, res)=>{

	res.render('login');
});

router.post('/login', (req, res)=>{

	const form_email = req.body.email;
	User.findOne({email: form_email},(err,user)=>{
		if(!user)
		{
			console.log(err);
			res.redirect('/');
		}
		else
		{
			bcrypt.compare(req.body.pwd,user.pwd,(err,same)=>{
				console.log(same);
				if(same)
				{
					req.session.userId = user._id;
					//console.log(req.session);
					console.log('Success');
					res.redirect('/');
				}
				else
				{
					console.log(err + 'if this');
					return res.redirect('/');
				}
			});
		}
	})

});

router.get('/logout', (req, res)=>{

	if(req.session.userId){
		req.session.destroy(()=>{
		res.redirect('/');
	});
	}
	else {
		res.redirect('/about');
	}
});


router.get('/profile/:id',async (req,res)=>{

	const user= await User.find({_id:req.params.id});
	const posts= await Post.find({ user_id: {_id:req.params.id}});
	//console.log(user);
	if(!user){
		return res.redirect('/about');
	}
	else{
		res.render('user',{
			user,
			posts:posts
		});
	}
	if(req.session.userId)
	{
		/*const id = req.params.id;
		User.findOne({_id: id},(err,user)=>{
			if(err || !user){
				return res.redirect('/about');
			}
			else{
				res.render('user',{
					user,
					posts:posts
				});
			}
		});*/
	}
	else
	{
		res.redirect('/about');
	}

});

router.get('/profile/:id/edit',async (req,res)=>{

	
	const user= await User.find({_id:req.session.userId});
	if(req.session.userId === req.params.id)
	{
		res.render('bioupdate',{
			user: user
		});
	}
	else
	{
		res.redirect('about');
	}

});

router.post('/profile/:id/edit',(req,res)=>{

	User.updateOne({_id: req.params.id},{
		$set:{
			bio: req.body.bio
		}
	},(err,user)=>{
		console.log('Updated');
		res.redirect('/');
	});

});

module.exports = router;