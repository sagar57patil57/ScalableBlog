const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);	//	create redis client

//	promisify is used so that we can use await on redis.get()
client.hget = util.promisify(client.hget);

//	store reference of original exec
const exec = mongoose.Query.prototype.exec;


//	.CACHE() will help to cache only required queries
mongoose.Query.prototype.cache = async function( options = {} ) {	
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || '');
	return this;	//	return is used so that cache() can be chainable eg. .sort().limit().cache()
}




//	RETURN TYPE: mongoose documents
mongoose.Query.prototype.exec = async function() {	//	override exec

	if(!this.useCache) {	//	if .cache() is not used then go to mongodb
		return exec.apply(this, arguments);
	}

	//	generate key => query + collectionName eg. "{ userId: '21', collection: 'blog' }" is key
	let key = Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name })

	//	convert key into string
	key = JSON.stringify(key)


	//	retrieve from redis
	const cacheValue = await client.hget(this.hashKey, key)

	//	if present in redis return
	if(cacheValue) {
		console.log("from redis");

		//	string to obj or array of obj
		let doc = JSON.parse(cacheValue);

		//	if array then map and convert each obj to document else if doc=object then convert it into document
		return Array.isArray ? doc.map(d => new this.model(d))
							 : new this.model(doc); 
	}

	//	else query in mongodb and store in redis

	let result = await exec.apply(this, arguments);	//	run original exec
	client.hset(this.hashKey, key, JSON.stringify(result));

	console.log("from mongodb");
	return result;
}

module.exports = {
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey));
	}
}