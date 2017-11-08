//----------------------------------------
//locations array data
var locations = [{
  name: "Jijamata Udyaan",
  lat: 18.977927,
  lng: 72.837768,
  addr: "Dr Ambedkar Road, Byculla East, Mumbai",
  pageid: 373438
}, {
  name: "Nehru Science Centre",
  lat: 18.990370,
  lng: 72.817945,
  addr: " Dr. E. Moses Road, Worli, Mumbai",
  pageid: 11550516
}, {
  name: "Chhatrapati Shivaji Terminus railway station",
  lat: 18.939821,
  lng: 72.835468,
  addr: "Chhatrapati Shivaji Terminus Area, Fort, Mumbai",
  pageid: 287628
}, {
  name: "Gateway of India",
  lat: 18.921984,
  lng: 72.834654,
  addr: "Apollo Bandar, Colaba, Mumbai",
  pageid: 494788
}, {
  name: "Hanging Gardens of Mumbai",
  lat: 18.956866,
  lng: 72.804963,
  addr: "Ridge Road , Malabar Hill, Mumbai",
  pageid: 372994
}];

var map;

//define viewmodel of the application
var viewModel = function() {
  var self = this;
  var marker;
  //defining infowindow to show description of the place obtained from wikipedia
  var infowindow = new google.maps.InfoWindow();
  //console.log(this);
  this.searchOption = ko.observable("");
  this.markers = [];
  // this function is called when user clicks either on marker or list
  // sends an ajax req to mediawiki 
  this.getContent = function(title, id) {
    //var wikiUrl ='https://en.wikipedia.org/w/api.php?action=opensearch&search='+title+'&limit=1&format=json&callback=wikiCallback';
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&titles=' + title + '&exsentences=5&format=json&callback=wikiCallback';
    var contentstr;
    $.ajax({
      url: wikiUrl,
      // datatype is jsonp as cross site scripts are blocked
      dataType: "jsonp",
      success: function(response) {
        //storing the extract obtained from response data
        contentstr = response.query.pages[id].extract;
        //console.log(response.query);
        //console.log(title + " " + id);
        // console.log(response.query.pages[id].extract);
        infowindow.setContent(contentstr);
        //console.log(contentstr);
      }
    }).fail(function() {
      // fail function to handle error if something went wrong 
      infowindow.setContent("something went wrong!!!!");
    });
  };
  this.loadmap = function(lat, lng, zoom) {
    // creating maps
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {
        lat: 18.961334,
        lng: 72.822144
      }
    });
    //responsive maps
    google.maps.event.addDomListener(window, 'resize', function() {
      map.setCenter({
        lat: 18.961334,
        lng: 72.822144
      });
    });
    for (var i = 0; i < locations.length; i++) {
      //console.log( locations[i].lat +" "+ locations[i].lng)
      // adding markers
      marker = new google.maps.Marker({
        map: map,
        position: {
          lat: locations[i].lat,
          lng: locations[i].lng
        },
        animation: google.maps.Animation.DROP,
        title: locations[i].name,
        addr: locations[i].addr,
        lat: locations[i].lat,
        lng: locations[i].lng,
        id: locations[i].pageid
      });
      this.markers.push(marker);
      // click event to show infowindow
      marker.addListener('click', markerset);
    }
  };
  function markerset() {
        // console.log(this.content);
        var that=this;
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
          that.setAnimation(null);  
        }, 750);
        infowindow.setContent(self.getContent(this.title, this.id));
        lati = parseFloat(this.lat) + parseFloat(0.005000);
        lati.toFixed(6);
        infowindow.setPosition({
          lat: lati,
          lng: this.lng
        });
        infowindow.open(map, this.marker);
      }
  //   infowindow = new google.maps.InfoWindow();
  // called on click of list
  self.focus = function(a) {
    console.log(a.id);
    infowindow.setContent(self.getContent(a.title, a.id));
    lati = parseFloat(a.lat) + parseFloat(0.005000);
    lati.toFixed(6);
    infowindow.setPosition({
      lat: lati,
      lng: a.lng
    });
    infowindow.open(map);
  };
  // loads map
  this.loadmap(18.971334, 72.822144, 13);
  // filters the location based on title or address
  this.locationsFilter = ko.computed(function() {
    //console.log("yes");
    var filteredLocations = [];
    for (var i = 0; i < this.markers.length; i++) {
      var markerLocation = this.markers[i];
      if (markerLocation.title.toLowerCase().includes(this.searchOption().toLowerCase()) || markerLocation.addr.toLowerCase().includes(this.searchOption().toLowerCase())) {
        filteredLocations.push(markerLocation);
        this.markers[i].setVisible(true);
      } else {
        this.markers[i].setVisible(false);
      }
    }
    return filteredLocations;
  }, this);
};

function initMap() {
  ko.applyBindings(new viewModel());
}

function toggleSidebar() {
  $(".sidebar").toggle();
}