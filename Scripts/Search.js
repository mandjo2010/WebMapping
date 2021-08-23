import { Vector } from "ol/layer";
import VectorSource from "ol/src/source/Vector";
import { Style, Stroke} from "ol/style";
import { WFS, GeoJSON } from "ol/format";
import {and, equalTo } from "ol/format/filter";


const map=$('#map').data('map');
const searchBtn=$('#search');
const wfsUrl='http://192.168.0.29:8080/geoserver/Trainingwfs';

const vectorSource=new VectorSource();
const style=new Style({
    // @ts-ignore
    stroke:new Stroke({
        color:'blue',
        width:2
    })
})

const vector=new Vector({
    // @ts-ignore
    source:vectorSource,
    style:style
});

map.addLayer(vector);

searchBtn.click(function(){

    const parcel=$('#parcelInput').val().toString();
    const block=$('#blockInput').val().toString();

    if(parcel.length==0){
        window.alert('Please enter parcel number');
    }
    if(block.length==0){
        window.alert('Please enter block number');
    }

    // @ts-ignore
    const featureRequest = new WFS().writeGetFeature({
        srsName:'EPSG:28191',
        featureNS:'http://192.168.0.29:8080/geoserver/Training',
        featurePrefix:'Parcels',
        outputFormat:'application/json',
        // @ts-ignore
        filter:and(
            equalTo('parcel_n',parcel),
            equalTo('block_n',block)
        )
    });
    fetch(wfsUrl,{
        method:'POST',
        body:new XMLSerializer().serializeToString(featureRequest)    
    }).then(function(response){
        return response.json();
    }).then(function(json){

        if(json.features.length>0)
        {
            const features=new GeoJSON().readFeatures(json);
            vectorSource.clear(true);
            // @ts-ignore
            vectorSource.addFeatures(features);

            map.getView().fit(vectorSource.getExtent(), {'padding':[100,100,100,100]});
        }
        else{
            window.alert('No features found');
        }
    })
});