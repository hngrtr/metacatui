/*global define */
define(['jquery', 'underscore', 'backbone', 'models/Search'], 				
	function($, _, Backbone, SearchModel) {
	'use strict';

	// Search Model 
	// ------------------
	var LogsSearch = SearchModel.extend({
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
				dateLogged: [],
				nodeId: appModel.get("nodeId") || null,
				id: [],
				pid: [],
				event: [],
				userAgent: [],
				dateAggregated: [],
				inFullRobotList: "false",
				isRepeatVisit: "false",
				isPublic: [],
				entryId: [],
				city: [],
				region: [],
				country: [],
				location: [],
				geohashes: [],
				geohashLevel: 9,
				geohashGroups: {},
				username: [],
				size: [],
				formatId: [],
				formatType: [],
				exclude: [{
					field: null,
					value: null
				}],
				facets: [],
				facetRanges: [],
				facetRangeStart: "NOW-20YEARS",
				facetRangeEnd: "NOW",
				facetRangeGap: "%2B1MONTH",
				facetMinCount: "1"
			}
		},

		initialize: function(){
			this.listenTo(this, "change:geohashes", this.groupGeohashes);
			
			this.listenToOnce(nodeModel, "change:currentMemberNode", this.setNodeId);
		},
		
		//Map the filter names to their index field names
		fieldNameMap: {
			all: "",
			dateLogged: "dateLogged",
			nodeId: "nodeId",
			id: "id",
			pid: "pid",
			event: "event",
			userAgent: "userAgent",
			dateAggregated: "dateAggregated",
			isPublic: "isPublic",
			entryId: "entryId",
			city: "city",
			region: "region",
			country: "country",
			location: "location",
			size: "size",
			username: "rightsHolder",
			formatId: "formatId",
			formatType: "formatType",
			inFullRobotList : "inFullRobotList",
			isRepeatVisit : "isRepeatVisit"
		},
		
		setNodeId: function(){
			if(nodeModel.get("currentMemberNode"))
				this.set("nodeId", nodeModel.get("currentMemberNode"));
		},
		
		/*
		 * Get the query string based on the attributes set in this model
		 */
		getQuery: function(){
			var query = "",
				model = this;
			
			var otherFilters = ["event", "formatType", "formatId", "id", "pid", "userAgent", "inFullRobotList", "isRepeatVisit", "dateAggregated", "dateLogged", "entryId", "city", "region", "location", "size", "username"];
			
			
			//-------nodeId--------
			if(this.filterIsAvailable("nodeId") && this.get("nodeId")){
				var value = this.get("nodeId");
				
				//Don't filter by nodeId when it is set to a CN
				if((typeof value == "string") && (value.substr(value.lastIndexOf(":")+1, 2).toLowerCase() != "cn")){
					//For multiple values
					if(Array.isArray(value) && value.length){
						query += "+" + model.getGroupedQuery(model.fieldNameMap["nodeId"], value, { operator: "OR", subtext: false });				
					}
					else if(value && value.length){
						// Does this need to be wrapped in quotes?
						if(model.needsQuotes(value)) value = "%22" + encodeURIComponent(value) + "%22";
						else value = encodeURIComponent(value);
						
						query += "+" + model.fieldNameMap["nodeId"] + ":" + value;
					}
				}
				else if(Array.isArray("nodeId")){
					query += "+" + model.getGroupedQuery(model.fieldNameMap["nodeId"], value, { operator: "OR", subtext: false });				
				}
			}
			
			//-----Other Filters/Basic Filters-----			
			_.each(otherFilters, function(filterName){
				if(model.filterIsAvailable(filterName)){
					var filterValue = null;
					var filterValues = model.get(filterName);
				
					//Check that this filter is set
					if((typeof filterValues == "undefined") || !filterValues) return;

					//For multiple values
					if(Array.isArray(filterValues) && filterValues.length){
						query += "+" + model.getGroupedQuery(model.fieldNameMap[filterName], filterValues, { operator: "OR", subtext: false });				
					}
					else if(filterValues && filterValues.length){
						// Does this need to be wrapped in quotes?
						if(model.needsQuotes(filterValues)) filterValues = "%22" + encodeURIComponent(filterValues) + "%22";
						else filterValues = encodeURIComponent(filterValues);
						
						query += "+" + model.fieldNameMap[filterName] + ":" + filterValues;
					}
				}
			});
		
			return query;
		},
		
		getFacetQuery: function(){
			var query = "&facet=true&facet.limit=-1&facet.mincount=" + this.get("facetMinCount"),
				model = this;
			
			_.each(this.get("facets"), function(facetField, i, list){
				
				if(model.filterIsAvailable(facetField)){
					query += "&facet.field=" + facetField;					
				}
			});
		
			_.each(this.get("facetRanges"), function(facetField, i, list){
				if(model.filterIsAvailable(facetField)){
					  query += "&facet.range=" + facetField + 
					  			"&facet.range.start=" + model.get("facetRangeStart") +
					  			"&facet.range.end=" + model.get("facetRangeEnd") +
					  			"&facet.range.gap=" + model.get("facetRangeGap");
					  return;
				}
			});
			
			return query;
		}
	
	});
	return LogsSearch;
});