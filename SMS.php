<?php
class SMS
{
    private $URL = 'https://api.mobizon.kz/service/message/sendSmsMessage';
    private $API_KEY = 'kz7a193766411bf9e77f1d5580db2f4510f5a2d9e4c648d1410d3303bab35f04a3d724';
    private $FROM = 'SPetrenko';
    private $VALIDITY = 5;

    private function MobisonKZAPI($phone, $otp){
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
            echo 'Ошибка: ' . curl_error($CH);
        } else {
            // Прямо выводим ответ сервера
            echo 'Ответ сервера: ' . $response;
        }

        curl_close($CH);
    }
    
    public function SendOTP($phone){
        $otp = $this->GenerateOTP();
        $this-> MobisonKZAPI($phone, $otp);
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
