"use strict";

define(["backbone"], function (Backbone) {
  /**
   * @class GeoPoint
   * @classdesc The GeoPoint model stores geographical coordinates including
   * latitude, longitude, and height in meters above sea level.
   * @classcategory Models/Maps
   * @name GeoPoint
   * @since x.x.x
   * @extends Backbone.Model
   */
  var GeoPoint = Backbone.Model.extend(
    /** @lends GeoPoint.prototype */ {
      /**
       * The type of model this is.
       * @type {String}
       */
      type: "GeoPoint",

      /**
       * Overrides the default Backbone.Model.defaults() function to specify
       * default attributes for the GeoPoint.
       * @returns {Object} The default attributes
       * @property {number} latitude - The latitude of the point in degrees
       * @property {number} longitude - The longitude of the point in degrees
       * @property {number} height - The height of the point in meters above sea
       * level
       */
      defaults: function () {
        return {
          latitude: null,
          longitude: null,
          height: null
        };
      },

      /**
       * Get the long and lat of the point as an array
       * @returns {Array} An array in the form [longitude, latitude]
       */
      to2DArray: function () {
        return [this.get("longitude"), this.get("latitude")];
      },

      /**
       * Convert the point to a GeoJSON geometry object
       * @returns {Object} A GeoJSON geometry object with the type (Point) and
       * coordinates of the point
       */
      toGeoJsonGeometry: function () {
        return {
          type: "Point",
          coordinates: this.to2DArray()
        };
      },

      /**
       * Convert the point to a GeoJSON feature object
       * @returns {Object} A GeoJSON feature object with the type (Feature) and
       * geometry of the point
       */
      toGeoJsonFeature: function () {
        return {
          type: "Feature",
          geometry: this.toGeoJsonGeometry(),
          properties: {}
        };
      },

      /**
       * Validate the model attributes
       * @param {Object} attrs - The model's attributes
       */
      validate: function(attrs) {
        if (attrs.latitude < -90 || attrs.latitude > 90) {
          return "Invalid latitude. Must be between -90 and 90.";
        }
        
        if (attrs.longitude < -180 || attrs.longitude > 180) {
          return "Invalid longitude. Must be between -180 and 180.";
        }

        // Assuming height is in meters and can theoretically be below sea
        // level. Adjust the height constraints as needed for your specific
        // application.
        if (typeof attrs.height !== 'number') {
          return "Invalid height. Must be a number.";
        }
      }
    }
  );

  return GeoPoint;
});
