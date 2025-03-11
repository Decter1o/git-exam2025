<?php
    class GymMembership{

        private $id;
        private $type;
        private $duration;
        private $price;
        private $specialGroup;

        public function __construct($id, $type, $duration, $price, $specialGroup){
            $this->id = $id;
            $this->type = $type;
            $this->duration = $duration;
            $this->price = $price;
            $this->specialGroup = $specialGroup;
        }

        public function getId(){
            return $this->id;
        }

        public function getType(){
            return $this->type;
        }

        public function getDuration(){
            return $this->duration;
        }

        public function getPrice(){
            return $this->price;
        }

        public function getSpecialGroup(){
            return $this->specialGroup;
        }

        public function setId($id){
            $this->id = $id;
        }

        public function setType($type){
            $this->type = $type;
        }
    }