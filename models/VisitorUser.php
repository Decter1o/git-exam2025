<?php
    class VisitorUser{
        
        private $id;
        private $name;
        private $surname;
        private $phone_number;

        public function __construct($id, $name, $surname, $phone_number){
            $this->id = $id;
            $this->name = $name;
            $this->surname = $surname;
            $this->phone_number = $phone_number;
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
    }