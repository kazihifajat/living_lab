var map = L.map('map').setView([22.57,88.37],13)

var osm = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
)

var satellite = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
)

var terrain = L.tileLayer(
'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
)




osm.addTo(map)




// ------------------ Layers ------------------
var fieldLayer
var wetlandLayer
var bufferLayer
var adamasLayer

var fieldData = null

// ------------------ Popup Generator ------------------
function popupContent(props){

let mode = document.getElementById("hoverMode").value

let text = ""

if(mode === "geo" || mode === "both"){

text += "<b>Location:</b> "+(props.Location_N || "N/A")+"<br>"
text += "<b>Longitude:</b> "+(props.X || "N/A")+"<br>"
text += "<b>Latitude:</b> "+(props.Y || "N/A")+"<br><br>"

}

if(mode === "output" || mode === "both"){

text += "<b>pH:</b> "+(props.pH || "N/A")+"<br>"
text += "<b>EC:</b> "+(props.EC__mS_cm_ || "N/A")+"<br>"
text += "<b>TDS:</b> "+(props.TDS__mg_L_ || "N/A")+"<br>"
text += "<b>Temp:</b> "+(props.Temp_Water || "N/A")+"<br>"

}

return text
}

// ------------------ Update Popups ------------------
function updatePopups(){

if(!fieldLayer) return

fieldLayer.eachLayer(function(layer){

var props = layer.feature.properties

layer.bindPopup(popupContent(props))

})

}

// ------------------ Load Field Data ------------------
fetch("data/Field_Data.geojson")
.then(r=>r.json())
.then(data=>{

fieldData = data

fieldLayer = L.geoJSON(data,{

pointToLayer:(f,latlng)=>L.circleMarker(latlng,{
radius:6,
color:"red",
fillOpacity:0.8
}),

onEachFeature:(feature,layer)=>{
layer.bindPopup(popupContent(feature.properties))
}

}).addTo(map)

})

// ------------------ Wetlands ------------------
fetch("data/Big_Wetlands.geojson")
.then(r=>r.json())
.then(data=>{

let adamasFeatures=[]
let wetlandFeatures=[]

data.features.forEach(f=>{

if(f.properties.identity==="Adamas Lab"){
adamasFeatures.push(f)
}else{
wetlandFeatures.push(f)
}

})

wetlandLayer = L.geoJSON(wetlandFeatures,{
style:{
color:"blue",
fillOpacity:0.3
}
}).addTo(map)

adamasLayer = L.geoJSON(adamasFeatures,{
style:{
color:"orange",
weight:3,
fillOpacity:0.5
}
}).addTo(map)

map.fitBounds(adamasLayer.getBounds())

})

// ------------------ Buffer ------------------
fetch("data/Buffer.geojson")
.then(r=>r.json())
.then(data=>{

bufferLayer = L.geoJSON(data,{
style:{
color:"green",
fillOpacity:0.2
}
})

})

// ------------------ Layer Toggles ------------------
document.getElementById("fieldToggle").onchange=function(){

if(this.checked) map.addLayer(fieldLayer)
else map.removeLayer(fieldLayer)

}

document.getElementById("wetlandToggle").onchange=function(){

if(this.checked) map.addLayer(wetlandLayer)
else map.removeLayer(wetlandLayer)

}

document.getElementById("bufferToggle").onchange=function(){

if(this.checked) map.addLayer(bufferLayer)
else map.removeLayer(bufferLayer)

}


document.getElementById("adamasToggle").onchange=function(){

if(this.checked){
map.addLayer(adamasLayer)
}else{
map.removeLayer(adamasLayer)
}

}





// ------------------ Hover Mode Change ------------------
document.getElementById("hoverMode").addEventListener("change",function(){

updatePopups()

})

// ------------------ Basemap Switch ------------------
document.getElementById("basemap").onchange=function(){

map.removeLayer(osm)
map.removeLayer(satellite)
map.removeLayer(terrain)

if(this.value === "osm") osm.addTo(map)
if(this.value === "satellite") satellite.addTo(map)
if(this.value === "terrain") terrain.addTo(map)

}