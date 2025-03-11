<?php

namespace Data;
use \PDO;
use \SMS;

class DB
{
    private $pdo;

    function DBConnect(){
        
        $config = require 'config.php';
        $connection_string = "mysql:host=" . $config['db']['host'] . ";dbname=" . $config['db']['dbname'] . ";charset=" . $config['db']['charset'];

        try {
            $this->pdo = new PDO($connection_string, $user_name, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return $this->pdo;
        } catch (PDOException $e) {
            echo json_encode(["error" => "Ошибка подключения: " . $e->getMessage()]);
            return null;
        }
    }

    function CheckPhoneNumber($phone){
        $pdo = $this->DBConnect();

        if ($pdo) {
            try {
                $query_string = "SELECT COUNT(*) FROM Users WHERE Phone LIKE :phone";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone]);
                return $sql_query->fetchColumn();
            } catch (PDOException $e) {
                echo json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        echo json_encode(["error" => "Не удалось подключиться к базе данных."]);
    }

    function InsertOTP($otp, $phone){
        $pdo = $this->DBConnect();
        if ($pdo) {
            try {
                
                $query_string = "CALL InsertOTP(:phone, :otp, @p_status)";

                $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone, 'otp' => $otp]);

                $status_query = $pdo->prepare("SELECT @p_status");
                $status_query->execute();
                $status = $status_query->fetchColumn();

                echo json_encode(["status" => $status ? "success" : "error", "message" => $status ? "OTP inserted/updated successfully." : "Error inserting/updating OTP."]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["error" => "Не удалось подключиться к базе данных."]);
        }
    }
    
    function VerifyOTP($phone, $otp){
        $pdo = $this->DBConnect();
        if ($pdo) {
            try {
                // Получаем OTP, если не истек срок
                $query_string = "SELECT OTP FROM otp WHERE Phone = :phone AND expires_at > NOW()";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone]);

                $otp_data = $sql_query->fetch(PDO::FETCH_ASSOC);

                // Если OTP не найден или просрочен
                if (!$otp_data) {
                    echo json_encode(["success" => false, "message" => "OTP is invalid or expired"]);
                }
                else {
                    // Проверяем правильность OTP
                    if ($otp_data["OTP"] == $otp) {
                        // Получаем имя пользователя
                        $verify_query_string = "SELECT UserName, UserSecondName FROM Users WHERE Phone = :phone";
                        $verify_query = $pdo->prepare($verify_query_string);
                        $verify_query->execute(['phone' => $phone]);
        
                        $verify_data = $verify_query->fetch(PDO::FETCH_ASSOC);
                        
                        echo json_encode(["success" => true, "user" => $verify_data]);
                    } else {
                        echo json_encode(["success" => false, "message" => "OTP is invalid"]);
                    }
                }

            } catch (PDOException $e) {
                echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        else {
            echo json_encode(["error" => "Database connection error"]);
        }
    }
}

