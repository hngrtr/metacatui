/*global Backbone */
'use strict';

define(['jquery',	'underscore', 'backbone', 'views/IndexView', 'views/AboutView', 'views/ToolsView', 'views/DataCatalogView', 'views/RegistryView', 'views/MetadataView', 'views/ExternalView', 'views/LdapView'], 				
function ($, _, Backbone, IndexView, AboutView, ToolsView, DataCatalogView, RegistryView, MetadataView, ExternalView, LdapView) {

	var indexView = new IndexView();
	var aboutView = aboutView || new AboutView();
	var toolsView = toolsView || new ToolsView();
	var dataCatalogView = new DataCatalogView();
	var registryView = new RegistryView();
	var metadataView = new MetadataView();
	var externalView = new ExternalView();
	var ldapView = new LdapView();
	
	// MetacatUI Router
	// ----------------
	var UIRouter = Backbone.Router.extend({
		routes: {
			''                          : 'renderIndex', // the default route
			'about'                     : 'renderAbout',  // about page
			'about(/:anchorId)'         : 'renderAbout',  // about page anchors
			'plans'                     : 'renderPlans',  // plans page
			'tools(/:anchorId)'         : 'renderTools',  // tools page
			'data(/page/:page)'			: 'renderData',    // data search page
			'view/*pid'                 : 'renderMetadata',    // metadata page
			'external(/*url)'           : 'renderExternal',    // renders the content of the given url in our UI
			'logout'                    : 'logout',    // logout the user
			'signup'          			: 'renderLdap',    // use ldapweb for registration
			'account(/:stage)'          : 'renderLdap',    // use ldapweb for different stages
			'share'                     : 'renderRegistry'    // registry page
		},
		
		routeHistory: new Array(),
		
		// Will return the last route, which is actually the second to last item in the route history, 
		// since the last item is the route being currently viewed
		lastRoute: function(){
			if((this.routeHistory === undefined) || (this.routeHistory.length <= 1)){
				return false;
			}
			
			return this.routeHistory[this.routeHistory.length-2];
		},

		renderIndex: function (param) {
			console.log('Called UIRouter.renderIndex()');
			this.routeHistory.push("index");
			appView.showView(indexView);
		},
		
		renderAbout: function (anchorId) {
			console.log('Called UIRouter.renderAbout()');
			this.routeHistory.push("about");
			appModel.set('anchorId', anchorId);
			appView.showView(aboutView);
		},
		
		renderPlans: function (param) {
			console.log('Called UIRouter.renderPlans()');
			this.routeHistory.push("plans");
		},
		
		renderTools: function (anchorId) {
			console.log('Called UIRouter.renderTools()');
			this.routeHistory.push("tools");
			appModel.set('anchorId', anchorId);
			appView.showView(toolsView);
		},
		
		renderData: function (page) {
			console.log('Called UIRouter.renderData()');
			this.routeHistory.push("data");
			appModel.set('page', page);
			appView.showView(dataCatalogView);
		},
		
		renderMetadata: function (pid) {
			console.log('Called UIRouter.renderMetadata()');
			this.routeHistory.push("metadata");
			appModel.set('pid', pid);
			appView.showView(metadataView);
		},
		
		renderRegistry: function (param) {
			console.log('Called UIRouter.renderRegistry()');
			this.routeHistory.push("registry");
			appView.showView(registryView);
		},
		
		renderLdap: function (stage) {
			console.log('Called UIRouter.renderLdap()');
			this.routeHistory.push("ldap");
			ldapView.stage = stage;
			appView.showView(ldapView);
		},
		
		logout: function (param) {
			console.log('Called UIRouter.logout()');
			this.routeHistory.push("logout");
			registryView.logout();
			//appView.showView(indexView);
		},
		
		renderExternal: function(url) {
			// use this for rendering "external" content pulled in dynamically
			console.log('Called UIRouter.renderExternal()');
			this.routeHistory.push("external");
			externalView.url = url;
			appView.showView(externalView);
		}
		
	});

	return UIRouter;
});