<?php
    class AdminUser{
        
        public $id;
        public $name;
        public $password;
        public $email;

        public function __construct($id, $username, $password, $email){
            $this->id = $id;
            $this->login = $login;
            $this->password = $password;
            $this->email = $email;
        }

        public function getId(){
            return $this->id;
        }

        public function getUsername(){
            return $this->user_error;
        }

        public function getPassword(){
            return $this->password;
        }

        public function getEmail(){
            return $this->email;
        }
    }