<?php

class EventTime extends fActiveRecord {

    public static function matchEventTimesToDates($event, $phpDates) {
        $dates = array();
        foreach ($phpDates as $dateVal) {
            $dates []= $dateVal->format('Y-m-d');
        }

        foreach ($event->buildEventTimes('id') as $eventTime) {
            // For all existing dates
            $formattedDate = $eventTime->getFormattedDate();
            if (!in_array($formattedDate, $dates)) {
                // If they didn't submit this existing date delete it
                $eventTime->delete();
            }
            else {
                if (($key = array_search($formattedDate, $dates)) !== false) {
                    unset($dates[$key]);
                }
            }
        }
        foreach ($dates as $newDate) {
            $eventTime = new EventTime();
            $eventTime->setModified(time());
            $eventTime->setId($event->getId());
            $eventTime->setEventdate($newDate);
            $eventTime->setEventstatus('A');
            $eventTime->store();
        }
        // Flourish is suck. I can't figure out the "right" way to do one-to-many cause docs are crap
        // This clears a cache that causes subsequent operations (buildEventTimes) to return stale data
        $event->related_records = array();
    }

    public static function getByID($id) {
        return fRecordSet::build(
            'EventTime', // class
            array(
                'pkid=' => $id
            )
        );
    }

    public static function getRangeVisible($firstDay, $lastDay) {
        return fRecordSet::build(
            'EventTime', // class
            array(
                'eventdate>=' => $firstDay,
                'eventdate<=' => $lastDay,
                'calevent{id}.hidden!' => 1,
                'eventstatus!' => 'S',
                'calevent{id}.review!' => 'E' // 'E'xcluded
            ), // where
            array('eventdate' => 'asc')  // order by
        );
    }

    private function getEvent() {
        try {
            if ($this->getEventstatus() === 'E') {
                return $this->createEvent('exceptionid');
            }
            return $this->createEvent('id');
        }
        catch (fNotFoundException $e) {
            return new Event();
        }
    }

    public function getFormattedDate() {
        return $this->getEventdate()->format('Y-m-d');
    }

    protected function getShareable() {
        global $PROTOCOL, $HOST, $PATH;
        $base = trim($PROTOCOL . $HOST . $PATH, '/');

        $caldaily_id = $this->getPkid();
        return "$base/event-" . $caldaily_id;
    }

    private function getFeatured() {
        $id = $this->getId();
        $year = $this->getEventdate()->format('Y');

        if ($year == null) {
            return null;
        }

        // Ideally this would be stored in the db.
        // But AFAIK these featured events were just hand-marked on the classic cal.
        // So here's a hard-coded list of featured events pulled from that cal.
        $featured = [
            // I don't see any featured events for 2009 or earlier
            '2010' =>
                [ 1603, 1604, 1321, 1545, 1574 ], // BonB x2, WNBR, Sunday Parkways, MCBF
            '2011' =>
                [ 2142, 2109, 2110, 2191 ], // Kickoff, WNBR, MCBF, SP
            '2012' =>
                [ 2774, 3145, 2787, 2788, 2789, 2807, 2776 ], // Kickoff ride, Kickoff party, BonB x4
            '2013' =>
                [ 3664, 3807, 3840, 3465, 3700, 3596 ], // // Kickoff ride, Kickoff party, WNBR event at PAM, WNBR, SP, MCBF
            '2014' =>
                [ 4294, 4477, 4478, 4479, 4480, 4129, 4150 ], // Kickoff, BonB x4, WNBR, MCBF
            '2015' =>
                [ 4544, 4982, 4983, 4984, 4552, 5098, 4769 ], // Kickoff, BonB x3, MCBF, MCBF to WNBR, WNBR
            '2016' =>
                [ 5467, 5469, 5463, 5464 ], // Kickoff, MMR, WNBR, SP
            '2017' =>
                [ 6216, 6233 ], // Kickoff, SP
            '2018' =>
                [ 6798, 6804, 6799 ], // Kickoff, WNBR, SP
        ];

        if ( in_array($id, $featured[$year]) ) {
            return true;
        } else {
            return null;
        }
    }

    public function toEventSummaryArray() {
        $eventArray = $this->getEvent()->toArray();
        $eventArray['date'] = $this->getFormattedDate();
        $eventArray['caldaily_id'] = $this->getPkid();
        $eventArray['shareable'] = $this->getShareable();
        $eventArray['cancelled'] = $this->getEventstatus() == 'C';
        $eventArray['newsflash'] = $this->getNewsflash();
        $eventArray['featured'] = $this->getFeatured();
	return $eventArray;
    }
}

fORM::mapClassToTable('EventTime', 'caldaily');
