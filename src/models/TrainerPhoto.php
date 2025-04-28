<?php
class TrainerPhoto extends DB {
    public $id;
    public $trainer_id;
    public $photo_path;

    public function init($id, $trainer_id, $photo_path){
        $this->id = $id;
        $this->trainer_id = $trainer_id;
        $this->photo_path = $photo_path;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }
    
    public function GetAll(){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, trainer_id, photo_path FROM trainer_photos";
                $result = $pdo->query($query_string);
                $photos =[];
                while($row = $result->fetch()){
                    $photos[] = (new TrainerPhoto())->init($row['id'], $row['trainer_id'], $row['photo_path']);
                }
                return $photos;
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error."]);
    }
}