<?php
class DB
{
    private $pdo;

    function DBConnect(){
        
        $config = require(DIR . '/../../config/config.php');
        $connection_string = "pgsql:host=" . $config['db']['host'] . ";dbname=" . $config['db']['dbname'];

        try {
            $this->pdo = new PDO($connection_string, $config['db']['user'], $config['db']['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return $this->pdo;
        } catch (PDOException $e) {
            error_log("Ошибка подключения: " . $e->getMessage(), 3, DIR . '/../../logs/log.txt');
            echo json_encode(["error" => "Ошибка подключения: " . $e->getMessage()]);
            return null;
        }
    }
}