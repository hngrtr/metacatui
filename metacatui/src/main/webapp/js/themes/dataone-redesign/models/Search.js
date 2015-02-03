/*global define */
define(['jquery', 'underscore', 'backbone'], 				
	function($, _, Backbone) {
	'use strict';

	// Search Model 
	// ------------------
	var Search = Backbone.Model.extend({
		// This model contains all of the search/filter terms
		/*
		 * Search filters can be either plain text or a filter object with the following options:
		 * filterLabel - text that will be displayed in the filter element in the UI
		 * label - text that will be displayed in the autocomplete  list
		 * value - the value that will be included in the query
		 * description - a longer text description of the filter value
		 */
		defaults: function(){ 
			return {
				all: [],
				creator: [],
				taxon: [],
				resourceMap: false,
				yearMin: 1900, //The user-selected minimum year
				yearMax: new Date().getUTCFullYear(), //The user-selected maximum year
				pubYear: false,
				dataYear: false,
				sortOrder: 'dateUploaded+desc',
				east: null,
				west: null,
				north: null,
				south: null,
				geohashes: [],
				geohashLevel: 9,
				spatial: [],
				attribute: [],
				annotation: [],
				additionalCriteria: [],
				memberNode: [],
				id: [],
				formatType: [{
					value: "METADATA",
					label: "science metadata",
					description: null
				}],
				exclude: [{
					field: "obsoletedBy",
					value: "*"
				}]
			}
		},
		
		//Map the filter names to their index field names
		fieldNameMap: {
					 attribute : "attributeName",
					annotation : "annotation_sm",
					formatType : "formatType",
						   all : "",
					   creator : "origin",
					   spatial : "site",
				   resourceMap : "resourceMap",
				   	   pubYear : "dateUploaded",
				   	memberNode : "datasource",
				   			id : "id"
		},
		
		filterCount: function() {
			var changedAttr = this.changedAttributes(_.clone(this.defaults()));
			if (changedAttr) {
				console.log(changedAttr);
				var changedKeys = _.keys(changedAttr);
				return changedKeys.length;
			}
			return 0;
		},
		
		//Function filterIsAvailable will check if a filter is available in this search index - 
		//if the filter name if included in the defaults of this model, it is marked as available. 
		//Comment out or remove defaults that are not in the index or should not be included in queries
		filterIsAvailable: function(name){
			//Get the keys for this model as a way to list the filters that are available
			var defaults = _.keys(this.defaults());
			if(_.indexOf(defaults, name) >= 0) return true;
			else return false;
		},
		
		/*
		 * Removes a specified filter from the search model
		 */
		removeFromModel : function(category, filterValueToRemove){			
			//Remove this filter term from the model
			if (category){				
				//Get the current filter terms array
				var currentFilterValues = this.get(category);
				
				//Remove this filter term from the array
				var newFilterValues = _.without(currentFilterValues, filterValueToRemove);
				_.each(currentFilterValues, function(currentFilterValue, key){
					if(currentFilterValue.value == filterValueToRemove){
						newFilterValues = _.without(newFilterValues, currentFilterValue);
					}
				});
				
				//Remove this filter term from the array
				//var newFilterValues = _.without(currentFilterValues, filterValue);
				//Set the new value
				this.set(category, newFilterValues);	
				
			}
		},
		
		/*
		 * Resets the geoashes and geohashLevel filters to default
		 */
		resetGeohash : function(){
			this.set("geohashes",    this.defaults().geohashes);
			this.set("geohashLevel", this.defaults().geohashLevel);
		},
		
		/*
		 * Builds the query string to send to the query engine. Goes over each filter specified in this model and adds to the query string.
		 * Some filters have special rules on how to format the query, which are built first, then the remaining filters are tacked on to the
		 * query string as a basic name:value pair. These "other filters" are specified in the otherFilters variable.
		 */
		getQuery: function(filter){
			
			//----All other filters with a basic name:value pair pattern----
			var otherFilters = ["attribute", "annotation", "formatType", "creator", "spatial", "id"];
			
			//Function here to check for spaces in a string - we'll use this to url encode the query
			var needsQuotes = function(entry){
				//Check for spaces
				var space = null;
				
				space = entry.indexOf(" ");
				
				if(space >= 0){
					return true;
				}
				
				//Check for the colon : character
				var colon = null;
				colon = entry.indexOf(":");
				if(colon >= 0){
					return true;
				}
				
				return false;
			};
			
			//Start the query string
			var query = "";
			
			//See if we are looking for a sub-query or a query for all filters
			if(typeof filter == "undefined"){
				var filter = null;
				var getAll = true;
			}
			else var getAll = false;
			
			//---resourceMap---
			if(this.filterIsAvailable("resourceMap") && ((filter == "resourceMap") || getAll)){
				if(this.get('resourceMap')) query += this.fieldNameMap["resourceMap"] + ':*';
			}
			
			//---Taxon---
			if(this.filterIsAvailable("taxon") && ((filter == "taxon") || getAll)){
				var taxon = this.get('taxon');
				var thisTaxon = null;
				for (var i=0; i < taxon.length; i++){
					//Trim the spaces off
					thisTaxon = taxon[i].trim();
					
					if(needsQuotes(thisTaxon)) value = "%22" + encodeURIComponent(thisTaxon) + "%22";
					else value = encodeURIComponent(thisTaxon);
					
					query += "+(" +
								   "family:" + value + 
								   " OR " +
								   "species:" + value + 
								   " OR " +
								   "genus:" + value + 
								   " OR " +
								   "kingdom:" + value + 
								   " OR " +
								   "phylum:" + value + 
								   " OR " +
								   "order:" + value +
								   " OR " +
								   "class:" + value + 
								   ")";
				}
			}
			
			//------Pub Year-----
			if(this.filterIsAvailable("pubYear") && ((filter == "pubYear") || getAll)){
				//Get the types of year to be searched first
				var pubYear  = this.get('pubYear');
				if (pubYear){
					//Get the minimum and maximum years chosen
					var yearMin = this.get('yearMin');
					var yearMax = this.get('yearMax');	
					
					//Add to the query if we are searching publication year
					query += "+" + this.fieldNameMap["pubYear"] + ":%5B" + yearMin + "-01-01T00:00:00Z%20TO%20" + yearMax + "-12-31T00:00:00Z%5D";				
				}
			}
			
			//-----Data year------
			if(this.filterIsAvailable("dataYear") && ((filter == "dataYear") || getAll)){
				var dataYear = this.get('dataYear');
				
				if(dataYear){
					//Get the minimum and maximum years chosen
					var yearMin = this.get('yearMin');
					var yearMax = this.get('yearMax');	
					
					query += "+beginDate:%5B" + yearMin + "-01-01T00:00:00Z%20TO%20*%5D" +
					 		 "+endDate:%5B*%20TO%20" + yearMax + "-12-31T00:00:00Z%5D";
				}
			}
			
			//-----Geohashes-----
			if(this.filterIsAvailable("geohashLevel") && (((filter == "geohash") || getAll) && (this.get('north') != null))){
				var geohashes = this.get("geohashes");
				
				if((typeof geohashes === undefined) || (geohashes.length == 0)) return "";
				
				var query = "+geohash_" + this.get("geohashLevel") + ":(";
				
				_.each(geohashes, function(geohash, key, list){
					query += geohash + "%20OR%20";
				});
				
				//Remove the last "OR"
				query = query.substr(0, (query.length-8));
				query += ")";
			}
			
			//-----Excluded fields-----
			if(this.filterIsAvailable("exclude") && ((filter == "exclude") || getAll)){
				var exclude = this.get("exclude");
				_.each(exclude, function(excludeField, key, list){
					query += "+-" + excludeField.field + ":" + excludeField.value;
				});
			}
			
			//-----Additional criteria - both field and value are provided-----
			if(this.filterIsAvailable("additionalCriteria") && ((filter == "additionalCriteria") || getAll)){
				var additionalCriteria = this.get('additionalCriteria');
				for (var i=0; i < additionalCriteria.length; i++){
					var value;
					
					if(needsQuotes(additionalCriteria[i])) value = "%22" + encodeURIComponent(additionalCriteria[i]) + "%22";
					else value = encodeURIComponent(additionalCriteria[i]);
					
					query += "+" + value;
				}
			}
			
			//-----All (full text search) -----
			if(this.filterIsAvailable("all") && ((filter == "all") || getAll)){
				var all = this.get('all');
				for (var i=0; i < all.length; i++){
					var filterValue = all[i];
					
					if(typeof filterValue == "object")
						filterValue = filterValue.value;
					
					if(needsQuotes(filterValue)) filterValue = "%22" + encodeURIComponent(filterValue) + "%22";
					else filterValue = encodeURIComponent(filterValue);
					
					query += "+" + filterValue;
				}
			}
			
			//----- Member Nodes - Multiple selections will look for either (OR) -----
			if(this.filterIsAvailable("memberNode") && ((filter == "memberNode") || getAll)){
				var memberNode = this.get('memberNode'),
					fieldName = this.fieldNameMap["memberNode"];
				
				for (var i=0; i < memberNode.length; i++){
					var filterValue = memberNode[i];
					
					if(typeof filterValue == "object")
						filterValue = filterValue.value;
					
					filterValue = "%22" + encodeURIComponent(filterValue) + "%22";
					
					if(i==0 && memberNode.length==1)
						query += "+" + fieldName + ":" + filterValue;
					else if(i==0)
						query += "+" + fieldName + ":(" + filterValue + "%20OR%20";
					else if(i == memberNode.length-1)
						query += filterValue + ")";					
					else
						query += filterValue + "%20OR%20";
				}				
			}
			
			//-----Theme restrictions from Registry Model-----
			if((filter == "registryCriteria") || getAll){
				var registryCriteria = registryModel.get('searchFields');
				_.each(registryCriteria, function(value, key, list) {
					query += "+" + value;
				});
			}
			
			var model = this;
			
			_.each(otherFilters, function(filterName, key, list){
				if(model.filterIsAvailable(filterName) && ((filter == filterName) || getAll)){
					var filterValue = null;
					var filterValues = model.get(filterName);
					
					for (var i=0; i < filterValues.length; i++){
						
						//Trim the spaces off
						var filterValue = filterValues[i];
						if(typeof filterValue == "object"){
							filterValue = filterValue.value;
						}
						filterValue = filterValue.trim();
						
						// Does this need to be wrapped in quotes?
						if (needsQuotes(filterValue)){
							filterValue = "%22" + encodeURIComponent(filterValue) + "%22";
						}
						// TODO: surround with **?
						query += "+" + model.fieldNameMap[filterName] + ":" + filterValue;			
					}
				}
			});
						
			return query;
		},
		
		getFacetQuery: function(){
			
			var facetQuery = "&facet=true" +
							 "&facet.sort=count" +
							 "&facet.mincount=1" +
							 "&facet.limit=-1" +
							 "&facet.field=keywords" +
							 "&facet.field=origin" +
							 "&facet.field=family" +
							 "&facet.field=species" +
							 "&facet.field=genus" +
							 "&facet.field=kingdom" + 
							 "&facet.field=phylum" + 
							 "&facet.field=order" +
							 "&facet.field=class" +
							 "&facet.field=site";
			if(this.filterIsAvailable("attribute")) facetQuery += "&facet.field=attributeName&facet.field=attributeLabel";
			if(this.filterIsAvailable("annotation")) facetQuery += "&facet.field=annotation_sm";
			
			return facetQuery;
		},
		
		/*
		 * Makes a Solr syntax grouped query using the field name, the field values to search for, and the operator.
		 * Example:  title:(resistance OR salmon OR "pink salmon")
		 */
		getGroupedQuery: function(fieldName, values, operator){
			var query = "",
				numValues = values.length,
				model = this;
			
			if((typeof operator === "undefined") || !operator || ((operator != "OR") && (operator != "AND"))) var operator = "OR";
			
			if(numValues == 1) query = fieldName + ":" + values[0];
			else{
				_.each(values, function(value, i){
					if(model.needsQuotes(value)) value = '"' + value + '"';
						
					if((i == 0) && (numValues > 1)) 	   query += "id:(" + value;
					else if((i > 0) && (i < numValues-1))  query += "%20" + operator + "%20" + value;
					else if(i == numValues-1) 		 	   query += "%20" + operator + "%20" + value + ")";
				});
			}
			
			return query;
		},
		
		clear: function() {
			console.log('Clear the filters');
		    return this.set(_.clone(this.defaults()));
		  }
		
	});
	return Search;
});
