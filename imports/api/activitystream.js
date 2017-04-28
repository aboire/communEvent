import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

export const ActivityStream = new Meteor.Collection("activityStream", {idGeneration : 'MONGO'});

/*{
"_id" : ObjectId("58a06ec0e2f07e27233ba05e"),
"type" : "notifications",
"verb" : "comment",
"author" : {
"586f6493e2f07ea55a8b456c" : {
"name" : "pikachui"
}
},
"date" : ISODate("2017-02-12T14:18:40.000Z"),
"created" : ISODate("2017-02-12T14:18:40.000Z"),
"object" : {
"id" : "58a06149e2f07e3b243ba040",
"type" : "comments"
},
"target" : {
"type" : "news",
"id" : "58a060e0e2f07e69233ba03a"
},
"notify" : {
"objectType" : "comments",
"id" : {
"586f6493e2f07ea55a8b456b" : {}
},
"displayName" : "pikachui a répondu à votre commentaire posté sur votre post",
"icon" : "fa-comment",
"url" : "news/detail/id/58a060e0e2f07e69233ba03a"
}
}*/
