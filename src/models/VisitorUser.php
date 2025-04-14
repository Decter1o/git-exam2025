<?php
    class VisitorUser{
        
        public $id;
        public $name;
        public $surname;
        public $phone_number;
        public $status;

        public function __construct($id, $name, $surname, $phone_number, $status){
            $this->id = $id;
            $this->name = $name;
            $this->surname = $surname;
            $this->phone_number = $phone_number;
            $this->status = $status;
        }

        public function getId(){
            return $this->id;
        }

        public function getName(){
            return $this->name;
        }

        public function getSurname(){
            return $this->surname;
        }

        public function getPhoneNumber(){
            return $this->phone_number;
        }
        
        public function getStatus(){
            return $this->status;
        }
    }