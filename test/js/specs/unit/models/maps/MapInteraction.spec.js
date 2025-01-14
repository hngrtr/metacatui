define([
  "../../../../../../../../src/js/models/maps/MapInteraction",
], function (MapInteraction) {
  // Configure the Chai assertion library
  var should = chai.should();
  var expect = chai.expect;

  describe("MapInteraction Test Suite", function () {
    /* Set up */
    beforeEach(function () {});

    /* Tear down */
    afterEach(function () {});

    describe("Initialization", function () {
      it("should create a MapInteraction instance", function () {
        new MapInteraction().should.be.instanceof(MapInteraction);
      });
    });


    describe("setting user interactions", function () {

      it("should set the mouse position", function () {
        const model = new MapInteraction();
        const position = { longitude: 1, latitude: 2 };
        model.setMousePosition(position);
        model.get("mousePosition").get("latitude").should.equal(2);
        model.get("mousePosition").get("longitude").should.equal(1);
      });

      it("should set the scale", function () {
        const model = new MapInteraction();
        const scale = { meters: 1, pixels: 2 };
        model.setScale(scale);
        model.get("scale").get("meters").should.equal(1);
        model.get("scale").get("pixels").should.equal(2);
      });

      it("should set the view extent", function () {
        const model = new MapInteraction();
        const extent = { north: 1, east: 2, south: 3, west: 4 };
        model.setViewExtent(extent);
        model.get("viewExtent").get("north").should.equal(1);
        model.get("viewExtent").get("east").should.equal(2);
        model.get("viewExtent").get("south").should.equal(3);
        model.get("viewExtent").get("west").should.equal(4);
      });
    });

  });
});