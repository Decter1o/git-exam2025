<?php
    class VisitorMembership{

        public $id;
        public $visitorId;
        public $membershipId;
        public $startDate;
        public $endDate;

        public function __construct($id, $visitorId, $membershipId, $startDate, $endDate){
            $this->id = $id;
            $this->visitorId = $visitorId;
            $this->membershipId = $membershipId;
            $this->startDate = $startDate;
            $this->endDate = $endDate;
        }

        public function getId(){
            return $this->id;
        }

        public function getVisitorId(){
            return $this->visitorId;
        }

        public function getMembershipId(){
            return $this->membershipId;
        }

        public function getStartDate(){
            return $this->startDate;
        }

        public function getEndDate(){
            return $this->endDate;
        }
    }