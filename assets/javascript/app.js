//stores our response from ajax call 
var foodTrucks = [];

//google maps variable
var map;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDhOKTWKmEunuZ7nIHZETJ-lwLzRsHVmDE",
  authDomain: "the-jarrod-experience.firebaseapp.com",
  databaseURL: "https://the-jarrod-experience.firebaseio.com",
  projectId: "the-jarrod-experience",
  storageBucket: "the-jarrod-experience.appspot.com",
  messagingSenderId: "31955044813"
};

firebase.initializeApp(config);

//searches for food trucks based on type of food
function callFood(){
    //gets input 
    var food = $("#food-input").val().trim();
    console.log("this is food " + food);
    //api url
    var queryURL = "https://data.sfgov.org/resource/bbb8-hzi6.json?$q=" + food;

    $.ajax({
      url: queryURL,
      method: "GET"
  // data:{
  //   "$limit" : 5000,
    // "$app_token" : "dVrLcfTa7uHoJirIBxSAw9eo8" TODO: throws error?
  // }
  }).done(function(response){
    //asigns response to global foodTrucks array
    foodTrucks=response;
    //adds markers to google maps for each food truck
    addTrucks();

//clear input value
$("#food-input").val(' ');
});
} //callFood endtag

$(document).on("click", "#food-search", callFood);


//google maps 

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: new google.maps.LatLng(2.8,-187.3),
    mapTypeId: 'terrain'
  });
}

// Loop through the results array and place a marker for each
// set of coordinates.
function addTrucks(){
  //logs our response 
  console.log(foodTrucks);
  for (var i = 0; i < foodTrucks.length; i++) {
    //sets latitude and longitude of each foodTruck to variable latlng
    var latLng = new google.maps.LatLng(foodTrucks[i].latitude, foodTrucks[i].longitude);
    //creates a new marker
    var marker = new google.maps.Marker({
      //sets position as latLng variable
      position: latLng,
      //adds marker to map
      map: map
    });
  }
}

  //populating our list view of food trucks
//   for (i = 0; i <= 10; i++){

//     var tr = $("<tr>");
//     var truckName = $("<td>").text(foodTrucks[i].applicant);
//     var cuisines = $("<td>");
//     var hours = $("<td>");
//     var truckLocation = $("<td>").text(foodTrucks[i].PermitLocation);
//     tr.append(truckName).append(cuisines).append(hours).append(truckLocation);
//     $(".data").prepend(tr);
//   }
// }
  
//match up the start and end time and date of the food truck with the current time and date
  //make sure that the current time falls between the start and end time and the date of the food truck
    //then it will be displayed 

//moment js 

