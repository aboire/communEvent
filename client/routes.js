

Router.configure({
  layoutTemplate: "layout",
  loadingTemplate: "loading"
});

var singleSubs = new SubsManager({cacheLimit: 20, expireIn: 3});

Router.map(function() {

  this.route('camera-page');

  this.route("login", {
    path: '/login'
  });

  this.route("signin", {
    path: '/signin'
  });

  this.route("listEvents", {
    path: '/',
    template: "listEvents",
    loadingTemplate: 'loading',
    waitOn: function() {
      Meteor.subscribe('citoyen');
      let geo = Location.getReactivePosition();
      if(geo && geo.latitude){
      let latlng = {latitude: parseFloat(geo.latitude), longitude: parseFloat(geo.longitude)};
      let radius = 13000;
      Meteor.subscribe('citoyenEvents',latlng,radius);
    }
    }
  });

  this.route("eventsAdd", {
    template: "eventsAdd",
    path: 'events/add',
    data: function() {

    },
    waitOn: function() {
      Meteor.subscribe('lists');
    }
  });

  this.route("eventsEdit", {
    template: "eventsEdit",
    path: 'events/:_id/edit',
    data: function() {
      return null;
    },
    waitOn: function() {
      return [ Meteor.subscribe('lists') , Meteor.subscribe('scopeDetail', 'events', this.params._id) ];
    }
  });

  this.route("newsList", {
    template: "newsList",
    path: 'news/:scope/:_id',
    loadingTemplate: 'loading',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return singleSubs.subscribe('newsList', this.params.scope, this.params._id);
    }
  });


  this.route("newsDetail", {
    template: "newsDetail",
    path: 'news/:scope/:_id/new/:newsId',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return Meteor.subscribe('newsDetail', this.params.newsId);
    }
  });

  this.route("newsAdd", {
    template: "newsAdd",
    path: 'news/:scope/:_id/add',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
    }
  });

  this.route("newsEdit", {
    template: "newsEdit",
    path: 'news/:scope/:_id/edit/:newsId',
    data: function() {
      Session.set('scopeId', this.params._id);
      Session.set('scope', this.params.scope);
      return null;
    },
    waitOn: function() {
      Meteor.subscribe('scopeDetail', this.params.scope, this.params._id);
      return Meteor.subscribe('newsDetail', this.params.newsId);
    }
  });

});


let ensurePixelSignin = function () {
  if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.pixelhumain) {
    this.next();
  } else {
    this.render('login');
  }
};

Router.onBeforeAction(ensurePixelSignin, {except: ['login','signin']});
