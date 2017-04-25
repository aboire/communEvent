import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import { NotificationHistory } from '../../api/notification_history.js';

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
  notificationsCount () {
    return NotificationHistory.find({}).count();
  },
  dataReady() {
  return Template.instance().ready.get();
  }
});

Template.notificationsList.helpers({
  notifications () {
    return NotificationHistory.find({
  		'expiration': {
  			$gt: new Date()
  		}
  	}, {
  		sort: {
  			'addedAt': -1
  		}
  	});
  }
});

Template.notificationsList.events({
    'click .removeMe': function(event, template) {
      event.preventDefault();
        Meteor.call('markRead', this._id, function(err, resp) {
            //console.log('mark as read response', resp)
        });
    },
    'click .clickGo': function(event, template) {
      event.preventDefault();
        Meteor.call('registerClick', this._id);
        Router.go(this.link);
    }
})
