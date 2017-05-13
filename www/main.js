$(document).ready( function() {

    var container = $('#mustache-html');

    function getEventHTML(options, callback) {
        var url = 'events.php?';
        if ('id' in options) {
            url += 'id=' + options['id'];
        }
        if ('startdate' in options && 'enddate' in options) {
            url += 'startdate=' + options['startdate'].toISOString() + '&enddate=' + options['enddate'].toISOString();
        }

        $.get( url, function( data ) {
            var groupedByDate = [];
            var mustacheData = { dates: [] };
            $.each(data.events, function( index, value ) {

                var date = container.formatDate(value.date);
                if (groupedByDate[date] === undefined) {
                    groupedByDate[date] = {
                        yyyymmdd: value.date,
                        date: date,
                        events: []
                    };
                    mustacheData.dates.push(groupedByDate[date]);
                }
                var timeParts = value.time.split(':');
                var hour = parseInt(timeParts[0]);
                var meridian = 'AM';
                if ( hour === 0 ) {
                    hour = 12;
                } else if ( hour >= 12 ) {
                    meridian = 'PM';
                    if ( hour > 12 ) {
                        hour = hour - 12;
                    }
                }
                value.displayTime = hour + ':' + timeParts[1] + ' ' + meridian;
                value.mapLink = container.getMapLink(value.address);
                if ('id' in options) {
                    value.expanded = true;
                }
                value.exportlink = 'ics.php?id=' + value.id
                // value.showEditButton = true; // TODO: permissions
                groupedByDate[date].events.push(value);
            });

            for ( var date in groupedByDate )  {
                groupedByDate[date].events.sort(container.compareTimes);
            }
            var template = $('#view-events-template').html();
            var info = Mustache.render(template, mustacheData);
            callback(info);
        });
    }

    function deleteEvent(id, secret) {
        var data = new FormData();
        data.append('json', JSON.stringify({
            id: id,
            secret: secret
        }));
        var opts = {
            type: 'POST',
            url: 'delete_event.php',
            contentType: false,
            processData: false,
            cache: false,
            data: data,
            success: function(returnVal) {
                var msg = 'Your event has been deleted';
                $('#success-message').text(msg);
                $('#success-modal').modal('show');
            },
            error: function(returnVal) {
                var err = returnVal.responseJSON
                    ? returnVal.responseJSON.error
                    : { message: 'Server error deleting event!' };
                $('#save-result').addClass('text-danger').text(err.message);
            }
        };
        $.ajax(opts);
    }

    function viewEvents(){
        var startDate = new Date();
        var endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 9);

        container.empty()
             .append($('#scrollToTop').html())
             .append($('#legend-template').html());

        getEventHTML({
            startdate: startDate,
            enddate: endDate
        }, function (eventHTML) {
             container.append(eventHTML);
             container.append($('#load-more-template').html());
             checkAnchors();
             $(document).off('click', '#load-more')
                  .on('click', '#load-more', function(e) {
                      startDate.setDate(startDate.getDate() + 10);
                      endDate.setDate(startDate.getDate() + 9);
                      getEventHTML({
                          startdate: startDate,
                          enddate: endDate
                      }, function(eventHTML) {
                          $('#load-more').before(eventHTML);
                          checkAnchors();
                      });
                      return false;
                 });
        });
    }

    function viewEvent(id) {
        container.empty()
            .append($('#show-all-template').html())
            .append($('#scrollToTop').html())
            .append($('#legend-template').html());

        getEventHTML({id:id}, function (eventHTML) {
            container.append(eventHTML);
            checkAnchors();
        });
    }

    function viewAbout() {
        var content = $('#aboutUs').html();
        container.empty().append(content);
        checkAnchors();
    }

    function viewPedalpalooza() {
        var startDate = new Date("June 1, 2017");
        var endDate = new Date("June 30, 2017 23:59:59");
        var pedalpalooza = '/cal/images/pp2017.jpg';
        container.empty()
             .append($('#pedalpalooza-header').html())
             .append($('#scrollToTop').html())
             .append($('#legend-template').html());
        getEventHTML({
            startdate: startDate,
            enddate: endDate
        }, function (eventHTML) {
             container.append(eventHTML);
             checkAnchors();
        });
    }

    function dateJump(ev) {
        var e = ev.target;
        if (e.hasAttribute('data-date')) {
            var $e = $(e);
            var yyyymmdd = $e.attr('data-date');
            var $jumpTo = $("div[data-date='" + yyyymmdd + "']");
            if($jumpTo.children().length >= 0) {

                $('html, body').animate({
                    scrollTop: $jumpTo.offset().top
                }, 500);
            }
        }
    }

    function viewAddEventForm(id, secret) {
        container.getAddEventForm( id, secret, function(eventHTML) {
            container.empty().append(eventHTML);
            checkAnchors();
            if (id) {
                $(document).off('click', '#confirm-delete')
                    .on('click', '#confirm-delete', function() {
                        deleteEvent(id, secret);
                    });
            }
        });
    }

    $(document).on('click', '#confirm-cancel, #success-ok', function() {
        visitRoute('viewEvents');
    });

    $(document).on('click', '#date-picker-pedalpalooza', function(ev) {
        dateJump(ev);
    });

    $(document).on('touchstart', '#date-picker-pedalpalooza', function(ev) {
        dateJump(ev);
    });

    $(document).on('click','.navbar-collapse.collapse.in',function(e) {
        if( $(e.target).is('a') ) {
            $(this).collapse('hide');
        }
    });

    $(document).on('click', 'a.expandDetails', function(e) {
        e.preventDefault();
        return false;
    });

    $(document).on('click', 'button.edit', function(e) {
        var id = $(e.target).closest('div.event').data('event-id');
        viewAddEventForm(id);
    });

    $(document).on('click', '#preview-edit-button', function() {
        $('#event-entry').show();
        $('.date').remove();
        $('#preview-button').show();
        $('#preview-edit-button').hide();
    });


    //scroll to top functionality
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.scrollToTop').fadeIn();
        } else {
            $('.scrollToTop').fadeOut();
        }
    });

    $('scrollToTop').click(function(){
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });

    var routes = [];
    function addRoute(test, action) {
        routes.push({ test: test, action: action });
    }
    function checkRoute(frag) {
        for (var i=0; i<routes.length; i++) {
            var route = routes[i];
            if (route.test.test(frag) && route.action(frag) !== false) {
                return true;
            }
        }
    }
    function testRoute(frag) {
        for (var i=0; i<routes.length; i++) {
            if (routes[i].test.test(frag)) {
                return true;
            }
        }
    }
    function visitRoute(frag) {
        if (checkRoute(frag)) {
            history.pushState({}, frag, frag);
        }
    }

    var checkTimeout = null;
    function checkAnchors() {
        if (checkTimeout != null) {
            clearTimeout(checkTimeout);
        }
        checkTimeout = setTimeout(checkAnchorsDebounced, 500);
    }
    function checkAnchorsDebounced() {
        var aList = document.querySelectorAll('a');
        for (var i=0; i<aList.length; i++) {
            var a = aList[i];
            if (a.hasAttribute('route')) {
                continue;
            }
            var frag = a.getAttribute('href');
            if (frag.indexOf('//') !== -1) {
                // don't mess with external links.
                return;
            }
            if (testRoute(frag)) {
                a.setAttribute('route', 'true');
                a.addEventListener('click', function(ev) {
                    ev.preventDefault();
                    visitRoute(ev.currentTarget.getAttribute('href'));
                    return false;
                });
            }
        }
    }
    window.onpopstate = function (ev) {
        checkRoute(document.location.pathname);
    };

    addRoute(/pedalpalooza$/, viewPedalpalooza);
    addRoute(/addEvent$/, viewAddEventForm);
    addRoute(/editEvent-[0-9]+-[0-9a-f]+$/, function(frag) {
        var rx = /editEvent-([0-9]+)-([0-9a-f]+)$/g;
        var arr = rx.exec(frag);
        viewAddEventForm(arr[1], arr[2]);
    });
    addRoute(/viewEvents$/, viewEvents);
    addRoute(/aboutUs$/, viewAbout);
    addRoute(/event-([0-9]*)$/, function (frag) {
        var rx = /event-([0-9]*)$/g;
        var arr = rx.exec(frag);
        viewEvent(arr[1]);
    });
    addRoute(/\/$/, viewEvents);
    // Support old edit links
    // TODO: remove this after people stop using them.
    var hash = document.location.hash;
    if (hash.indexOf('#editEvent') === 0) {
        var locationHashParts = hash.split('/');
        viewAddEventForm(locationHashParts[1], locationHashParts[2]);
    } else {
        checkRoute( document.location.pathname );
    }
    checkAnchors();
});
