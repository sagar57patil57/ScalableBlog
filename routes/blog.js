var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Blog = require('../db/models/blog');
var authChecker = require('../middleware/authcheck');
const { clearHash } = require('../services/cache');


//GET ALL BLOG
router.get('/mine', authChecker, async (req, res)=>{

	let blogs = await Blog.find({ userId: req.session.userId }).sort('date')//.cache({ key: req.session.userId });
	res.render('blogs', {
		blogs
	});
});


//ADD FORM
router.get('/add', authChecker, (req, res)=>{

	res.render('addBlog');
});


//ADD BLOG
router.post('/add', authChecker, async (req, res)=>{

	let userObj = {
		title: req.body.title,
		content: req.body.content,
		userId: req.session.userId,
		imageUrl: req.body.imageUrl
	}
	console.log(userObj);
	let blog = new Blog(userObj);
	await blog.save();
	clearHash(req.session.userId);
	res.redirect('/blog/mine');
});




module.exports = router;