import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

export const News = new Meteor.Collection("news", {idGeneration : 'MONGO'});

export const SchemasNewsRest =   new SimpleSchema({
  text : {
    type : String
  },
  parentId : {
    type: String
  },
  parentType : {
    type: String
  },
  tags : {
    type: [String],
    optional: true
  },
  media : {
    type: Object,
    optional: true
  },
  "media.type" : {
    type: String,
    optional: true
  },
  "media.countImages" : {
    type: String,
    optional: true
  },
  "media.images" : {
    type: [String],
    optional: true
  },
  "media.content" : {
    type: Object,
    optional: true
  },
  "media.content.type" : {
    type: String,
    optional: true
  },
  "media.content.image" : {
    type: String,
    optional: true
  },
  "media.content.imageId" : {
    type: String,
    optional: true
  },
  "media.content.imageSize" : {
    type: String,
    optional: true
  },
  "media.content.videoLink" : {
    type: String,
    optional: true
  },
  "media.content.url" : {
    type: String,
    optional: true
  }
});

  //collection
  if(Meteor.isClient){
    import { Documents } from './documents.js';
    import { Citoyens } from './citoyens.js';
    import { Comments } from './comments.js';
    News.helpers({
      authorNews () {
        return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
      },
      photoNewsAlbums () {
        if(this.media && this.media.images){
          let arrayId = this.media.images.map((_id) => {
            return new Mongo.ObjectID(_id)
          })
        return Documents.find({_id: { $in: arrayId }}).fetch();
      }
      },
      likesCount () {
        if (this.voteUp && this.voteUpCount) {
          return this.voteUpCount;
        }
        return 0;
      },
      dislikesCount () {
        if (this.voteDown && this.voteDownCount) {
          return this.voteDownCount;
        }
        return 0;
      },
      isAuthor () {
        return this.author === Meteor.userId();
      },
      listComments () {
        console.log('listComments');
        return Comments.find({
          contextId: this._id._str
        },{sort: {"created": -1}});
      },
      commentsCount () {
        if (this.commentCount) {
          return this.commentCount;
        }
        return 0;
      }
    });
  }else{
    import { Citoyens } from './citoyens.js'
    News.helpers({
      authorNews () {
        return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
      },
      likesCount () {
        if (this.voteUp && this.voteUpCount) {
          return this.voteUpCount;
        }
        return 0;
      },
      dislikesCount () {
        if (this.voteDown && this.voteDownCount) {
          return this.voteDownCount;
        }
        return 0;
      },
      isAuthor () {
        return this.author === Meteor.userId();
      }
    });
  }
