﻿/* global define */
define(['underscore', 
        'jquery', 
        'backbone',
        'collections/DataPackage',
        'models/metadata/eml211/EML211',
        'views/metadata/EML211View',
        'views/DataPackageView',
        'text!templates/editor.html'], 
        function(_, $, Backbone, DataPackage, EML, EMLView, DataPackageView, EditorTemplate){
    
    var EditorView = Backbone.View.extend({
                
        el: "#Content",
        
        /* The initial editor layout */
        template: _.template(EditorTemplate),
        
        /* Events that apply to the entire editor */
        events: {
            "change input"    : "showControls",
            "change select"   : "showControls",
            "change textarea" : "showControls"
        },
        
        defaults: {
            /* The identifier of the root package id being rendered */
            id: null,
            
            /* A list of the subviews of the editor */
            subviews: []
        },
        
        /* Initialize a new EditorView - called post constructor */
        initialize: function(options) {
            
            // If options.id isn't present, generate and render a new package id and metadata id
            if ( typeof options === "undefined" || !options.pid ) {
                console.log("EditorView: Creating a new data package.");
                
            } else {
                this.pid = options.pid;
                console.log("Loading existing package from id " + options.pid);
                
                //TODO: This should create a DataPackage collection 
                this.createModel();

            }            
            return this;
        },
        
        //Create a new EML model for this view        
        createModel: function(){
        	var model = new EML({ id: this.pid, type: "EML211" });
            
            // Once the EML is populated, populate the associated package
            this.listenToOnce(this.model, "change:resourceMap", this.getPackage);
            this.model = model;

        },
        
        /* Render the view */
        render: function() {

            MetacatUI.appModel.set('headerType', 'default');
            $("body").addClass("Editor");
        	//Get the basic template on the page
        	this.$el.append(this.template());
        	
        	if(!this.model) this.createModel();
        	
            //Wait until the user info is loaded before we request the Metadata
        	if(MetacatUI.appUserModel.get("loggedIn")) {
              this.model.fetch();

        	} else {        	
	            this.listenToOnce(MetacatUI.appUserModel, "change:checked", function(){
	            	this.model.fetch();
	            });
        	}
            
            //When the metadata is retrieved, render it
            this.listenToOnce(this.model, "sync", this.renderMetadata);
                        
            return this;
        },
        
        /* Get the data package associated with the EML */
        getPackage: function(emlModel) {
            console.log("EditorView.getPackage() called.");
            
            // Get the resource map from the server and populate the model with its members
            // MetacatUI.rootDataPackage.fetch();
            // this.dataPackageView = new DataPackageView({collection: MetacatUI.rootDataPackage});
            // this.subviews.push(this.dataPackageView);
            
            
        },
        
        /* Renders the metadata section of the EditorView */
        renderMetadata: function(emlModel){
        	console.log("Rendering EML Model ", emlModel);
        	
        	//Create an EML211 View and render it
        	var emlView = new EMLView({ 
        		model: this.model,
        		edit: true
        		});
        	this.subviews.push(emlView);
        	emlView.render();       	
        },
        
	    showControls: function(){
	    	this.$(".editor-controls").slideDown();
	    },
	    
	    hideControls: function(){
	    	this.$(".editor-controls").slideUp();
	    },
        
        /* Close the view and its sub views */
        onClose: function() {
            this.off();    // remove callbacks, prevent zombies         
			
            $(".Editor").removeClass("Editor");
            
            this.model = null;
            this.pid = null;
            
            // Close each subview
            _.each(this.subviews, function(i, subview) {
				if(subview.onClose)
					subview.onClose();
            });
            
            this.subviews = [];
			window.onbeforeunload = null;
            
        }
                
    });
    return EditorView;
});