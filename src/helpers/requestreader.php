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
include(__DIR__ . '/../models/Visits.php');
include(__DIR__ . '/../models/Analytic.php');

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
                session_start();
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
                        $result = $u_data_reader->Auth($username, $password);

                        if ($result != null) {
                            $_SESSION["user_id"] = $result;
                            $_SESSION["username"] = $username;
                            $response = ["success" => true, "visitors" => $v_data_reader-> GetAll(), "gym_memberships" => $gm_data_reader->GetAll(), "visitors_memberships" => $vm_data_reader->GetAll(), "training_types" => $tt_data_reader->GetAll(), "trainers" => $t_data_reader->GetAll(),"schedule" => $s_data_reader->GetAll(), "trainer_photos" => $tp_data_reader->GetAll()];
                        } else {
                            $response = ["success" => false];
                        }
                        break;
                    case 'logout':
                        session_unset();
                        session_destroy();
                        $response = ["success" => true, "message" => "Logged out successfully"];
                        break;
                    case 'add_visitor':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorUser();
                            $response = $data_reader->Create($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["membership_id"], $data["visitor_membership_id"]);
                            break;
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'update_visitor':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorUser();
                            $response = $data_reader->Update($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["membership_id"], $data["visitor_membership_id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'delete_visitor':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorUser();
                            $response = $data_reader->Delete($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'block_visitor':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorUser();
                            $response = $data_reader->Block($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'unblock_visitor':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorUser();
                            $response = $data_reader->Unblock($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'add_membership':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \GymMembership();
                            $response = $data_reader->Create($data["id"], $data["membership_type"], $data["duration"], $data["price"], $data["special_group"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'update_membership':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \GymMembership();
                            $response = $data_reader->Update($data["id"], $data["membership_type"], $data["duration"], $data["price"], $data["special_group"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'delete_membership':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \GymMembership();
                            $response = $data_reader->Delete($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'add_training_type':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \TrainingType();
                            $response = $data_reader->Create($data["id"], $data["name"], $data["description"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'update_training_type':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \TrainingType();
                            $response = $data_reader->Update($data["id"], $data["name"], $data["description"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'delete_training_type':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \TrainingType();
                            $response = $data_reader->Delete($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'add_trainer':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Trainer();
                            $response = $data_reader->Create($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["training_type_id"], $data["instagram"], $data["telegram"], $data["whatsapp"], $data["description"], $data["images"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'update_trainer':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Trainer();
                            $response = $data_reader->Update($data["id"], $data["name"], $data["surname"], $data["phone_number"], $data["training_type_id"], $data["instagram"], $data["telegram"], $data["whatsapp"], $data["description"], $data["images"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'delete_trainer':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Trainer();
                            $response = $data_reader->Delete($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'add_schedule':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Schedule();
                            $response = $data_reader->Create($data["id"], $data["day_of_week"], $data["start_time"], $data["end_time"], $data["training_type_id"], $data["room_name"], $data["trainer"], $data["category"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'update_schedule':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Schedule();
                            $response = $data_reader->Update($data["id"], $data["day_of_week"], $data["start_time"], $data["end_time"], $data["training_type_id"], $data["room_name"], $data["trainer"], $data["category"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'delete_schedule':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Schedule();
                            $response = $data_reader->Delete($data["id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_visitors':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorUser();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_memberships':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \GymMembership();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_visitor_memberships':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \VisitorMembership();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'visit':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Visits();
                            $response = $data_reader->Visit($data["visitor_id"], $data["membership_id"]);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_training_types':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \TrainingType();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_trainers':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Trainer();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_schedule':
                        if(isset($_SESSION["user_id"])) {
                            $schedule_reader = new \Schedule();
                            $training_type_reader = new \TrainingType();
                            $trainer_reader = new \Trainer();
                            
                            $response = [
                                'schedule' => $schedule_reader->GetAll(),
                                'training_types' => $training_type_reader->GetAll(),
                                'trainers' => $trainer_reader->GetAll()
                            ];
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_trainer_photos':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \TrainerPhoto();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_analytics':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Analytic();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'update_analytics':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Analytic();
                            $response = json_decode($data_reader->Analytic(), true);
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_visits':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Visits();
                            $response = $data_reader->GetAll();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
                        break;
                    case 'get_all_bad_boys':
                        if(isset($_SESSION["user_id"])) {
                            $data_reader = new \Analytic();
                            $response = $data_reader->GetAllBadBoys();
                        } else {
                            $response = ["status" => false, "message" => "User not authenticated"];
                        }
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
        $data = $_GET;
        if (!isset($data["platform"])) {
            $response = ["status" => false, "message" => "Platform is required"];
            break;
        }

        switch ($data["platform"]) {
            case 'mobile':
                switch ($data["action"]) {
                    case 'get_membership':
                        $data_reader = new \GymMembership();
                        $response = $data_reader->GetAll();
                        break;
                    case 'get_trainer':
                        $tt_data_reader = new \TrainingType();
                        $t_data_reader = new \Trainer();
                        $tp_data_reader = new \TrainerPhoto();
                        $training_types = $tt_data_reader->GetAll();
                        $trainers = $t_data_reader->GetAll();
                        $trainer_photos = $tp_data_reader->GetAll();
                        $trainer_query = [];
                        if($trainers == null) {
                            $response = ["status" => false, "message" => "Trainers not found"];
                            break;
                        }
                        foreach ($trainers as $trainer) {
                            $trainer_query[] = [
                                "id" => $trainer->id,
                                "name" => $trainer->name,
                                "surname" => $trainer->surname,
                                "phone_number" => $trainer->phone_number,
                                "training_type" => (function() use ($training_types, $trainer) {
                                    $types = array_filter($training_types, function($type) use ($trainer) {
                                        return $type->id == $trainer->training_type_id;
                                    });
                                    $types = array_values($types); // сбросить ключи
                                    return isset($types[0]) ? $types[0]->name : null;
                                })(),
                                "instagram" => $trainer->inst,
                                "telegram" => $trainer->tg,
                                "whatsapp" => $trainer->whatsapp,
                                "description" => $trainer->description,
                                "images" => (function() use ($trainer_photos, $trainer) {
                                    $photos = array_filter($trainer_photos, function($photo) use ($trainer) {
                                        return $photo->trainer_id == $trainer->id;
                                    });
                                    $photos = array_values($photos); // сбросить ключи
                                    return array_map(function($photo) {
                                        return $photo->photo_url;
                                    }, $photos);
                                })()
                            ];
                        }
                        $response = ["trainers" => $trainer_query];
                        break;
                    case 'get_schedule':
                        $tt_data_reader = new \TrainingType();
                        $t_data_reader = new \Trainer();
                        $data_reader = new \Schedule();
                        $training_types = $tt_data_reader->GetAll();
                        $trainers = $t_data_reader->GetAll();
                        $schedule = $data_reader->GetAll();
                        $schedule_query = [];
                        if($schedule == null) {
                            $response = ["status" => false, "message" => "Schedule not found"];
                            break;
                        }
                        foreach ($schedule as $item) {
                            $schedule_query[] = [
                                "id" => $item->id,
                                "day_of_week" => $item->day_of_week,
                                "start_time" => $item->start_time,
                                "end_time" => $item->end_time,
                                "training_type" => (function() use ($training_types, $item) {
                                    $types = array_filter($training_types, function($type) use ($item) {
                                        return $type->id == $item->training_type_id;
                                    });
                                    $types = array_values($types); // сбросить ключи
                                    return isset($types[0]) ? $types[0]->name : null;
                                })(),
                                "room_name" => $item->room_name,
                                "trainer" => (function() use ($trainers, $item) {
                                    $trainers_list = array_filter($trainers, function($trainer) use ($item) {
                                        return $trainer->id == $item->trainer;
                                    });
                                    $trainers_list = array_values($trainers_list); // сбросить ключи
                                    return isset($trainers_list[0]) ? $trainers_list[0]->name . ' ' . $trainers_list[0]->surname : null;
                                })(),
                                "category" => $item->category
                            ];
                        }
                        $response = ["schedule" => $schedule_query];
                        break;
                    case 'get_training_type':
                        $data_reader = new \TrainingType();
                        $response = $data_reader->GetAll();
                        break;
                    default:
                        $response = ["status" => false, "message" => "Action is not recognized"];
                        break;
                }
                break;
            case 'website':
                // Логика для веб-платформы (GET) - не используется, так как все запросы через POST
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
