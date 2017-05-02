import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { moment } from 'meteor/momentjs:moment';
import { Counts } from 'meteor/tmeasday:publish-counts';

//collection
//import { NotificationHistory } from '../notification_history.js';
import { ActivityStream } from '../activitystream.js';
import { Citoyens } from '../citoyens.js';
import { News } from '../news.js';
import { Documents } from '../documents.js';
import { Cities } from '../cities.js';
import { Events } from '../events.js';
import { Organizations } from '../organizations.js';
import { Projects } from '../projects.js';
import { Comments } from '../comments.js';
import { Lists } from '../lists.js';

import { nameToCollection } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Citoyens = Citoyens;

Events._ensureIndex({
	"geoPosition": "2dsphere"
});
Projects._ensureIndex({
	"geoPosition": "2dsphere"
});
Organizations._ensureIndex({
	"geoPosition": "2dsphere"
});
Citoyens._ensureIndex({
	"geoPosition": "2dsphere"
});
Cities._ensureIndex({
	"geoShape": "2dsphere"
});
/*collection.rawCollection().createIndex(
{ geoPosition: "2dsphere"},
{ background: true }
, (e) => {
if(e){
	console.log(e)
}
});*/

Meteor.publish('smartcitizenSearch', function(query) {
  const self = this;
  try {
    const response = HTTP.get('https://api.smartcitizen.me/v0/search?q=', {
      params: {
        q: query
      }
    });
//{"id":4123,"type":"Device","name":"Oceatoon 2","description":"reseau de capteur SCK Réunion ","owner_id":579,"owner_username":"oceatoon","city":"La Rivière Saint-Louis","url":"http://api.smartcitizen.me/v0/devices/4123","country_code":"RE","country":"Réunion"}
    _.each(response.data, function(item) {
			if(item.id){
				const response = HTTP.get(item.url);
      const doc = item;

      self.added('smartcitizen', Random.id(), doc);
		}
    });
    self.ready();
  } catch(error) {
    console.log(error);
  }
});

Meteor.publish('globalautocomplete', function(query) {
	check(query,{
	name: String,
	searchType: Array,
	searchBy:String,
	indexMin:Number,
	indexMax:Number
		});

  const self = this;
  try {
    const response = HTTP.post(`${Meteor.settings.endpoint}/communecter/search/globalautocomplete`, {
      params: query
    });

	  _.each(response.data, function(item) {
      const doc = item;
      self.added('search', Random.id(), doc);
    });
    self.ready();
  } catch(error) {
    console.log(error);
  }
});

Meteor.publish('lists', function(name) {
	if (!this.userId) {
		return;
	}
	check(name, String);
	/*countries
	public
	typeIntervention
	listRoomTypes
	eventTypes
	NGOCategories
	localBusinessCategories
	tags*/
	let lists = Lists.find({name:name});
	return lists;
});

Meteor.publish('notificationsUser', function() {
	if (!this.userId) {
		return;
	}
	return ActivityStream.find({
		'notify.id': {
			$in: [this.userId]
		}
	}, {
		sort: {
			'created': 1
		}
	});
});

//co2
/*Meteor.publish('notificationsUser', function() {
	if (!this.userId) {
		return;
	}
	return ActivityStream.find({
		'notify.id': {
			$in: [this.userId]
		}
	}, {
		sort: {
			'created': 1
		}
	});
});*/


	Meteor.publish('getcitiesbylatlng', function(latlng) {
		check(latlng, {latitude:Number,longitude:Number});
		if (!this.userId) {
			return;
		}

		return Cities.find({"geoShape":
		{$geoIntersects:
			{$geometry:{ "type" : "Point",
			"coordinates" : [ latlng.longitude, latlng.latitude ] }
		}
	}
});
});

Meteor.publish('cities', function(cp,country) {
	if (!this.userId) {
		return;
	}
	check(cp, String);
	check(country, String);
	let lists = Cities.find({'postalCodes.postalCode':cp,country:country});
	return lists;
});

Meteor.publish('citoyen', function() {
	if (!this.userId) {
		return;
	}
	let objectId = new Mongo.ObjectID(this.userId);
	let citoyen = Citoyens.find({_id:objectId},{fields:{pwd:0}});
	return citoyen;
});


Meteor.publish('geo.dashboard', function(latlng,radius) {
	const query = {};
	if(radius){
		query['geoPosition'] = {
			$nearSphere: {
				$geometry: {
					type: "Point",
					coordinates: [latlng.longitude, latlng.latitude]
				},
				$maxDistance: radius
			}};
	}else{
		query['geoPosition'] = {
			$geoIntersects: {
				$geometry:{
					"type" : latlng.type,
					"coordinates" : latlng.coordinates
				}
			}
		};
	}

	Counts.publish(this, 'countScopeGeo.events', Events.find(query));
	Counts.publish(this, 'countScopeGeo.organizations', Organizations.find(query));
	Counts.publish(this, 'countScopeGeo.projects', Projects.find(query));

	query['_id'] = {$ne: new Mongo.ObjectID(this.userId)};
	Counts.publish(this, 'countScopeGeo.citoyens', Citoyens.find(query));

});


//Geo scope
//scope string collection
//latlng object
//radius string
Meteor.publishComposite('geo.scope', function(scope,latlng,radius) {
	//check(latlng, Object);
	check(scope, String);
	check(scope, Match.Where(function(name) {
		return _.contains(['events', 'projects','organizations','citoyens'], name);
	}));
	const collection = nameToCollection(scope);
	if (!this.userId) {
		return;
	}
	return {
		find: function() {
			const options = {};
			options['_disableOplog'] = true;
			if(scope === 'citoyens'){
				options['fields'] = {pwd:0};
			}
			const query = {};
			if(radius){
				query['geoPosition'] = {
					$nearSphere: {
						$geometry: {
							type: "Point",
							coordinates: [latlng.longitude, latlng.latitude]
						},
						$maxDistance: radius
					}};
			}else{
				query['geoPosition'] = {
					$geoIntersects: {
						$geometry:{
							"type" : latlng.type,
							"coordinates" : latlng.coordinates
						}
					}
				};
			}
			if(scope === 'citoyens'){
				query['_id'] = {$ne: new Mongo.ObjectID(this.userId)};
			}

				Counts.publish(this, `countScopeGeo.${scope}`, collection.find(query), { noReady: true });
				return collection.find(query,options);
		},
		children: [
			{
				find: function(scopeD) {
					return scopeD.documents();
				}
			}
		]}
	});




	Meteor.publishComposite('scopeDetail', function(scope,scopeId) {
		check(scopeId, String);
		check(scope, String);
		check(scope, Match.Where(function(name) {
			return _.contains(['events', 'projects','organizations','citoyens'], name);
		}));
		let collection = nameToCollection(scope);
		if (!this.userId) {
			return;
		}
		return {
			find: function() {
				const options = {};
				//options['_disableOplog'] = true;
				if(scope === 'citoyens'){
					options['fields'] = {pwd:0};
				}
				if(scope === 'events'){
					Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
				}
				return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
			},
			children: [
				{
					find: function(scopeD) {
						if(scope === 'events'){
						return scopeD.listEventTypes();
					} else if(scope === 'organizations'){
						return scopeD.listOrganisationTypes();
					}
					}
				},
				{
					find: function(scopeD) {
						return Citoyens.find({
							_id: new Mongo.ObjectID(scopeD.creator)
						}, {
							fields: {
								'name': 1
							}
						});
					}
				},
				{
					find: function(scopeD) {
						if(scopeD && scopeD.address && scopeD.address.postalCode){
							return Cities.find({
								'postalCodes.postalCode': scopeD.address.postalCode
							});
						}
					}
				},
				{
					find: function(scopeD) {
						return scopeD.documents();
					}
				}
			]}
		});

		Meteor.publishComposite('directoryList', function(scope,scopeId) {
			check(scopeId, String);
			check(scope, String);
			check(scope, Match.Where(function(name) {
				return _.contains(['events', 'projects','organizations','citoyens'], name);
			}));
			let collection = nameToCollection(scope);
			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					const options = {};
					//options['_disableOplog'] = true;
					if(scope === 'citoyens'){
						options['fields'] = {pwd:0};
					}
					if(scope === 'events'){
						//Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
					}
					return collection.find({_id:new Mongo.ObjectID(scopeId)},options);
				},
				children: [
					{
						find: function(scopeD) {
							return Lists.find({name:{$in:['eventTypes','organisationTypes']}});
						}
					},
					{
						find: function(scopeD) {
						if(scope === 'citoyens'){
							return scopeD.listFollowers();
						}else if(scope === 'organizations'){
							return scopeD.listFollowers();
						}else if(scope === 'projects'){
							return scopeD.listFollowers();
						}
					},
					children: [
						{
							find: function(scopeD) {
								return scopeD.documents();
							}
						}
					]
					},
					{
						find: function(scopeD) {
						if(scope === 'citoyens'){
							return scopeD.listFollows();
						}else if(scope === 'organizations'){
							return scopeD.listMembers();
						}else if(scope === 'projects'){
							return scopeD.listContributors();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
						if(scope === 'citoyens'){
							return scopeD.listMemberOf();
						}else if(scope === 'organizations'){
							return scopeD.listMembersOrganizations();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
							if(scope === 'citoyens' || scope === 'organizations'){
							return scopeD.listProjects();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
							if(scope === 'citoyens' || scope === 'organizations' || scope === 'projects'){
							return scopeD.listEvents();
						}
						},
						children: [
							{
								find: function(scopeD) {
									return scopeD.documents();
								}
							}
						]
					},
					{
						find: function(scopeD) {
							return scopeD.documents();
						}
					}
				]}
			});


		Meteor.publishComposite('listeventSous', function(scopeId) {
			check(scopeId, String);
			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					Counts.publish(this, `countSous.${scopeId}`, Events.find({parentId:scopeId}), { noReady: true });
						return Events.find({parentId:scopeId});
				},
				children: [
					{
						find: function(event) {
							return event.documents();
						}
					}
				]}
			});

		Meteor.publishComposite('listAttendees', function(scopeId) {
			check(scopeId, String);

			if (!this.userId) {
				return;
			}
			return {
				find: function() {
					return Events.find({_id:new Mongo.ObjectID(scopeId)});
				},
				children: [
					{
						find: function(event) {
							return event.listAttendees();
						},
						children: [
							{
								find: function(citoyen) {
									return Meteor.users.find({
										_id: citoyen._id._str
									}, {
										fields: {
											'profile.online': 1
										}
									});
								}
							},
							{
								find: function(citoyen) {
									return citoyen.documents();
								}
							}
						]
					}
				]}
			});

			Meteor.publishComposite('listMembers', function(scopeId) {
				check(scopeId, String);

				if (!this.userId) {
					return;
				}
				return {
					find: function() {
						return Organizations.find({_id:new Mongo.ObjectID(scopeId)});
					},
					children: [
						{
							find: function(organisation) {
								return organisation.listMembers();
							},
							children: [
								{
									find: function(citoyen) {
										return Meteor.users.find({
											_id: citoyen._id._str
										}, {
											fields: {
												'profile.online': 1
											}
										});
									}
								},
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						}
					]}
				});

				Meteor.publishComposite('listContributors', function(scopeId) {
					check(scopeId, String);

					if (!this.userId) {
						return;
					}
					return {
						find: function() {
							return Projects.find({_id:new Mongo.ObjectID(scopeId)});
						},
						children: [
							{
								find: function(project) {
									return project.listContributors();
								},
								children: [
									{
										find: function(citoyen) {
											return Meteor.users.find({
												_id: citoyen._id._str
											}, {
												fields: {
													'profile.online': 1
												}
											});
										}
									},
									{
										find: function(citoyen) {
											return citoyen.documents();
										}
									}
								]
							}
						]}
					});

					Meteor.publishComposite('listFollows', function(scopeId) {
						check(scopeId, String);

						if (!this.userId) {
							return;
						}
						return {
							find: function() {
								return Citoyens.find({_id:new Mongo.ObjectID(scopeId)}, {
									fields: {
										'_id': 1,
										'name': 1,
										'links.follows': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.listFollows();
									},
									children: [
										{
											find: function(citoyen) {
												return Meteor.users.find({
													_id: citoyen._id._str
												}, {
													fields: {
														'profile.online': 1
													}
												});
											}
										},
										{
											find: function(citoyen) {
												return citoyen.documents();
											}
										}
									]
								}
							]}
						});

			Meteor.publishComposite('newsList', function(scope,scopeId,limit) {
				check(scopeId, String);
				check(scope, String);
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						var query = {};
						//query['scope.'+scope] = {$in:[scopeId]};
						query['target.id'] = scopeId;
						query['type'] = 'news';
						Counts.publish(this, `countNews.${scopeId}`, News.find(query), { noReady: true });
						return News.find(query,{sort: {"created": -1},limit:limit});
					},
					children: [
						{
							find: function(news) {
								/*////console.log(news.author);*/
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1,
										'profilThumbImageUrl': 1
									}
								});
							}
						},
						{
							find: function(news) {
								return news.photoNewsAlbums();
							}
						}
					]
				}
			});

			Meteor.publishComposite('newsDetail', function(newsId) {
				check(newsId, String);
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						return News.find({_id:new Mongo.ObjectID(newsId)});
					},
					children: [
						{
							find: function(news) {
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						},
						{
							find: function(news) {
								return news.photoNewsAlbums();
							}
						}
					]
				}
			});

			Meteor.publishComposite('newsDetailComments', function(newsId) {
				check(newsId, String);
				if (!this.userId) {
					return;
				}

				return {
					find: function() {
						return News.find({_id:new Mongo.ObjectID(newsId)});
					},
					children: [
						{
							find: function(news) {
								return Citoyens.find({
									_id: new Mongo.ObjectID(news.author)
								}, {
									fields: {
										'name': 1
									}
								});
							},
							children: [
								{
									find: function(citoyen) {
										return citoyen.documents();
									}
								}
							]
						},
						{
							find: function(news) {
								return Comments.find({
									contextId: news._id._str
								});
							},
							children: [
								{
									find: function(comment) {
										return Citoyens.find({
											_id: new Mongo.ObjectID(comment.author)
										}, {
											fields: {
												'name': 1
											}
										});
									},
									children: [
										{
											find: function(citoyen) {
												return citoyen.documents();
											}
										}
									]
								}
							]
						},
						{
							find: function(news) {
								return news.photoNewsAlbums();
							}
						}
					]
				}
			});

			Meteor.publish('citoyenOnlineProx', function(latlng,radius) {
				check(latlng, {longitude:Number,latitude:Number});
				check(radius, Number);
				if (!this.userId) {
					return;
				}
				//moulinette pour mettre à jour les Point pour que l'index soit bon
				/*
				Citoyens.find({}).fetch().map(function(c){
				if(c.geo && c.geo.longitude){
				Citoyens.update({_id:c._id}, {$set: {'geoPosition': {
				type: "Point",
				'coordinates': [parseFloat(c.geo.longitude), parseFloat(c.geo.latitude)]
			}}});
		}
	});*/

	return Citoyens.find({'geoPosition': {
		$nearSphere: {
			$geometry: {
				type: "Point",
				coordinates: [latlng.longitude, latlng.latitude]
			},
			$maxDistance: radius
		}}},{_disableOplog: true,fields:{pwd:0}});
	});


	Meteor.publish('users', function() {
		if (!this.userId) {
			return;
		}
		return [
			Meteor.users.find({'profile.online': true}, {fields: {'profile': 1,'username': 1}}),
			Citoyens.find({_id:new Mongo.ObjectID(this.userId)},{_disableOplog: true,fields:{pwd:0}})
		];
	});
