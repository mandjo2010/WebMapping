import 'ol/ol.css';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import {toLonLat} from 'ol/proj';
import {getLayerByName} from './customFunctions';




const map= $('#map').data('map');

/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


/**
 * Add an overlay to the map.
 */

map.addOverlay(overlay);


/**
 * Add a click handler to the map to render the popup.
 */
map.on('singleclick', function(evt) {
  if($('#draggable-title').text() !=="Measure")
  {
    var coordinate = evt.coordinate;
    var hdms = toStringHDMS(toLonLat(coordinate));
  
  
    // Getting The Layer by its name
    const parcelsLayer=getLayerByName('Parcels');
    const parcelsSource=parcelsLayer.getSource();
    const buildingsLayer=getLayerByName('Buildings');
    const buildingsSource=buildingsLayer.getSource();
    const view=map.getView();
    const resolution=view.getResolution();
    const projection=view.getProjection();
  
    const parcelInfo=$('#parcel-info');
    parcelInfo.html('');
    const buildingInfo=$('#building-info');
    buildingInfo.html('');
    const noFeatures=$('no-features');
    noFeatures.html('<p>No features</p>');
  
    const parcelUrl=parcelsSource.getFeatureInfoUrl(coordinate,resolution,projection,
      {'INFO_FORMAT':'application/json'});
    
    
      const buildingUrl=buildingsSource.getFeatureInfoUrl(coordinate,resolution,projection,
        {'INFO_FORMAT':'application/json'});
  
      if(parcelUrl)
      {
          $.ajax({
              url:parcelUrl,
              method:'GET',
              success:function(result){
                  const parcel=result.features[0];
                  if(parcel){
                    const parcelNumber=parcel.properties.parcel_n;
                    const blockNumber=parcel.properties.block_n;
                    const parcelArea=parcel.properties.shape_area;
    
                    parcelInfo.html(
                      `<h5>Parcel info</h5> 
                      <p>Parcel Number:${parcelNumber} </p> 
                      <p>Block Number:${blockNumber}</p>
                      <p>Area (sqm):${parcelArea.toFixed(2)}</p>
                      `);
                      noFeatures.html('');
  
                  }
              
              }
          })
      }
  
      if(buildingUrl)
      {
          $.ajax({
              url:buildingUrl,
              method:'GET',
              success:function(result){
                  const building=result.features[0];
                  if(building) {
                    const buildingNumber=building.properties.building_n;
                    const buildingArea=building.properties.shape_area;
    
                    buildingInfo.html(
                      `<h5>Building info</h5> 
                      <p>Building Number:${buildingNumber} </p> 
                      <p>Area (sqm):${buildingArea.toFixed(2)}</p>
                      `);
                     noFeatures.html(''); 
  
                  }
             
              }
          })
      }
  
   
    overlay.setPosition(coordinate);
  }
  
});