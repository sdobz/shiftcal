<?php
include(getcwd() . '/../app/init.php');

/**
 * This endpoint returns a list of events between the GET parameters startdate and enddate of the form:
 *  JSON:
 *  {
 *      events: [
 *          {
 *
 *          },
 *          ...
 *      ]
 *  }
 *
 * If there is a problem the error code will be 400 with a json response of the form:
 *  {
 *      "error": {
 *          "message": "Error message"
 *      }
 *  }
 */

if (isset($_GET['startdate']) && ($parseddate = strtotime($_GET['startdate']))) {
    $startdate = $parseddate;
} else {
    $startdate = time();
}

if (isset($_GET['enddate']) && ($parseddate = strtotime($_GET['enddate']))) {
    $enddate = $parseddate;
} else {
    $enddate = time();
}

$json = array('events' => array());

if (isset($_GET['id'])) {
    $events = EventTime::getByID($_GET['id']);
}
else {
    $events = EventTime::getRangeVisible($startdate, $enddate);
}
foreach ($events as $eventTime) {
    try{
        $json['events'] []= $eventTime->toEventSummaryArray();
    } catch( Exception $ex ) {
        // For now, ignore
    }

}
fJSON::output($json);
