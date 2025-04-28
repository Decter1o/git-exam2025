<?php
include_once(__DIR__ . '/../models/DB.php');
class AdminUser extends DB {
    
    public $id;
    public $login;
    public $password;

    public function init($id, $login, $password) {
        $this->id = $id;
        $this->login = $login;
        $this->password = $password;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }

    function Auth($login, $password) {
        // Вызов метода родителя для получения соединения с базой данных
        $pdo = $this->connect();
        
        if ($pdo) {
            try {
                // Исправление: в запросе было написано 'loigin', а должно быть 'login'
                $query_string = "SELECT COUNT(*) FROM admin_users WHERE login = :login AND password = :password";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['login' => $login, 'password' => $password]);
                
                return $sql_query->fetchColumn(); // Возвращаем количество найденных записей
            } catch (PDOException $e) {
                echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
    }
}

