var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Blog = require('../db/models/blog');
var authChecker = require('../middleware/authcheck');
var AWS = require('aws-sdk');
var keys = require('../config/dev');
var uuid = require('uuid');

const s3 = new AWS.S3({
	accessKeyId: keys.accessKeyId,
	secretAccessKey: keys.secretAccessKey,
	region:"ap-south-1"
})

//RETURNS PRESIGNED URL
router.get('/', authChecker, async (req, res)=>{

	let key = `${req.session.userId}/${uuid()}.png`;
	s3.getSignedUrl('putObject', {
		Bucket: 'my-blog-bucket-57',
		ContentType: 'image/png',
		Key: key
	}, (err, url) => {
		res.send({ key, url });
	});

});

module.exports = router;