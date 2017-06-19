//stores our response from ajax call
var foodTrucks = [];
//filtered response
var currentFoodTrucks = [];
//stores users favorite trucks to send to firebase
var favoriteTrucks = [];
//google maps variable
var map;


//momentjs variables
var hourFormat = "HH:mm:ss";
var currentTime;
var truckStartTime;
var truckEndTime;
var currentIndex;

// Initialize Firebase
var config = {
apiKey: "AIzaSyDAjERE4gqWGHZr6CaEubs9jmKWHj-pmTw",
authDomain: "food-trucker-84cb9.firebaseapp.com",
databaseURL: "https://food-trucker-84cb9.firebaseio.com",
projectId: "food-trucker-84cb9",
storageBucket: "",
messagingSenderId: "533340638498"
};
firebase.initializeApp(config);
var database = firebase.database();
var currentUser;
//searches for food trucks based on type of food
function callFood(){
   //empty response from previous ajax call
   foodTrucks = [];
   currentFoodTrucks = [];
    //gets input
    var food = $("#food-input").val().trim();
    console.log("this is food " + food);
    //api url
    var queryURL = "https://data.sfgov.org/resource/bbb8-hzi6.json?$q=" + food;

    $.ajax({
      url: queryURL,
      method: "GET"
  
}).done(function(response){
    //asigns response to global foodTrucks array
    foodTrucks = response;
    //getCurrentTrucks function filters foodTrucks array by current date and time
    getCurrentTrucks();
    //adds markers to google maps for each food truck
    addTrucks();

//clear input value
$("#food-input").val(' ');
});


} //callFood endtag


//filters foodTrucks array by current date and time
function getCurrentTrucks(){
  var time = moment();
  currentFoodTrucks = [];
  for (var i = 0; i < foodTrucks.length; i++) {
    truckStartTime = moment(foodTrucks[i].start24, hourFormat);
    truckEndTime = moment(foodTrucks[i].end24, hourFormat);
    if(time.isBetween(truckStartTime, truckEndTime) && time.format('dddd') === foodTrucks[i].dayofweekstr){
       currentFoodTrucks.push(foodTrucks[i]);
    }
  }
}

//creates a new google map
function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 12
  });

  infoWindow = new google.maps.InfoWindow;

   // HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
} //Initmap endtag


//adds currentFoodTrucks to google maps and list view on document
function addTrucks(){
  $(".data").empty();
  //logs our response
  console.log(foodTrucks);
  //logs filtered response
  console.log(currentFoodTrucks);
  hideMarkers();
  createMarkers();
  addListView();
  
}

var markers = [];

function createMarkers() {
    // Loop through the results array and place a marker for each set of coordinates.
  for (var i = 0; i < currentFoodTrucks.length; i++){
    //sets latitude and longitude of each foodTruck to variable latlng
    var latLng = new google.maps.LatLng(currentFoodTrucks[i].latitude, currentFoodTrucks[i].longitude);
    //creates a new marker
    var marker = new google.maps.Marker({
      //sets position as latLng variable
      position: latLng,
      //adds marker to map
      map: map,
    });

    attachTruckName(marker, currentFoodTrucks[i].applicant);
    markers.push(marker);
  }
}


function hideMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null); //Remove the marker from the map
    }
}

// populating our list view of food trucks
function addListView () {
   for (i = 0; i < currentFoodTrucks.length; i++){
         var tr = $("<tr>");
         var truckName = $("<td>").text(currentFoodTrucks[i].applicant);
         var cuisines = $("<td>").text(currentFoodTrucks[i].optionaltext);
         var hours = $("<td>").text(currentFoodTrucks[i].starttime + '-' + currentFoodTrucks[i].endtime);
         var truckLocation = $("<td>").text(currentFoodTrucks[i].location);
         var addFavorite = $("<button>").text('Favorite').addClass('sendFavorite').attr("data-index", i);
         tr.append(truckName).append(cuisines).append(hours).append(truckLocation).append(addFavorite);
         $(".data").append(tr);
   }
 }
//addTrucks endtag

//Event closure endtag.
function attachTruckName (marker, array){
  var infowindow = new google.maps.InfoWindow({
    content: array
  });

  marker.addListener('mouseover', function() {
    infowindow.open(marker.get("map"), marker);
  });

  marker.addListener('mouseout', function() {
    infowindow.close(marker.get("map"), marker);
  });
} //attachTruckName endtag

//gets active user's email
function getCurrentUser (){
  currentUser = firebase.auth().currentUser.email;
}
//event listeners
$(document).ready(function() {

  //add truck to favorites event listener
  $(document).on("click", ".sendFavorite", function(){
    getCurrentUser();
    console.log(currentUser);
    currentIndex = $(this).attr("data-index");
    console.log(currentFoodTrucks[currentIndex].applicant);
    console.log(currentFoodTrucks[currentIndex].optionaltext);
    console.log(currentFoodTrucks[currentIndex].starttime + '-' + currentFoodTrucks[currentIndex].endtime);
    console.log(currentFoodTrucks[currentIndex].location);

    database.ref(currentUser).push({
      name:currentFoodTrucks[currentIndex].applicant,
      cuisines: currentFoodTrucks[currentIndex].optionaltext,
      startTime: currentFoodTrucks[currentIndex].starttime,
      endTime: currentFoodTrucks[currentIndex].endtime,
      location: currentFoodTrucks[currentIndex].location,
    });
  });

  //food search event listener
  $(document).on("click", "#food-search", callFood);

  //firebase google sign in button 
  $(document).on("click", "#gLogin", function(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      console.log(result);
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    });
  });
});
