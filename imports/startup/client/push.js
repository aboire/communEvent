import { Meteor } from 'meteor/meteor';
import { Push } from 'meteor/raix:push';
import { Router } from 'meteor/iron:router';

import { ActivityStream } from '../../api/activitystream.js';

Meteor.startup(function () {
	if (Meteor.isDesktop){
		console.log('DESKTOP');
		let initNotifystart = ActivityStream.find().observe({
			added: function(notification) {
				if(!initNotifystart) return ;
				console.log(ActivityStream.find({}).count());
				Desktop.send('systemNotifications', 'setBadge', ActivityStream.find({}).count());
			},
			changed: function(notification) {
				//console.log(NotificationHistory.find({}).count());
				Desktop.send('systemNotifications', 'setBadge', ActivityStream.find({}).count());
			},
			removed: function(notification) {
				//console.log(NotificationHistory.find({}).count());
				Desktop.send('systemNotifications', 'setBadge', ActivityStream.find({}).count());
			}
		});

		var initNotifystart = ActivityStream.find({'created': {$gt: new Date()}}).observe({
			added: function(notification) {
				if(!initNotifystart) return ;
				console.log(Desktop.getAssetUrl('\___desktop\icon.png'));
				Desktop.send('systemNotifications', 'notify', {
				title: 'notification',
				text: notification.notify.displayName,
				icon: '\___desktop\icon.png',
				data: notification,
		});
			Desktop.send('systemNotifications', 'setBadge', ActivityStream.find({}).count());
			}
		});

Desktop.on('systemNotifications', 'notificationClicked', (sender, data) => {
	console.log(data);
		if(data.notify.url){
			//Meteor.call('markRead',data._id);
			//Meteor.call('registerClick', data._id);
			//Router.go(data.link);
			Router.go('/notifications');
		}else{
			Router.go('/notifications');
		}
});

	} else {
		if(Meteor.isCordova){
			let initNotifystart = ActivityStream.find().observe({
				added: function(notification) {
					if(!initNotifystart) return ;
					//console.log(NotificationHistory.find({}).count());
					Push.setBadge(ActivityStream.find({}).count());
				},
				changed: function(notification) {
					//console.log(NotificationHistory.find({}).count());
					Push.setBadge(ActivityStream.find({}).count());
				},
				removed: function(notification) {
					//console.log(NotificationHistory.find({}).count());
					Push.setBadge(ActivityStream.find({}).count());
				}
			});

			Push.Configure({
				android: {
					senderID: 183063213318,
					alert: true,
					badge: true,
					sound: true,
					vibrate: true,
					clearNotifications: true
					// icon: '',
					// iconColor: ''
				},
				ios: {
					alert: true,
					badge: true,
					sound: true
				}
			});

			Push.addListener('startup', function(notification) {
				Router.go('/notifications');
			});

			Push.addListener('message', function(notification) {
				function alertDismissed(buttonIndex) {
					if(buttonIndex===1){
						if(notification.payload.url){
							//Meteor.call('markRead',notification.payload.notifId);
							//Meteor.call('registerClick', notification.payload.notifId);
							//Router.go(notification.payload.link);
							Router.go('/notifications');
						}else{
							Router.go('/notifications');
						}
					}
				}
				window.confirm(notification.message, alertDismissed, 'notifications', ["Voir","fermer"]);
			});

		}else{

			if (!("Notification" in window)) {
				alert("This browser does not support desktop notification");
			} else {

				if (Notification.permission !== 'denied') {
					Notification.requestPermission(function (permission) {
					});
				}

				if (Notification.permission === "granted") {
					var initNotifystart = ActivityStream.find({'created': {$gt: new Date()}}).observe({
						added: function(notification) {
							if(!initNotifystart) return ;
							//console.log(NotificationHistory.find({}).count());
						 /*Electrify.call('setBadgeCount',[NotificationHistory.find({}).count()], function(err, msg) {
							 if(err){
								console.log(err);
							 }else{
								console.log(msg);
							 }
						 });*/
						 /*Electrify.call('showDoneNotification',[notification], function(err, msg) {
							 if(err){
								console.log(err);
							 }else{
								console.log(msg);
							 }
						 });*/

							let options = {
								body: notification.notify.displayName,
								icon: '/icon.png',
								data: notification
							}
							let n = new Notification('notification',options);
							n.onclick = function(e) {
								if(notification.notify.url){
									console.log(notification.notify.url);
									//Meteor.call('markRead',notification._id);
									//Meteor.call('registerClick', notification._id);
									//Router.go(notification.link);
									Router.go('/notifications');
									//window.open(Router.path[notification.link].url(), '_self');
									window.focus();
								}else{
									Router.go('/notifications');
									//window.open(Router.routes['notifications'].url(), '_self');
									window.focus();
								}
							};
							Meteor.setTimeout(n.close.bind(n), 5000);
						},
						changed: function(notification) {
							//console.log(NotificationHistory.find({}).count());
							//Electrify.call('setBadgeCount',NotificationHistory.find({}).count());
						},
						removed: function(notification) {
							//console.log(NotificationHistory.find({}).count());
							//Electrify.call('setBadgeCount',NotificationHistory.find({}).count());
						}
					});

				}
			}
		}
	}


});
