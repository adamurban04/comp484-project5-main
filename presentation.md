# Google Maps API Features Presentation
   
## Geometry Library  
- has function containsLocation(), which works with checking whether a click was inside a polygon  
- the buildings are polygons
   
1. I load the library alongside the main API:  
const script = document.createElement("script");  
   
2. I built paths for all buildings and convert each into a Polygon object  
const LOCATION_BOUNDS  
location.checkPolygon = new google.maps.Polygon   
    
3. I check whether the click location (latLng) is inside the polygon (+ handle the outcome)   
return google.maps.geometry.poly.containsLocation(latLng, location.checkPolygon);    
    
   
## Ground Overlays   
   
- allows placing fixed rectangular images on top of the map at specific (geographic) bounds.  
- images of buildings on top of the map as an overlay  
- hint if the player needs it  
  
1. store bounds for overlays  
also stored in LOCATION_BOUNDS but as rectangle  
  
2. create overlays objects for each image based on the bounds    
return new google.maps.GroundOverlay(location.overlayImage, overlayBounds  
  
3. use button to show them  
buildingOverlays.forEach((overlay) => overlay.setMap(visible ? map : null));  
