<?php
    class TrainingType{
        
        public $id;
        public $name;
        public $description;

        public function __construct($id, $name, $description){
            $this->id = $id;
            $this->name = $name;
            $this->description = $description;
        }

        public function getId(){
            return $this->id;
        }

        public function getName(){
            return $this->name;
        }

        public function getDescription(){
            return $this->description;
        }
    }