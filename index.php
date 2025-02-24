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
        
        $reader = new \Data\DataReader();
        $reader -> DataRead($data);
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
