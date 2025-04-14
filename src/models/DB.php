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
            } catch (PDOException $e) {
                echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
    }
    function GetGymMemberships(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT id, membership_type, duration, price, special_group FROM gym_memberships";
                $result = $pdo->query($query_string);
                $memberships = [];
                while($row = $result->fetch()){
                    $memberships[] = new GymMembership($row['id'], $row['membership_type'], $row['duration'], $row['price'], $row['special_group']);
                }
                return $memberships;

            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function CreateGymMembership($id, $membership_type, $duration, $price, $special_group){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "INSERT INTO gym_memberships (id, membership_type, duration, price, special_group) VALUES (:id, :membership_type, :duration, :price, :special_group)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'membership_type' => $membership_type, 'duration' => $duration, 'price' => $price, 'special_group' => $special_group]);
                return ["success" => true, "message" => "Membership created successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function DeleteGymMembership($id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "DELETE FROM gym_memberships WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                return ["success" => true, "message" => "Membership deleted successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function UpdateGymMembership($id, $membership_type, $duration, $price, $special_group){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "UPDATE gym_memberships SET membership_type = :membership_type, duration = :duration, price = :price, special_group = :special_group WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'membership_type' => $membership_type, 'duration' => $duration, 'price' => $price, 'special_group' => $special_group]);
                return ["success" => true, "message" => "Membership updated successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function GetVisitorUsers(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT id, username, usersurname, phone_number, status FROM visitor_users";
                $result = $pdo->query($query_string);
                $visitor_users = [];
                while($row = $result->fetch()){
                    $visitor_users[] = new VisitorUser($row['id'], $row['username'], $row['usersurname'], $row['phone_number'], $row['status']);
                }
                return $visitor_users;
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function CreateVisitorUser($id, $username, $usersurname, $phone_number, $membership_id, $visitor_membership_id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "CALL CreateVisitor(:id, :username, :usersurname, :phone_number, :membership_id, :visitor_membership_id, @status)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'username' => $username, 'usersurname' => $usersurname, 'phone_number' => $phone_number, 'membership_id' => $membership_id, 'visitor_membership_id' => $visitor_membership_id]);

                $query_string = "SELECT @status";
                $status_query = $pdo->prepare($query_string);
                $status_query->execute();
                $status = $status_query->fetchColumn();
                return ["success" => true,"status" => $status, "message" => "Visitor user created successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }
    
    function UpdateVisitorUser($id, $username, $usersurname, $phone_number, $membership_id, $visitor_membership_id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "CALL UpdateVisitor(:id, :username, :usersurname, :phone_number, :membership_id, :visitor_membership_id, @status)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'username' => $username, 'usersurname' => $usersurname, 'phone_number' => $phone_number, 'membership_id' => $membership_id, 'visitor_membership_id' => $visitor_membership_id]);

                $query_string = "SELECT @status";
                $status_query = $pdo->prepare($query_string);
                $status_query->execute();
                $status = $status_query->fetchColumn();
                return ["success" => true,"status" => $status, "message" => "Visitor user updated successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function DeleteVisitorUser($id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "CALL DeleteVisitor(:id, @status)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);

                $query_string = "SELECT @status";
                $status_query = $pdo->prepare($query_string);
                $status_query->execute();
                $status = $status_query->fetchColumn();
                return ["success" => true,"status" => $status, "message" => "Visitor user deleted successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function BlockVisitorUser($id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "UPDATE visitor_users SET status = '0' WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                
                return ["success" => true, "status" => 0, "message" => "Visitor user blocked successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }
    
    function UnblockVisitorUser($id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "UPDATE visitor_users SET status = '1' WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                
                return ["success" => true, "status" => 1, "message" => "Visitor user unblocked successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }    

    function GetVisitorsMemberships(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT id, visitor_id, membership_id, visits_left FROM visitor_memberships;";
                $result = $pdo->query($query_string);
                $visitor_memberships = [];
                while($row = $result->fetch()){
                    $visitor_memberships[] = new VisitorMembership($row['id'], $row['visitor_id'], $row['membership_id'], $row['visits_left']);
                }
                return $visitor_memberships;
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function GetTrainingTypes(){
        $pdo = $this->DBConnect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, training_name, description FROM training_types";
                $result = $pdo->query($query_string);
                $training_types = [];
                while ($row = $result->fetch()) {
                    $training_types[] = new TrainingType($row['id'], $row['training_name'], $row['description']);
                }
                return $training_types;
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];}
        }
    }

    function CreateTrainingType($id, $training_name, $description){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "INSERT INTO training_types (id, training_name, description) VALUES (:id, :training_name, :description)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'training_name' => $training_name, 'description' => $description]);
                return ["success" => true, "message" => "Training type created successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }
    function DeleteTrainingType($id){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "DELETE FROM training_types WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                return ["success" => true, "message" => "Training type deleted successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function UpdateTrainingType($id, $training_name, $description){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "UPDATE training_types SET training_name = :training_name, description = :description WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'training_name' => $training_name, 'description' => $description]);
                return ["success" => true, "message" => "Training type updated successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function GetSchedule(){
        $pdo = $this->DBConnect();
        if($pdo){
            try {
                $query_string = "SELECT id, training_type_id, start_time, end_time, day_of_week, room_name, trainer_name, category FROM schedule";
                $result = $pdo->query($query_string);
                $schedules = [];
                while($row = $result->fetch()){
                    $schedules[] = new Schedule($row['id'], $row['training_type_id'], $row['start_time'], $row['end_time'], $row['day_of_week'], $row['room_name'], $row['trainer_name'], $row['category']);
                }
                return $schedules;
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }
}

