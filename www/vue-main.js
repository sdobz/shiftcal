// VUE-Helpers
function getMapLink(address) {
  return 'http://maps.google.com/' +
    '?bounds=45.389771,-122.829208|45.659647,-122.404175&q=' +
    encodeURIComponent(address);
}

function formatDate(dateString) {
  var parts = dateString.split('-'),
    date = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);

  return date.toLocaleDateString(
    navigator.language,
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }
  );
}

function compareTimes(event1, event2) {
  if (event1.time < event2.time) {
    return -1;
  }
  if (event1.time > event2.time) {
    return 1;
  }
  return 0;
}

function compareDates(date1, date2) {
  if (date1 < date2) {
    return -1;
  }
  if (date1 > date2) {
    return 1;
  }
  return 0;
}


// VUE - API
function getEvents(options, callback) {
  var url = 'events.php?';
  if ('id' in options) {
    url += 'id=' + options['id'];
  }
  if ('startdate' in options && 'enddate' in options) {
    url += 'startdate=' + options['startdate'].toISOString() + '&enddate=' + options['enddate'].toISOString();
  }

  $.get(url, function (data) {
    var groupedByDate = [];
    var result = {dates: []};
    $.each(data.events, function (index, value) {

      var date = formatDate(value.date);
      if (groupedByDate[date] === undefined) {
        groupedByDate[date] = {
          yyyymmdd: value.date,
          date: date,
          events: []
        };
        result.dates.push(groupedByDate[date]);
      }
      var timeParts = value.time.split(':');
      var hour = parseInt(timeParts[0]);
      var meridian = 'AM';
      if (hour === 0) {
        hour = 12;
      } else if (hour >= 12) {
        meridian = 'PM';
        if (hour > 12) {
          hour = hour - 12;
        }
      }
      value.displayTime = hour + ':' + timeParts[1] + ' ' + meridian;
      value.mapLink = getMapLink(value.address);
      if ('id' in options) {
        value.expanded = true;
      }
      value.exportlink = 'ics.php?id=' + value.id;
      // value.showEditButton = true; // TODO: permissions
      groupedByDate[date].events.push(value);
    });

    for (var date in groupedByDate) {
      groupedByDate[date].events.sort(compareTimes);
    }
    callback(result);
  });
}

// VUE-Components

// viewEvents
var expandingEvent = Vue.component('event', {
  data: function() {
    return {
      open: false
    }
  },
  methods: {
    toggle: function(e) {
      this.open = !this.open;
      e.preventDefault();
      return false;
    }
  },
  props: ['event']
});

// VUE-State
var app = new Vue({
  el: '#vue-main',
  data: function () {
    var data = {
      route: 'events',
      dates: []
    };

    var startDate = new Date();
    var endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 9);

    getEvents({
      startdate: startDate,
      enddate: endDate
    }, function (res) {
      data.dates = res.dates;
    });

    return data;
  },
  components: {
    event: expandingEvent
  }
});

