//url to geojson file
var testURL = 'https://gist.githubusercontent.com/Willjfield/140528afdc897591f3e0/raw/46f25fb6c12e52b3b4a61b553bc8656a885913e8/obelisks51515.geojson';
var dataURL = 'https://gist.githubusercontent.com/Willjfield/140528afdc897591f3e0/raw/e20b0ee7518bddfea1d74a06ff8316fc2a40753a/obelisks51515.geojson';
//Load the data
var enteredObs = ['17','19','20','21'];

var closeIFrame = function() {
   $('#information').hide();
 }
var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;

 if( width>600 && height>500 ) {
    console.log("not mobile!");
    $("#notMobile").hide();
 }

window.onresize = function() {
  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
   if( width<600 || height<500 ) {
      console.log("mobile!");
      $("#notMobile").show();
   }else{
     console.log("not mobile!");
     $("#notMobile").hide();
   }
};

$.getJSON(dataURL, function(geoJ) {
  //JQuery functions to interact with html
  $("#pPath").click(function(){
    var selectedOb = $("#obid").val();
    if($.inArray(selectedOb, enteredObs)> -1){
      $("#warning").empty();

      var obid = $("#obid").val();
      var r = Math.random();
      var g = Math.random();
      var b = Math.random();
      var color = new Cesium.Color(r,g,b,1);
      obPath(geoJ, obid, viewer, color);

    }else{
      $("#warning").replaceWith("<l id='warning'>Enter a valid obelisk ID</l>");
    }

  });

  $("#selectObelisk").hover(function(){
    $(".expand").toggleClass("active");
  });

  $("#pPoints").click(function(){
    var selectedOb = $("#obid").val();
    if($.inArray(selectedOb, enteredObs)> -1){
      $("#warning").empty();
      var obid = $("#obid").val();
      var r = Math.random();
      var g = Math.random();
      var b = Math.random();
      var color = new Cesium.Color(r,g,b,.8);
      obPoint(geoJ, obid, viewer, color);
    }else{
      $("#warning").replaceWith("<l id='warning'>Enter a valid obelisk ID</l>");
    }
  });

  $("#pTime").click(function(){
    var selectedOb = $("#obid").val();
    if($.inArray(selectedOb, enteredObs)> -1){
      $("#warning").empty();
      var obid = $("#obid").val();
      var r = Math.random();
      var g = Math.random();
      var b = Math.random();
      var color = new Cesium.Color(r,g,b,.8);
      obCol(geoJ, obid, viewer);
    }else{
      $("#warning").replaceWith("<div id='warning'>Enter a valid obelisk ID</div>");
    }
  });

  $("#allClear").click(function(){
    viewer.entities.removeAll();
    //Draw models
    for(var i in geoJ.features){
      if(geoJ.features[i].properties.has_model){
        createModels(geoJ,geoJ.features[i].properties.id,viewer,0,
          geoJ.features[i].properties.model_hspr[0],
          geoJ.features[i].properties.model_hspr[1],
          geoJ.features[i].properties.model_hspr[2],
          geoJ.features[i].properties.model_hspr[3]);
        }
      }
    });
    //declare/init variables
    var currentTime;

    var jsStart = new Date (500,1);
    var jsEnd = new Date (2000,1);

    var startDate = Cesium.JulianDate.fromDate(jsStart);
    var endDate = Cesium.JulianDate.fromDate(jsEnd);
    //declare viewer and make settings
    var viewer = new Cesium.Viewer('cesiumContainer', {
      infoBox : false,
      homeButton: false,
      geocoder: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      selectionIndicator : true,
      timeline: true
    });
    //pick an object
    handler = new Cesium.ScreenSpaceEventHandler();
    handler.setInputAction(function(mouseMoveEvent){
      var pickedObject = scene.pick(mouseMoveEvent);
      var selectedEntity = viewer.selectedEntity;
      sessionStorage.step=pickObject(selectedEntity,geoJ)[1];
      sessionStorage.obid=pickObject(selectedEntity,geoJ)[0];
      console.log(pickObject(selectedEntity,geoJ));
      $("#information").replaceWith( "<iframe id='information' class = 'obframe' src='obframe.html'></iframe>");

    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //add markers for each point
    viewer.dataSources.add(Cesium.GeoJsonDataSource.load(dataURL, {
      stroke: Cesium.Color.BLACK,
      fill: Cesium.Color.BLACK,
      strokeWidth: 3,
      markerSize: 16,
      markerSymbol: '+'
    }));
    //create scene
    var scene = viewer.scene;
    //initialize timeline
    viewer.timeline.zoomTo(startDate,endDate);
    //set up the clock
    var clock = new Cesium.Clock({
      startTime : startDate,
      currentTime : endDate,
      stopTime : Cesium.JulianDate.fromIso8601("2015-09-26"),
      clockRange : Cesium.ClockRange.UNBOUNDED,
      multiplier: 1.0,
      clockStep : Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
      canAnimate: false
    });
    //get the current time in the timeline
    viewer.clock.onTick.addEventListener(function(clock) {
      $("#timelineInfo").empty();
      var currentTime = clock.currentTime;
      movement(viewer, geoJ, currentTime);
    });
    /* Draw terrain, may bury some obelisks
    var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
    });
    viewer.terrainProvider = terrainProvider;
    */
    //Draw models
    for(var i in geoJ.features){
      if(geoJ.features[i].properties.has_model){
        createModels(geoJ,geoJ.features[i].properties.id,viewer,0,
          geoJ.features[i].properties.model_hspr[0],
          geoJ.features[i].properties.model_hspr[1],
          geoJ.features[i].properties.model_hspr[2],
          geoJ.features[i].properties.model_hspr[3]);
        }
      }
      viewer.zoomTo(viewer.entities);

    });
