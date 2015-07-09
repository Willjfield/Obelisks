// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};
//get current date
var thisYear = new Date().getFullYear();
//color for markers indicating that location is not exact
var notExactMarker = Cesium.Color.fromCssColorString('rgba(255,0,0,.2)');
//pick a Dynamic Object
function pickDynamicObject(e) {
    var picked = viewer.scene.pick(e.position);
    if (defined(picked)) {
        var id = defaultValue(picked.id, picked.primitive.id);
        if (id instanceof DynamicObject) {
            console.log(id);
        }
    }
};
//Plot the path that an obelisk has taken
function obPath(data, obid, view, color){
  var icoords = [];
  for (var i in data.features){ 
    if (data.features[i].properties.id == obid){
      for(var j in data.features[i].geometry.coordinates){
         icoords.push(data.features[i].geometry.coordinates[j][0]);
         icoords.push(data.features[i].geometry.coordinates[j][1]);
      }
      view.entities.add({
      polyline : {
      positions : Cesium.Cartesian3.fromDegreesArray(icoords),
      width : 1,
      material : color
        }
      });   
    }
  }
};
//plot points at each location the obelisk has been
function obPoint(data, obid, view, color){
  for (var i in data.features){
    if (data.features[i].properties.id == obid){
      for(var j in data.features[i].geometry.coordinates){
         var icoords = [];
         icoords.push(data.features[i].geometry.coordinates[j][0]);
         icoords.push(data.features[i].geometry.coordinates[j][1]);
         view.entities.add({
          position: Cesium.Cartesian3.fromDegrees(icoords[0], icoords[1], 150000.0),
          name : 'Green circle at height',
          ellipse : {
              semiMinorAxis : 100000.0,
              semiMajorAxis : 100000.0,
              height: 1.0,
              material : color
          }
        });
      }
    }    
  }
};
//generate models for all locations of an obelisk
function createModels(data, obid, view,height,heading,scale,pitch,roll){
  scale = typeof scale !== 'undefined' ? scale :1;
  heading = typeof heading !== 'undefined' ? heading :0;
  heading = Cesium.Math.toRadians(heading);
  height = typeof height !== 'undefined' ? height :0;
  roll = typeof roll !== 'undefined' ? roll :0;
  roll = Math.radians(roll);
  pitch = typeof pitch !== 'undefined' ? pitch :0;
  pitch = Math.radians(pitch);

  for (var i in data.features){
    if (data.features[i].properties.id == obid){
      for(var ex=0; ex<data.features[i].properties.exact.length;ex++){  
        if(data.features[i].properties.exact[ex]==false){
          var icoords = [];
          for(var c in data.features[i].geometry.coordinates[ex]){
          icoords.push(data.features[i].geometry.coordinates[ex][c]);
            if(icoords.length>1){
              view.entities.add({
              position: Cesium.Cartesian3.fromDegrees(icoords[0], icoords[1], 150000.0),
              name : 'Green circle at height',
              ellipse : {
                  semiMinorAxis : 1000.0,
                  semiMajorAxis : 1000.0,
                  height: 1.0,
                  material : notExactMarker
              }
            });
          }
        }
      }
    }
      for(var j in data.features[i].geometry.coordinates){
         var icoords = [];
         for(var c in data.features[i].geometry.coordinates[j]){
          icoords.push(data.features[i].geometry.coordinates[j][c]);
            if(icoords.length>1){

            createModel(data,view, obid, icoords[0],icoords[1],height,heading,scale, pitch,
            roll);
          }
        }
      }
    }
  }
};    
//extract the start/end date from data as an array
function modelStartStop(data, obid, station){
  for (var i in data.features){
    if(data.features[i].properties.id==obid){
     for(var j = 0; j<data.features[i].properties.year_aquired.length;j++){
      if(j==station){
        var startYr = eval(data.features[i].properties.year_aquired[j]);
        if(station<data.features[i].properties.year_aquired.length-1){
        var endYr = eval(data.features[i].properties.year_aquired[j+1]);
      }else{
        var endYr = 2016;
      }
      var startDate = new Cesium.JulianDate((startYr-(-4712))*365.25);
        var endDate = new Cesium.JulianDate((endYr-(-4712))*365.25);
        return [startDate, endDate];
      }
     }
    }
  }
};
//find where an obelisk is at a given time
function movement(view, data, currTime){
  for (var i in data.features){
    for (var j in data.features[i].properties.year_aquired){
      var _startStop = [];
      _startStop = modelStartStop(data, data.features[i].properties.id, j);
        // console.log(_startStop[0].dayNumber);
        // console.log(currTime.dayNumber);
        // console.log(_startStop[1].dayNumber);
        // console.log('\n');
      if(_startStop[1].dayNumber>currTime.dayNumber && _startStop[0].dayNumber<currTime.dayNumber){         
        //console.log("Obelisk "+data.features[i].properties.id+" is now in "+data.features[i].properties.city[j]);
       $("#timelineInfo").append("<div>Obelisk "+data.features[i].properties.id+" is now in "+data.features[i].properties.city[j]+". It was "+data.features[i].properties.means_aquired[j]+" for "+data.features[i].properties.owner[j]+", "+Math.round(((currTime.dayNumber-_startStop[0].dayNumber)/365.25))+" years ago. </div>");
      }
    }
  }
};
//create an individual model
function createModel(data,view,obid,long,lat,height,heading,scale,pitch,
    roll) {
    url = 'data/models/obelisks/'+obid+'/Ob'+obid+'.gltf';
    scale = typeof scale !== 'undefined' ? scale :1;
    heading = typeof heading !== 'undefined' ? heading :1;
    roll = typeof roll !== 'undefined' ? roll :0;
    pitch = typeof pitch !== 'undefined' ? pitch :0;
    
    /* add random jitter to locations that aren't exact so they don't appear on top of each other
    for(var i in data.features){
      console.log(data.features[i]);
      for(var ex in data.features[i].properties.exact){  
        if(data.features[i].properties.exact[ex]==false){
            var jitter = Math.random();
              console.log(jitter);
             long+=jitter*.0001;
              lat+=jitter*.0001;
            }
          }
        }
        */
    var position = Cesium.Cartesian3.fromDegrees(long,lat,height);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, heading, pitch, roll);

    var entity = view.entities.add({
        name : url,
        position : position,
        orientation : orientation,
        model : {
          scale : scale,
            uri : url,          
        }
    });
    view.trackedEntity = entity;
    console.log(obid+" has no model");
};
//extract the year the obelisk was aquired
function yearAquired(data, obid, city){
  for (var i in data.features){
    if(data.features[i].properties.id==obid){
      for(var cit in data.features[i].properties.city){
        if(data.features[i].properties.city[cit]==city){
            console.log(data.features[i].properties.city[cit]);
            return data.features[i].properties.year_aquired[cit]; 
        }
      }
    }
  }
};
//find out how long the obelisk has been in a given location
//DOESN'T WORK FOR OBELISKS MOVED WITHIN A CITY
function timeOnLocation(data, obid, city){
  for (var i in data.features){
    if(data.features[i].properties.id==obid){
      for(var cit=0;cit<data.features[i].properties.city.length;cit++){
        if(data.features[i].properties.city[cit]==city){
            if(cit<data.features[i].properties.year_aquired.length-1){
            return (data.features[i].properties.year_aquired[cit+1]-data.features[i].properties.year_aquired[cit]);
            }else{
            return thisYear-data.features[i].properties.year_aquired[cit];
            }
        }
      }
    }
  }
};

//Plot how long obelisks have been on each site
function obCol(data, obid, view){
for (var i in data.features){
  if (data.features[i].properties.id == obid){
    for(var j in data.features[i].geometry.coordinates){
      var cityName = data.features[i].properties.city[j];
        var cityHeight = timeOnLocation(data,obid,cityName);
        
        if(cityHeight >0 ){
          console.log(cityHeight);
           var icoords = [];
           icoords.push(data.features[i].geometry.coordinates[j][0]);
           icoords.push(data.features[i].geometry.coordinates[j][1]);
              view.entities.add({
              position : Cesium.Cartesian3.fromDegrees(icoords[0], icoords[1], .5*(cityHeight*1000)),
              cylinder : {
                length : cityHeight*1000,
                topRadius : 25000.0,
                bottomRadius : 25000.0,
                outline : true,
                outlineColor : Cesium.Color.WHITE,
                outlineWidth : 1,
                material : Cesium.Color.fromRandom({alpha : 1.0})
                }
          });
        }
      }
    }    
  }
};
//pick an object so it can be sent out of cesium
function pickObject(entity, data){
  var obid =  parseInt(entity._properties.id);
  var step;
  
  var entPos = entity._position._value;
  for(var i in data.features){
    if(data.features[i].properties.id==obid){
      for(var c in data.features[i].geometry.coordinates){
      var testPos = new Cesium.Cartesian3.fromDegreesArray(data.features[i].geometry.coordinates[c]);
      var dist = (testPos[0].x+testPos[0].y+testPos[0].z)-(entPos.x+entPos.y+entPos.z);
        if(dist==0){
          step = c;
          //console.log('step '+c);
        }
      }
    }
  }
  return [obid, parseInt(step)];
};
/*==========================*/
// Infobox JS
// function info(data, obid, step){
//     //data = geoJ;
//     //console.log(data);
//     //set the obelisk's id to 21 (this is the new york one), we can dynamically change this later but it might be easier while developing to work with one
//     var cityName;
//     var year;
//     var stop = step + 1;
//     var yrbuilt;
//     var sum;
//     var commissioned;
//     var distance;
//     var des;
//     var pic;

//     //for each item in the data's "features" field
//     for (var i in data.features){     
//       //look through the feature's properties and see if the id matches the obid we set
//       if (data.features[i].properties.id == obid){
//         cityName= data.features[i].properties.city[step];
//         year= data.features[i].properties.year_aquired[step];
//       yrbuilt= data.features[i].properties.year_aquired[0];
//       des= data.features[i].properties.text[step];
//       sum= year-yrbuilt;
//       commissioned = data.features[i].properties.commission;
//       //console.log(data.features[i].geometry.coordinates[step]);
//       if(step>0){
//       distance= Math.round(distanceBetween(data.features[i].geometry.coordinates[step], data.features[i].geometry.coordinates[step-1]));
//       }else{
//         distance=0;
//       }
//       pic=data.features[i].properties.image_url[0];
//       //console.log(pic);

      
//       here is how you can look at all the properties for that obelisk, inside this if statement/for loop:
//       data.features[i].properties.origin - where the obelisk was built 
//       data.features[i].properties.commission - who it was commissioned for
//       data.features[i].properties.height - height
//       data.features[i].properties.weight - weight
//       data.features[i].properties.city[step] - an array of each city the obelisk has been in, in chronological order. Obelisk 21 went from Heliopolis to Alexandria to New York so this property is an array that equals ['Heliopolis','Alexandria','New York']
      
//       There are more properties that you can find if you look in the geojson. If you want to add more from the csv into the geojson, feel free!
      
//       //...look through each set of coordinates in that feature's geometry
//         for(var j in data.features[i].geometry.coordinates){
//             //create an array called icoords
//            var icoords = [];
//            //put each number inside each coordinate into an array
//            icoords.push(data.features[i].geometry.coordinates[j][0]);
//            icoords.push(data.features[i].geometry.coordinates[j][1]);
//            //you now have a 2 item array with one of the positions for obelisk 21, you can use it to do whatever you want like create a circle or marker
//           }
//         }    
//       }
//       $("#step").replaceWith("<div class='city' id='step'>"+cityName+"</div>");
//       $("#yearErected").replaceWith("<l id='yearErected'>"+year+"</l>");
//       $("#station").replaceWith("<l id='station'>"+stop+"</l>");
//       $("#totalYears").replaceWith("<l id='totalYears'>"+sum+"</l>");
//       $("#commissionedBy").replaceWith("<l id='commissionedBy'>"+commissioned+"</l>");
//       $("#dist").replaceWith("<l id='dist'>"+distance+" km</l>");
//       $("#description").replaceWith("<id class='description'>"+des+"</l>");
//       $("#picture").replaceWith("<img id='#picture' src="+pic+"></img>");
//     };