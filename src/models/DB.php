<?php

include(__DIR__ . '/../models/AdminUser.php');
include(__DIR__ . '/../models/VisitorUser.php');
include(__DIR__ . '/../models/VisitorMembership.php');
include(__DIR__ . '/../models/GymMembership.php');
include(__DIR__ . '/../models/Schedule.php');
include(__DIR__ . '/../models/TrainingType.php');

class DB
{
    private $pdo;

    function DBConnect(){
        
        $config = require(__DIR__ . '/../../config/config.php');
        $connection_string = "mysql:host=" . $config['db']['host'] . ";dbname=" . $config['db']['dbname'] . ";charset=" . $config['db']['charset'];

        try {
            $this->pdo = new PDO($connection_string, $config['db']['user'], $config['db']['password'], [
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
                $query_string = "SELECT COUNT(*) FROM visitor_users WHERE phone_number LIKE :phone";
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
                $query_string = "SELECT otp FROM visitor_otp WHERE phone_number = :phone AND expires_at > NOW()";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone]);

                $otp_data = $sql_query->fetch(PDO::FETCH_ASSOC);

                // Если OTP не найден или просрочен
                if (!$otp_data) {
                    echo json_encode(["success" => false, "message" => "OTP is invalid or expired"]);
                }
                else {
                    // Проверяем правильность OTP
                    if ($otp_data["otp"] == $otp) {
                        // Получаем имя пользователя
                        $verify_query_string = "SELECT username, usersurname FROM visitor_users WHERE phone_number = :phone";
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
    function AdminAuth($username, $password){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT COUNT(*) FROM admin_users WHERE username = :username AND password = :password";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['username' => $username, 'password' => $password]);
                return $sql_query->fetchColumn();
            } catch (PDOExeption $e) {
                echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
    }
    function GetGymMemberships(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT BIN_TO_UUID(id) AS uuid, membership_type, duration, price, special_group FROM gym_memberships";
                $result = $pdo->query($query_string);
                $memberships = [];
                while($row = $result->fetch()){
                    $memberships[] = new GymMembership($row['uuid'], $row['membership_type'], $row['duration'], $row['price'], $row['special_group']);
                }
                return $memberships;

            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function CreateGymMembership($membership_type, $duration, $price, $special_group){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "INSERT INTO gym_memberships (membership_type, duration, price, special_group) VALUES (:membership_type, :duration, :price, :special_group)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['membership_type' => $membership_type, 'duration' => $duration, 'price' => $price, 'special_group' => $special_group]);
                return ["success" => true, "message" => "Membership created successfully"];
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function DeleteGymMembership($uuid){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "DELETE FROM gym_memberships WHERE id = UUID_TO_BIN(:uuid)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['uuid' => $uuid]);
                return ["success" => true, "message" => "Membership deleted successfully"];
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function UpdateGymMembership($uuid, $membership_type, $duration, $price, $special_group){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "UPDATE gym_memberships SET membership_type = :membership_type, duration = :duration, price = :price, special_group = :special_group WHERE id = UUID_TO_BIN(:uuid)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['uuid' => $uuid, 'membership_type' => $membership_type, 'duration' => $duration, 'price' => $price, 'special_group' => $special_group]);
                return ["success" => true, "message" => "Membership updated successfully"];
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function GetVisitorUsers(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT BIN_TO_UUID(id) AS uuid, username, usersurname, phone_number FROM visitor_users";
                $result = $pdo->query($query_string);
                $visitor_users = [];
                while($row = $result->fetch()){
                    $visitor_users[] = new VisitorUser($row['uuid'], $row['username'], $row['usersurname'], $row['phone_number']);
                }
                return $visitor_users;
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function GetVisitorsMemberships(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT BIN_TO_UUID(id) AS uuid, BIN_TO_UUID(visitor_id) AS visitor_uuid, BIN_TO_UUID(membership_id) AS membership_uuid, start_date, end_date FROM visitor_memberships;";
                $result = $pdo->query($query_string);
                $visitor_memberships = [];
                while($row = $result->fetch()){
                    $visitor_memberships[] = new VisitorMembership($row['uuid'], $row['visitor_uuid'], $row['membership_uuid'], $row['start_date'], $row['end_date']);
                }
                return $visitor_memberships;
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function GetTrainingTypes(){
        $pdo = $this->DBConnect();
        if ($pdo) {
            try {
                $query_string = "SELECT BIN_TO_UUID(id) AS uuid, training_name, description FROM training_types";
                $result = $pdo->query($query_string);
                $training_types = [];
                while ($row = $result->fetch()) {
                    $training_types[] = new TrainingType($row['uuid'], $row['training_name'], $row['description']);
                }
                return $training_types;
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];}
        }
    }

    function GetSchedule(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT BIN_TO_UUID(id) AS uuid, BIN_TO_UUID(training_type_id) AS training_type_uuid, start_time, end_time, day_of_week, room_name, trainer_name, category FROM schedule";
                $result = $pdo->query($query_string);
                $schedules = [];
                while($row = $result->fetch()){
                    $schedules[] = new Schedule($row['uuid'], $row['training_type_uuid'], $row['start_time'], $row['end_time'], $row['day_of_week'], $row['room_name'], $row['trainer_name'], $row['category']);
                }
                return $schedules;
            } catch (PDOExeption $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }
}

