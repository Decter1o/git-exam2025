<?php

include(__DIR__ . '/../services/SMS.php');
include(__DIR__ . '/../models/AdminUser.php');
include(__DIR__ . '/../models/VisitorUser.php');
include(__DIR__ . '/../models/VisitorMembership.php');
include(__DIR__ . '/../models/GymMembership.php');
include(__DIR__ . '/../models/TrainingType.php');
include(__DIR__ . '/../models/Schedule.php');
include(__DIR__ . '/../models/Trainer.php');
include(__DIR__ . '/../models/TrainerPhoto.php');

header("Content-Type: application/json");

$response = []; // Инициализация пустого ответа

// Функция для логирования
function logRequest($requestData, $responseData, $logFile = __DIR__ . '/../../logs/log.txt') {
    $log = "[" . date("Y-m-d H:i:s") . "] ";
    $log .= "Request: " . json_encode($requestData, JSON_UNESCAPED_UNICODE) . "\n";
    $log .= "Response: " . json_encode($responseData, JSON_UNESCAPED_UNICODE) . "\n";
    $log .= "----------------------------------------\n";
    
    file_put_contents($logFile, $log, FILE_APPEND);
}

switch ($_SERVER["REQUEST_METHOD"]) 
{
    case "POST":
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);

        if (!isset($data["platform"])) {
            $response = ["status" => false, "message" => "Platform is required"];
            logRequest($data, $response); // Логирование запроса и ответа
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            exit;
        }

        switch ($data["platform"]) {
            case 'mobile':
                switch ($data["action"]) {
                    case 'auth':
                        $phone = $data["phone"] ?? '';
                        $data_reader = new \VisitorUser();
                        $count = $data_reader->CheckPhoneNumber($phone);

                        if ($count == 1) {
                            $otp = new \SMS();
                            $otp_code = $otp->SendOTP($phone);
                            if ($otp_code) {
                                $data_reader->InsertOTP($otp_code, $phone);
                                $response = ["status" => true, "message" => "OTP sent successfully"];
                            } else {
                                $response = ["status" => false, "message" => "Failed to send OTP"];
                            }
                        } else {
                            $response = ["status" => false, "message" => "Phone number not found or exist"];
                        }
                        break;

                    case 'verify':
                        $phone = $data["phone"] ?? '';
                        $otp = $data["OTP"] ?? '';
                        $visitor_data = new \VisitorUser();
                        $visitor_user = $visitor_data ->VerifyOTP($phone, $otp);
                        $gym_membership = (new GymMembership()) -> GetAll();
                        $visitor_membership = (new VisitorMembership()) -> GetByVisitorID($visitor_user->id);
                        $training_types = (new TrainingType()) -> GetAll();
                        $trainers = (new Trainer()) -> GetAll();
                        $schedule = (new Schedule()) -> GetAll();
                        $trainer_photos = (new TrainerPhoto()) -> GetAll();
                        
                        echo json_encode(["success" => true, "user" => $visitor_user,"visitors_memberships" => $visitor_membership,  "gym_memberships" => $gym_membership, "training_types" => $training_types, "trainers" => $trainers, "schedule" => $schedule, "trainer_photos" => $trainer_photos]);
                        break;

                    default:
                        $response = ["status" => false, "message" => "Action is not recognized"];
                        break;
                }
                break;

            case 'website':
                switch ($data["action"]) {
                    case 'auth':
                        $username = $data["username"] ?? '';
                        $password = $data["password"] ?? '';
                        $u_data_reader = new \AdminUser();
                        $v_data_reader = new \VisitorUser();
                        $gm_data_reader = new \GymMembership();
                        $vm_data_reader = new \VisitorMembership();
                        $tt_data_reader = new \TrainingType();
                        $t_data_reader = new \Trainer();
                        $s_data_reader = new \Schedule();
                        $tp_data_reader = new \TrainerPhoto();
                        $count = $u_data_reader->Auth($username, $password);

                        if ($count == 1) {
                            $response = ["success" => true, "visitors" => $v_data_reader-> GetAll(), "gym_memberships" => $gm_data_reader->GetAll(), "visitors_memberships" => $vm_data_reader->GetAll(), "training_types" => $tt_data_reader->GetAll(), "trainers" => $t_data_reader->GetAll(),"schedule" => $s_data_reader->GetAll(), "trainer_photos" => $tp_data_reader->GetAll()];
                        } else {
                            $response = ["success" => false];
                        }
                        break;
                    case 'add_visitor':
                        $data_reader = new \VisitorUser();
                        $response = $data_reader->Create($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["membershipId"], $data["visitor_membership_id"]);
                        break;
                    case 'update_visitor':
                        $data_reader = new \VisitorUser();
                        $response = $data_reader->Update($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["membershipId"], $data["visitor_membership_id"]);
                        break;
                    case 'delete_visitor':
                        $data_reader = new \VisitorUser();
                        $response = $data_reader->Delete($data["id"]);
                        break;
                    case 'block_visitor':
                        $data_reader = new \VisitorUser();
                        $response = $data_reader->Block($data["id"]);
                        break;
                    case 'unblock_visitor':
                        $data_reader = new \VisitorUser();
                        $response = $data_reader->Unblock($data["id"]);
                        break;
                    case 'add_membership':
                        $data_reader = new \GymMembership();
                        $response = $data_reader->Create($data["id"], $data["membership_type"], $data["duration"], $data["price"], $data["special_group"]);
                        break;
                    case 'update_membership':
                        $data_reader = new \GymMembership();
                        $response = $data_reader->Update($data["id"], $data["membership_type"], $data["duration"], $data["price"], $data["special_group"]);
                        break;
                    case 'delete_membership':
                        $data_reader = new \GymMembership();
                        $response = $data_reader->Delete($data["id"]);
                        break;
                    case 'add_training_type':
                        $data_reader = new \TrainingType();
                        $response = $data_reader->Create($data["id"], $data["name"], $data["description"]);
                        break;
                    case 'update_training_type':
                        $data_reader = new \TrainingType();
                        $response = $data_reader->Update($data["id"], $data["name"], $data["description"]);
                        break;
                    case 'delete_training_type':
                        $data_reader = new \TrainingType();
                        $response = $data_reader->Delete($data["id"]);
                        break;
                    case 'add_trainer':
                        $data_reader = new \Trainer();
                        $response = $data_reader->Create($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["training_type_id"], $data["instagram"], $data["telegram"], $data["whatsapp"], $data["description"], $data["images"]);
                        break;
                    case 'update_trainer':
                        $data_reader = new \Trainer();
                        $response = $data_reader->Update($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["training_type_id"], $data["instagram"], $data["telegram"], $data["whatsapp"], $data["description"], $data["images"]);
                        break;
                    case 'delete_trainer':
                        $data_reader = new \Trainer();
                        $response = $data_reader->Delete($data["id"]);
                        break;
                    default:
                        $response = ["status" => false, "message" => "Action is not recognized"];
                        break;
                }
                break;

            default:
                $response = ["status" => false, "message" => "Platform is not recognized"];
                break;
        }
        logRequest($data, $response); // Логирование запроса и ответа
        break;

    case "GET":
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);

        if (!isset($data["platform"])) {
            $response = ["status" => false, "message" => "Platform is required"];
            break;
        }

        switch ($data["platform"]) {
            case 'mobile':
                // Логика для мобильной платформы (GET)
                break;
            case 'website':
                // Логика для веб-платформы (GET)
                break;
            default:
                $response["error"] = "Platform is not recognized";
                break;
        }
        logRequest($data, $response); // Логирование запроса и ответа
        break;

    default:
        http_response_code(405);
        $response["error"] = "Method Not Allowed";
        logRequest($_SERVER, $response); // Логирование запроса и ошибки
}

// Возвращаем итоговый JSON-ответ
echo json_encode($response, JSON_UNESCAPED_UNICODE);
