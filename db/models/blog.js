const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const blogSchema = new mongoose.Schema({
	title:{
		type: String,
		required: [true, 'Please Enter the Title']
	},
	content:{
		type: String,
		required: [true, 'Please Enter the Content']
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId
	},
	date: {
		type: Date,
		default: new Date
	},
	imageUrl: {
		type: String
	}
});

const Blog = mongoose.model('Blog',blogSchema);	//represents a collections and its obj repesents a document

module.exports = Blog;