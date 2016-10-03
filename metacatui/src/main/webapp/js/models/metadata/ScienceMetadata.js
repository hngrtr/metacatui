﻿﻿/* global define */
define(['jquery', 'underscore', 'backbone', 'models/DataONEObject'], 
    function($, _, Backbone, DataONEObject){

        /* 
         ScienceMetadata represents a generic science metadata document.
         It's properties are limited to those shared across subclasses,
         such as the those found in the DataONE search index.
         TODO: incorporate Backbone.UniqueModel
        */
        var ScienceMetadata = DataONEObject.extend({
        	
        	defaults: _.extend({
	            type: "Metadata",
	            abstract: [],
	            attribute: [],
	            attributeDescription: [],
	            attributeLabel: [],
	            attributeName: [],
	            attributeUnit: [],
	            author: null, 
	            authorGivenName: null, 
	            authoritativeMN: null, 
	            authorLastName: [],
	            authorSurName: null, 
	            beginDate: null, 
	            changePermission: [],
	            contactOrganization: [],
	            datasource: null, 
	            dataUrl: null, 
	            dateModified: null, 
	            datePublished: null, 
	            dateUploaded: null, 
	            decade: null, 
	            documents: [],
	            edition: null, 
	            endDate: null, 
	            fileID: null, 
	            formatType: null, 
	            gcmdKeyword: [],
	            investigator: [],
	            isDocumentedBy: [],
	            isPublic: null, 
	            keyConcept: [],
	            keywords: [],
	            mediaType: null, 
	            mediaTypeProperty: [],
	            origin: [],
	            originator: [],
	            placeKey: [],
	            presentationCat: null, 
	            project: null, 
	            pubDate: null, 
	            purpose: null, 
	            readPermission: [],
	            relatedOrganizations: [],
	            replicaMN: [],
	            resourceMap: [],
	            sensor: [],
	            sensorText: [],
	            source: [],
	            scientificName: [],
	            species: [],
	            genus: [],
	            family: [],
	            class: [],
	            phylum: [],
	            order: [],
	            kingdom: [],
	            westBoundCoord: null, 
	            eastBoundCoord: null, 
	            northBoundCoord: null, 
	            southBoundCoord: null, 
	            site: [],
	            namedLocation: [],
	            noBoundingBox: null, 
	            geoform: null, 
	            isSpatial: null, 
	            geohash_1: [],
	            geohash_2: [],
	            geohash_3: [],
	            geohash_4: [],
	            geohash_5: [],
	            geohash_6: [],
	            geohash_7: [],
	            geohash_8: [],
	            geohash_9: [],
	            prov_generated: [],
	            prov_generatedByExecution: [],
	            prov_generatedByProgram: [],
	            prov_generatedByUser: [],
	            prov_hasDerivations: [],
	            prov_hasSources: [],
	            prov_instanceOfClass: [],
	            prov_used: [],
	            prov_usedByExecution: [],
	            prov_usedByProgram: [],
	            prov_usedByUser: [],
	            prov_wasDerivedFrom: [],
	            prov_wasExecutedByExecution: [],
	            prov_wasExecutedByUser: [],
	            prov_wasInformedBy: [],
	            sem_annotated_by: [],
	            sem_annotates: [],
	            sem_annotation: [],
	            sem_comment: []        
        	}),
            
            initialize: function(options) {
                // Call initialize for the super class
                this.constructor.__super__.initialize.apply(this, options);
                
                // ScienceMetadata-specific init goes here
                
            }
        });
        return ScienceMetadata;
    }
);