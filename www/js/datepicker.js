(function($) {

    // Global state variables, initialized in setupDatePicker
    var $dateSelect,
        $dateSelected,
        $loadLater,
        $loadEarlier,
        $datePicker,
        monthTemplate,
        earliestMonth,
        latestMonth,
        dateMap,
        today,
        selectedCount = 0;

    // Some constants used for generating html. The JOY of javascript stdlib
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var cellClases = ["color-jan", "color-feb", "color-mar", "color-apr", "color-may", "color-jun",
        "color-jul", "color-aug", "color-sep", "color-oct", "color-nov", "color-dec"];

    // dateList returns the currently selected list of (normalized) dates for consumption by manage_event.php
//     $.fn.dateList = function() {
//         var dates = [];
//         for (var key in dateMap) {
//             if (dateMap.hasOwnProperty(key) && dateMap[key]) {
//                 dates.push(key);
//             }
//         }
//         dates.sort($('#date-select').compareDates);
//         return dates;
//     };

    $.fn.eventsList = function() {
        var selectedDates = $("#date-selected li").toArray();
        var dateStatuses = selectedDates.map( function(date) {
          var datestatus = {};
          datestatus['id'] = date.getAttribute('data-id');
          datestatus['date'] = date.querySelector('span').innerHTML;
          datestatus['status'] = date.querySelector('select').value;
          datestatus['newsflash'] = date.querySelector('.newsflash').value;
          return datestatus;
        });
        return dateStatuses;
    };


    // setupDatePicker sets up the global variables and populates the date picker element
    $.fn.setupDatePicker = function(dateStatuses) {
        // Fill in global variables
        // Set up dateMap
        dateMap = {};
        for (var i=0; i<dateStatuses.length; i++) {
            dateMap[normalizeDate(dateStatuses[i]['date'])] = true;
            selectedCount++;
        }

        // Scrolling container for the table
        $dateSelect = $('#date-select');
        $dateSelected = $('#date-selected');
        // Placeholder divs that trigger loading when visible
        $loadLater = $('#load-later');
        $loadEarlier = $('#load-earlier');
        // Table that contains months
        $datePicker = $("#date-picker");

        monthTemplate = $('#mustache-select-month').html();

        // Tracks when today is for styling purposes
        today = new Date();
        // These track which month to add to the start/end
        earliestMonth = today;
        latestMonth = today;

        // Fill in the first month
        $datePicker.html(getMonthHTML(earliestMonth));
        // Scroll the table to the top of the first month
        $dateSelect.scrollTop(loadEarlierBottom());

        // Add a click handler for individual days
        $datePicker.click(function(ev) {
            var e = ev.target;
            if (e.hasAttribute('data-date')) {
                var $e = $(e),
                    date = $e.attr('data-date');

                dateMap[date] = !dateMap[date];
                if (dateMap[date]) {
                    selectedCount++;
                    dateStatuses.push({
                        "id": null,
                        "date": date,
                        "status": 'A',
                        "newsflash": null
                    });
                    $('#save-button').prop('disabled', false);
                    $('#preview-button').prop('disabled', false);
                } else {
                    selectedCount--;
                    var match = dateStatuses.findIndex(function(deselectedDate) {
                      return deselectedDate['date'] == date;
                    });
                    dateStatuses.splice(match, 1);
                    if ( selectedCount === 0 ) {
                        $('#save-button').prop('disabled', true);
                        $('#preview-button').prop('disabled', true);
                    }
                }
                $e.toggleClass('selected', dateMap[date]);
                // TODO: make it so changing data selection on an existing event
                // doesn't replace the list
                $dateSelected.html("");
                //selectedDatesListHTML($dateSelected, $datePicker.dateList());
                savedDatesListHTML($dateSelected, dateStatuses);

                return false;
            }
            return true;
        });

        // Setup the month table scroll checks
        $dateSelect.scroll(checkBounds);
        savedDatesListHTML($dateSelected, dateStatuses);
        checkBounds();
    };

    function selectedDatesListHTML(list, dates) {
        $.each(dates, function( index ) {
          list.append("<li>" + dates[index] + "</li>");
        });
        return list;
    }

    function savedDatesListHTML(list, dateStatuses) {
        $.each(dateStatuses, function( index ) {
          if ( dateStatuses[index]['id'] ) {
            list.append("<li data-id='" + dateStatuses[index]['id'] + "'><span>" + dateStatuses[index]['date'] + "</span></li>" );
          } else {
            list.append("<li data-id=''><span>" + dateStatuses[index]['date'] + "</span></li>" );
          }

          $( "li:last" ).append("<select></select>");
          if ( dateStatuses[index]['status'] == 'C' ) {
            $( "li:last select" ).append("<option value='A'>Scheduled</option><option value='C' selected='selected'>Cancelled</option></select>");
          } else {
            $( "li:last select" ).append("<option value='A' selected='selected'>Scheduled</option><option value='C'>Cancelled</option></select>");
          }

          if ( dateStatuses[index]['newsflash'] ) {
            $( "li:last" ).append("<input type='text' class='newsflash' value='" + dateStatuses[index]['newsflash'] + "'>");
          } else {
            $( "li:last" ).append("<input type='text' class='newsflash'>");
          }
        });
        return list;
    }

    function isToday(date) {
        return (date.getDate() === today.getDate()
            && date.getMonth() === today.getMonth()
            && date.getFullYear() === today.getFullYear())
    }

    function normalizeDate(date) {
        var jsd = new Date(date);
        jsd.setTime(jsd.getTime() + jsd.getTimezoneOffset()*60*1000);

        return moment(jsd).format("YYYY-MM-DD");
    }

    function isSelected(date) {
        return !!dateMap[normalizeDate(date)];
    }

    function makeWeekData(date) {
        // date is the first day in the week
        // [{ day - string to display
        //    classes - classes to display },...]
        var week = [];
        for (var i=0;i<7;i++) {
            var day = {};
            day['day'] = date.getDate();
            day['date'] = normalizeDate(date);
            day['classes'] = (isToday(date) ? "today" : "") + " " + (isSelected(date) ? "selected" : "") + " " + cellClases[date.getMonth()] + (date.getDay() % 2 === 0 ? "-odd" : "");
            week.push(day);

            date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        return week;
    }

    function makeMonthData(date) {
        // date is a day in a month to add

        // weeks:
        //   monthTitle - left title, only in first week
        //   weeksInMonth - rows that the title spans
        //   days:
        //     day: title
        //     date: yyyy-m-d (normalized)
        //     selected: cell class if selected

        // Normalize date, ensuring first of month
        var firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        // Find the first day of the week for the week the 1st falls on
        var firstDay = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), -firstOfMonth.getDay()+1);

        var firstOfNextMonth = new Date(date.getFullYear(), date.getMonth()+1, 1);
        // Don't include the week next months 1st lands on
        var stopDay = new Date(firstOfNextMonth.getFullYear(), firstOfNextMonth.getMonth(), -firstOfNextMonth.getDay()+1);

        var weeks = [];
        for (var startOfWeek=firstDay;startOfWeek<stopDay;) {
            var week = {};
            week['days'] = makeWeekData(startOfWeek);
            weeks.push(week);

            startOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 7);
        }
        weeks[0]['monthTitle'] = monthNames[firstOfMonth.getMonth()] + " " + firstOfMonth.getFullYear();
        weeks[0]['weeksInMonth'] = weeks.length;

        return {"weeks": weeks};
    }
    function getMonthHTML(date) {
        return Mustache.render(monthTemplate, makeMonthData(date));
    }

    function loadLaterTop() {
        return $loadLater.offset().top - $dateSelect.offset().top;
    }

    function loadEarlierBottom() {
        return ($loadEarlier.offset().top + $loadEarlier.prop('scrollHeight')) - $dateSelect.offset().top;
    }

    var checking = false;
    function checkBounds() {
        if (checking) {
            return;
        }
        var added = false;
        if (loadEarlierBottom() >= 0) {
            latestMonth = new Date(latestMonth.getFullYear(), latestMonth.getMonth()-1, 1);
            var preHeight = $datePicker.height();
            $datePicker.prepend(getMonthHTML(latestMonth));
            var heightChange = $datePicker.height() - preHeight;
            $dateSelect.scrollTop($dateSelect.scrollTop() + heightChange);
            added = true;
        }
        if (loadLaterTop() <= $dateSelect.height()) {
            earliestMonth = new Date(earliestMonth.getFullYear(), earliestMonth.getMonth()+1, 1);
            $datePicker.append(getMonthHTML(earliestMonth));
            added = true;
        }
        if (added) {
            checking = true;
            setTimeout(function() {
                checking = false;
                checkBounds();
            }, 10);
        }
    }

}(jQuery));

