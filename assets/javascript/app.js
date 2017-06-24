//stores our response from ajax call
var foodTrucks = [];
//filtered response
var currentFoodTrucks = [];
//stores users favorite trucks to send to firebase
var favoriteTrucks = [];
//google maps variable
var map;
//counter for our our favorite trucks list
var index=0;
//current user id 
var currentUser;
//google maps markers
var markers = [];
//momentjs variables
var hourFormat = "HH:mm:ss";
var currentTime;
var truckStartTime;
var truckEndTime;
var currentIndex;

var newEmail;
var newPassword;
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
//searches for food trucks based on type of food
function callFood() {
    //empty response from previous ajax call
    foodTrucks = [];
    currentFoodTrucks = [];
    //gets input
    var food = $("#food-input").val().trim();
    //api url
    var queryURL = "https://data.sfgov.org/resource/bbb8-hzi6.json?$q=" + food;

    $.ajax({
        url: queryURL,
        method: "GET"

    }).done(function(response) {
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
function getCurrentTrucks() {
    var time = moment();
    currentFoodTrucks = [];
    for (var i = 0; i < foodTrucks.length; i++) {
        truckStartTime = moment(foodTrucks[i].start24, hourFormat);
        truckEndTime = moment(foodTrucks[i].end24, hourFormat);
        if (time.isBetween(truckStartTime, truckEndTime) && time.format('dddd') === foodTrucks[i].dayofweekstr) {
            currentFoodTrucks.push(foodTrucks[i]);
        }
    }
}

//creates a new google map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, 
      lng: 150.644},
    zoom: 13
  });

  infoWindow = new google.maps.InfoWindow;

   // HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      // infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
} //Initmap endtag

//adds currentFoodTrucks to google maps
function addTrucks() {
    $(".data").empty();
    hideMarkers();
    createMarkers();
    addListView();
}

// var iconBase = 'coffee-truck.png'

function createMarkers() {
    // Loop through the results array and place a marker for each set of coordinates.
    for (var i = 0; i < currentFoodTrucks.length; i++) {
        //sets latitude and longitude of each foodTruck to variable latlng
        var latLng = new google.maps.LatLng(currentFoodTrucks[i].latitude, currentFoodTrucks[i].longitude);
        //creates a new marker
        var marker = new google.maps.Marker({
            //sets position as latLng variable
            position: latLng,
            //adds marker to map
            map: map,
            //custom icon
            icon: 'assets/Images/van-orange.png'
        });
        // adds name to makers  
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
function addListView() {
    for (i = 0; i < currentFoodTrucks.length; i++) {
        var tr = $("<tr>");
        var truckName = $("<td>").text(currentFoodTrucks[i].applicant);
        var cuisines = $("<td>").text(currentFoodTrucks[i].optionaltext);
        var hours = $("<td>").text(currentFoodTrucks[i].starttime + '-' + currentFoodTrucks[i].endtime);
        var truckLocation = $("<td>").text(currentFoodTrucks[i].location);
        var addFavorite = $("<button>").text('+').addClass('sendFavorite btn-floating btn-large waves-effect waves-light lightblue').attr("data-index", i);
        tr.append(truckName).append(cuisines).append(hours).append(truckLocation).append(addFavorite);
        $(".data").append(tr);
    }
}

function attachTruckName(marker, array) {
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
function getCurrentUser() {
    if (firebase.auth().currentUser.uid) {
        return firebase.auth().currentUser.uid;
    }
}

$(document).ready(function() {
  // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
  $('.modal-trigger').leanModal();
  //add truck to favorites event listener
  $(document).on("click", ".sendFavorite", function(){
    var currentUser = getCurrentUser();
    currentIndex = $(this).attr("data-index");
    database.ref(currentUser).push({
      name:currentFoodTrucks[currentIndex].applicant,
      cuisines: currentFoodTrucks[currentIndex].optionaltext,
      startTime: currentFoodTrucks[currentIndex].starttime,
      endTime: currentFoodTrucks[currentIndex].endtime,
      location: currentFoodTrucks[currentIndex].location,
      uid: currentUser
    });

  });

  //food search event listener
  $(document).on("click", "#food-search", callFood); //change to food-input

  //firebase google sign in button
  $(document).on("click", "#gLogin", function(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
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

  //show favorites event handler
$(".showFavorites").on("click", renderFavorites);


function renderFavorites(){
    //empties the content of modal so that we don't add duplicates on multiple clicks of button
    $(".modal-content").empty();
    var openToday = 'maybe';
    //stores the keys pushed to firebase for each favorite truck
    var favoriteKeys = [];
    currentUser = getCurrentUser();
    //REMOVING ITEMS FROM DATABASE
    //ITERATING OVER SNAPSHOT RESPONSE AND GETTING EACH UNIQUE KEY ITEM THAT IS ADDED WHEN WE PUSH TO FIREBASE OBJECT
    var query = database.ref(currentUser).orderByKey();
    query.once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
          // key is the unique key stored in firebase when we push onto our object
          var key = childSnapshot.key;
          favoriteKeys.push(key);
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          var removeBox = $("<td>");
          removeBox.addClass('removeItem').html('&times;').attr("data-key", key);
          removeBox.attr('data-index', index);
          index++;
          var tr = $("<tr>");
          tr.addClass('favorites');
          tr.append("<td>" + childData.name + "</td>");
          tr.append("<td>" + childData.cuisines+ "</td>");
          tr.append("<td>" + openToday+ "</td>");
          tr.append("<td>" + childData.location + "</td>");
          tr.append(removeBox);
          $(".modal-content").append(tr);
        });
      });
      modal.show();
}
//MODAL//

var modal = $("#myModal");
var btn = $("#myBtn");
//closes modal when user clicks on button
$(document).on("click", ".close", function() {
    modal.hide();
});

//removes item from users favorites when clicked
$(document).on("click", ".removeItem", function(){
  var favorites = $(".favorites");
  var indexToRemove = ($(this).attr("data-index"));
  if(favorites.length > 1){
    favorites[indexToRemove].remove();
  } else {
    favorites[0].remove();
  }
  var dataKeyToDelete = ($(this).attr("data-key"));
  var pathToDelete = currentUser  + '/' + dataKeyToDelete;
  var itemToDelete = database.ref(pathToDelete ).remove();
});


//login validation

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        $(".loginInfo").text('You are logged in as ' + email);
        // ...
    } else {
        $(".loginInfo").text('You are not logged in ');
        // User is signed out.
        // ...
    }
});

//logout button

$(".logOut").on("click", function(){
  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  }).catch(function(error) {
  // An error happened.
});
});
});

//create new account button

$(".btnCreate").on("click", function(){

  newEmail = $(".newEmail").val().trim();
  newPassword = $(".newPassword").val().trim();
  console.log(newEmail);
  console.log(newPassword);
  firebase.auth().createUserWithEmailAndPassword(newEmail, newPassword).catch(function(error) {
  // Handle Errors here.

  var errorCode = error.code;
  var errorMessage = error.message;
  // ...

  });
  
  // ...
});


$(".btnLogin").on("click", function(){
   newEmail = $(".newEmail").val().trim();
  newPassword = $(".newPassword").val().trim();
  login(newEmail, newPassword);
});


function login(newEmail, newPassword){
 firebase.auth().signInWithEmailAndPassword(newEmail, newPassword).catch(function(error) {
    console.log(error)
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

}
