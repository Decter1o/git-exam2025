<?php
    class AdminUser{
        
        private $id;
        private $name;
        private $password;
        private $email;

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