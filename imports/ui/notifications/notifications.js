import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import { ActivityStream } from '../../api/activitystream.js';

//submanager
import { singleSubs} from '../../api/client/subsmanager.js';

import './notifications.html';

Template.notifications.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function(c) {
      const handle = singleSubs.subscribe('notificationsUser');
        self.ready.set(handle.ready());
  });

});

Template.notifications.helpers({
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.notificationsList.helpers({
  notifications () {
    return ActivityStream.find({}, {
  		sort: {
  			'created': -1
  		}
  	});
  }
});

Template.notificationsList.events({
    'click .removeMe': function(event, template) {
      event.preventDefault();
      /*  Meteor.call('markRead', this._id, function(err, resp) {
            console.log('mark as read response', resp)
        });*/
    },
    'click .clickGo': function(event, template) {
      event.preventDefault();
        //Meteor.call('registerClick', this._id);
        /*a["{\"msg\":\"added\",\"collection\":\"activityStream\",\"id\":\"58ff83c3dd045250307f4fc8\",\"fields\":
        {\"type\":\"test\",\"verb\":\"comment\",\"author\":\"55ed9107e41d75a41a558524\",\"date\":{\"$date\":1493140419000},\"created\":{\"$date\":1493140419000},
        \"object\":{\"objectType\":\"citoyens\",\"id\":\"55ed9107e41d75a41a558524\"},
        \"target\":{\"objectType\":\"news\",\"id\":\"58fea1c7dd045227477f500d\"},
        \"notify\":{\"objectType\":\"persons\",\"id\":[\"55ed9107e41d75a41a558524\"],\"displayName\":\"Thomas Craipeau a commenté votre post\",\"icon\":\"fa-comment\",
        \"url\":\"/communecter/news/detail/id/58fea1c7dd045227477f500d\"},\"timestamp\":{\"$date\":1493140419000}}}"]*/

        const VERB_VIEW = "view";
        const VERB_ADD = "add";
        const VERB_UPDATE = "update";
        const VERB_CREATE = "create";
        const VERB_DELETE = "delete";

        const VERB_JOIN = "join";
        const VERB_WAIT = "wait";
        const VERB_LEAVE = "leave";
        const VERB_INVITE = "invite";
        const VERB_ACCEPT = "accept";
        const VERB_CLOSE = "close";
        const VERB_SIGNIN = "signin";

        const VERB_HOST = "host";
        const VERB_FOLLOW = "follow";
        const VERB_CONFIRM = "confirm";
        const VERB_AUTHORIZE = "authorize";
        const VERB_ATTEND = "attend";
        const VERB_COMMENT = "comment";
        const VERB_MENTION = "mention";
        const VERB_ADDROOM = "addactionroom";
        const VERB_ADD_PROPOSAL = "addproposal";
        const VERB_MODERATE = "moderate";
        const VERB_ADD_ACTION = "addaction";
        const VERB_VOTE = "vote";

        const VERB_POST = "post";
        const VERB_RETURN = "return";


        if(this.verb === 'comment'){
          if(this.object.objectType === 'citoyens' || this.object.objectType === 'projects' || this.object.objectType === 'organizations' || this.object.objectType === 'events'){
            //':scope/news/:_id'
            if(this.target.objectType === 'news'){
              //':scope/news/:_id/new/:newsId'
              //':scope/news/:_id/new/:newsId/comments'
              Router.go('newsDetailComments', {_id:this.object.id,newsId:this.target.id,scope:this.object.objectType});
            }
          }
        }else if(this.verb === 'like'){

        }else if(this.verb === 'post'){
          if(this.object.objectType === 'citoyens' || this.object.objectType === 'projects' || this.object.objectType === 'organizations' || this.object.objectType === 'events'){
            //':scope/news/:_id'
            if(this.target.objectType === 'news'){
              //':scope/news/:_id'
              //':scope/news/:_id/new/:newsId'
              //':scope/news/:_id/new/:newsId/comments'
              Router.go('newsList', {_id:this.object.id,scope:this.object.objectType});

            }else if(this.target.objectType === 'projects' || this.target.objectType === 'organizations' || this.target.objectType === 'events'){
              Router.go('newsList', {_id:this.target.id,scope:this.target.objectType});

            }
          }
        }else if(this.verb === 'accept'){
          if(this.object.objectType === 'citoyens' || this.object.objectType === 'projects' || this.object.objectType === 'organizations' || this.object.objectType === 'events'){
            if(this.target.objectType === 'projects' || this.target.objectType === 'organizations' || this.target.objectType === 'events'){
              Router.go('newsList', {_id:this.target.id,scope:this.target.objectType});

            }
          }
        }

    }
})
