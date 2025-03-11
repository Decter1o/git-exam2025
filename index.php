<?php
include 'SMS.php';
include 'Data.php';

header("Content-Type: application/json");

$response = [];

switch ($_SERVER["REQUEST_METHOD"]) 
{
    case "POST":
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        switch ($data["platform"]) {
            case 'mobile':
                switch ($data["action"]) {
                    case 'auth':
                        $phone = $data["phone"];
                        $data_reader = new \Data\DB();
                        $count = $data_reader->CheckPhoneNumber($phone);
        
                        if ($count == 1) {
                            $otp = new \SMS();
                            $otp_code = $otp->SendOTP($phone);
                            if ($otp_code) {
                                $data_reader->InsertOTP($otp_code, $phone);
                            } else {
                                echo json_encode(["status" => "error", "message" => "Failed to send OTP"]);
                            }
                        } else {
                            echo json_encode(["status" => "error", "message" => "Phone number not found or exist"]);
                        }
                        break;
                    case 'verify':
                        $phone = $data["phone"];
                        $otp = $data["OTP"];
                        $data_reader = new \Data\DB();
                        $count = $data_reader->VerifyOTP($phone, $otp);
                        break;
                    default:
                        
                        break;
                }
                break;

            case 'website':
                echo json_encode(["status" => "error", "message" => "Website functionality not implemented."]);
                break;

            default:
                echo json_encode(["status" => "error", "message" => "Platform is not recognized"]);
                break;
        }
        break;
    case "GET":
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        switch ($data["platform"]) 
        {
            case 'mobile':
                
                break;
            case 'website':
                
                break;
            default:
                $response["error"] = "platform is not read";
                break;
        }
        break;
    default:
        http_response_code(405);
        $response["error"] = "Method Not Allowed";
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
