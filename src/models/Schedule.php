<?php
    class Schedule{

        public $id;
        public $dayOfWeek;
        public $startTime;
        public $endTime;
        public $trainingTypeId;
        public $roomname;
        public $trainerName;
        public $category;

        public function __construct($id, $dayOfWeek, $startTime, $endTime, $trainingTypeId, $roomname, $trainerName, $category){
            $this->id = $id;
            $this->dayOfWeek = $dayOfWeek;
            $this->startTime = $startTime;
            $this->endTime = $endTime;
            $this->trainingTypeId = $trainingTypeId;
            $this->roomname = $roomname;
            $this->trainerName = $trainerName;
            $this->category = $category;
        }

        public function getId(){
            return $this->id;
        }

        public function getDayOfWeek(){
            return $this->dayOfWeek;
        }

        public function getStartTime(){
            return $this->startTime;
        }

        public function getEndTime(){
            return $this->endTime;
        }

        public function getTrainingTypeId(){
            return $this->trainingTypeId;
        }

        public function getRoomname(){
            return $this->roomname;
        }

        public function getTrainerName(){
            return $this->trainerName;
        }

        public function getCategory(){
            return $this->category;
        }
    }