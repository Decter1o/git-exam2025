<?php
class SMS
{
    private function MobisonKZAPI($phone, $otp){
        $config = require(__DIR__ . '/../../config/config.php');
        
        $this->URL = $config['sms']['URL'];
        $this->API_KEY = $config['sms']['API_KEY'];
        $this->FROM = $config['sms']['FROM'];
        $this->VALIDITY = $config['sms']['VALIDITY'];

        $DATA = array(
            'recipient' => $phone,
            'text' => 'Ваш код: ' . $otp,
            'from' => $this->FROM,
            'params' => array(
                'validity' => $this->VALIDITY
            ),
            'api' => 'v1',
            'apiKey' => $this->API_KEY,
            'output' => 'json'
        );

        $DATA_STRING = http_build_query($DATA);
        $CH = curl_init($this->URL);
        curl_setopt($CH, CURLOPT_POST, true);
        curl_setopt($CH, CURLOPT_POSTFIELDS, $DATA_STRING);
        curl_setopt($CH, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($CH, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/x-www-form-urlencoded',
            'Cache-Control: no-cache'
        ));

        $response = curl_exec($CH);

        if (curl_errno($CH)) {
            echo json_encode(curl_error($CH));
        }
        curl_close($CH);
    }
    
    public function SendOTP($phone){
        $otp = $this->GenerateOTP();
        // $this-> MobisonKZAPI($phone, $otp);
        return $otp;
    }

    private function GenerateOTP(){
        $CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        $LENGTH = 6;
        $CHARACTERS_LENGTH = strlen($CHARACTERS);
        $RANDOM_STRING = "";

        for ($i = 0; $i < $LENGTH; $i++) { 
            $RANDOM_STRING .= $CHARACTERS[rand(0, $CHARACTERS_LENGTH - 1)];
        }
        return $RANDOM_STRING;
    } 
}
?>
