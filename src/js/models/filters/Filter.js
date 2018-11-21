/* global define */
define(['jquery', 'underscore', 'backbone'],
    function($, _, Backbone) {

	var FilterModel = Backbone.Model.extend({

    //Default attributes for this model
    defaults: function(){
      return{
        objectDOM: null,
        fields: [],
        values: [],
        operator: "AND",
        exclude: false,
        matchSubstring: true,
        label: null,
        placeholder: null,
        icon: null,
        description: null
      }
    },

    /*
    * This function is executed whenever a new FilterModel is created.
    */
    initialize: function(){
      if( this.get("objectDOM") ){
        this.set( this.parse(this.get("objectDOM")) );
      }
    },

    /*
    * Parses the given XML node into a JSON object to be set on the model
    *
    * @param {Element} xml - The XML element that contains all the filter elements
    * @return {JSON} - The JSON object of all the filter attributes
    */
    parse: function(xml){

      //If an XML element wasn't sent as a parameter, get it from the model
      if(!xml){
        var xml = this.get("objectDOM");

        //Return an empty JSON object if there is no objectDOM saved in the model
        if(!xml)
          return {};
      }

      var modelJSON = {};

      //Parse the field(s)
      modelJSON.fields = this.parseTextNode(xml, "field", true);
      //Parse the value(s)
      modelJSON.values = this.parseTextNode(xml, "value", true);
      //Parse the label
      modelJSON.label = this.parseTextNode(xml, "label");
      //Parse the icon
      modelJSON.icon = this.parseTextNode(xml, "icon");
      //Parse the placeholder
      modelJSON.placeholder = this.parseTextNode(xml, "placeholder");
      //Parse the description
      modelJSON.description = this.parseTextNode(xml, "description");

      //Parse the operator, if it exists
      if( $(xml).find("operator").length )
        modelJSON.operator = this.parseTextNode(xml, "operator");

      //Parse the exclude, if it exists
      if( $(xml).find("exclude").length )
        modelJSON.exclude = (this.parseTextNode(xml, "exclude") === "true")? true : false;

      return modelJSON;

    },

    /*
    * Gets the text content of the XML node matching the given node name
    *
    * @param {Element} parentNode - The parent node to select from
    * @param {string} nodeName - The name of the XML node to parse
    * @param {boolean} isMultiple - If true, parses the nodes into an array
    * @return {(string|Array)} - Returns a string or array of strings of the text content
    */
    parseTextNode: function( parentNode, nodeName, isMultiple ){
      var node = $(parentNode).children(nodeName);

      //If no matching nodes were found, return falsey values
      if( !node || !node.length ){

        //Return an empty array if the isMultiple flag is true
        if( isMultiple )
          return [];
        //Return null if the isMultiple flag is false
        else
          return null;
      }
      //If exactly one node is found and we are only expecting one, return the text content
      else if( node.length == 1 && !isMultiple ){
        return node[0].textContent;
      }
      //If more than one node is found, parse into an array
      else{

        return _.map(node, function(node){
          return node.textContent || null;
        });

      }
    },

    /*
     * Builds a query string that represents this filter.
     *
     * @return {string} The query string to send to Solr
     */
    getSolrQuery: function(){

      //Check that there are actually values to serialize
      if( !this.get("values").length ){
        return "";
      }
      else if( _.every(this.get("values"), function(value){
        return (value === null || typeof value == "undefined" || value === NaN || value === "");
      }) ){
        return "";
      }

      //Start a query string for this model and get the fields
      var queryString = "",
          fields = this.get("fields");

      //If the fields are not an array, convert it to an array
      if( !Array.isArray(fields) ){
        fields = [fields];
      }

      //Iterate over each field
      _.each( fields, function(field, i){

        //Add the query string for this field to the overall model query string
        queryString += field + ":" + this.getValueQuerySubstring();

        //Add the OR operator between field names
        if( fields.length > i+1 && queryString.length ){
          queryString += "%20OR%20";
        }

      }, this);

      //If there is more than one field, wrap the multiple fields in parenthesis
      if( fields.length > 1 ){
        queryString = "(" + queryString + ")"
      }

      //If this filter should be excluding matches from the results,
      // then add a hyphen in front
      if( this.get("exclude") ){
        queryString = "-" + queryString;
      }

      return queryString;

    },

    /*
    * Constructs a query substring for each of the values set on this model
    *
    * @example
    *    Model `value` attribute: ["walker", "jones"]
    *    Returns: "(walker%20OR%20jones)"
    *
    * return {string} The query substring
    */
    getValueQuerySubstring: function(){
      //Start a query string for this field and get the values
      var valuesQueryString = "",
          values = this.get("values");

      //If the values are not an array, convert it to an array
      if( !Array.isArray(values) ){
        values = [values];
      }

      //Iterate over each value set on the model
      _.each( values, function(value, i){

        //Trim off whitespace
        value = value.trim();

        //Add the value to the query string. Wrap in wildcards, if specified
        if( value.indexOf(" ") > -1 ){
          valuesQueryString = '"' + value + '"';
        }
        else if( this.get("matchSubstring") ){

          //Look for existing wildcard characters at the end of the value string
          if( value.match( /^\*|\*$/ ) ){
            valuesQueryString += value;
          }
          //Wrap the value string in wildcard characters
          else{
            valuesQueryString += "*" + value + "*";
          }

        }
        else{
          //Add the value to the query string
          valuesQueryString += value;
        }

        //Add the operator between values
        if( values.length > i+1 && valuesQueryString.length ){
          valuesQueryString += "%20" + this.get("operator") + "%20";
        }

      }, this);

      if( values.length > 1 ){
        valuesQueryString = "(" + valuesQueryString + ")"
      }

      return valuesQueryString;
    }

  });

  return FilterModel;

});
