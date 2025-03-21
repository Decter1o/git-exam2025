<?php

include(__DIR__ . '/../services/SMS.php');
include(__DIR__ . '/../models/DB.php');

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
            $response = ["status" => "error", "message" => "Platform is required"];
            logRequest($data, $response); // Логирование запроса и ответа
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
            exit;
        }

        switch ($data["platform"]) {
            case 'mobile':
                switch ($data["action"]) {
                    case 'auth':
                        $phone = $data["phone"] ?? '';
                        $data_reader = new \DB();
                        $count = $data_reader->CheckPhoneNumber($phone);

                        if ($count == 1) {
                            $otp = new \SMS();
                            $otp_code = $otp->SendOTP($phone);
                            if ($otp_code) {
                                $data_reader->InsertOTP($otp_code, $phone);
                                $response = ["status" => "success", "message" => "OTP sent successfully"];
                            } else {
                                $response = ["status" => "error", "message" => "Failed to send OTP"];
                            }
                        } else {
                            $response = ["status" => "error", "message" => "Phone number not found or exist"];
                        }
                        break;

                    case 'verify':
                        $phone = $data["phone"] ?? '';
                        $otp = $data["OTP"] ?? '';
                        $data_reader = new \DB();
                        $data_reader->VerifyOTP($phone, $otp);
                        break;

                    default:
                        $response = ["status" => "error", "message" => "Action is not recognized"];
                        break;
                }
                break;

            case 'website':
                switch ($data["action"]) {
                    case 'auth':
                        $username = $data["username"] ?? '';
                        $password = $data["password"] ?? '';
                        $data_reader = new \DB();
                        $count = $data_reader->AdminAuth($username, $password);

                        if ($count == 1) {
                            $response = ["success" => true, "visitors" => $data_reader-> GetVisitorUsers(), "gym_memberships" => $data_reader->GetGymMemberships(), "visitors_memberships" => $data_reader->GetVisitorsMemberships(), "training_types" => $data_reader->GetTrainingTypes(), "schedule" => $data_reader->GetSchedule()];
                        } else {
                            $response = ["success" => false];
                        }
                        break;
                    case 'add_membership':
                        $data_reader = new \DB();
                        $response = $data_reader->CreateGymMembership($data["uuid"], $data["membership_type"], $data["duration"], $data["price"], $data["special_group"]);
                        break;
                    case 'update_membership':
                        $data_reader = new \DB();
                        $response = $data_reader->UpdateGymMembership($data["uuid"], $data["membership_type"], $data["duration"], $data["price"], $data["special_group"]);
                        break;
                    case 'delete_membership':
                        $data_reader = new \DB();
                        $response = $data_reader->DeleteGymMembership($data["uuid"]);
                        break;
                    default:
                        $response = ["status" => "error", "message" => "Action is not recognized"];
                        break;
                }
                break;

            default:
                $response = ["status" => "error", "message" => "Platform is not recognized"];
                break;
        }
        logRequest($data, $response); // Логирование запроса и ответа
        break;

    case "GET":
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);

        if (!isset($data["platform"])) {
            $response = ["status" => "error", "message" => "Platform is required"];
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
