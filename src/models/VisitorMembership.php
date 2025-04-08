<?php
    class VisitorMembership{

        public $id;
        public $visitorId;
        public $membershipId;
        public $visitsLeft;
        

        public function __construct($id, $visitorId, $membershipId, $visitsLeft){
            $this->id = $id;
            $this->visitorId = $visitorId;
            $this->membershipId = $membershipId;
            $this->visitsLeft = $visitsLeft;
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

        public function getVisitsLeft(){
            return $this->$visitsLeft;
        }
    }