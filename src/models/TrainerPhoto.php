<?php
include_once(__DIR__ . '/../models/DB.php');
class TrainerPhoto extends DB {
    public $id;
    public $trainer_id;
    public $photo_url;

    public function init($id, $trainer_id, $photo_url){
        $this->id = $id;
        $this->trainer_id = $trainer_id;
        $this->photo_url = $photo_url;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }
    
    public function GetAll(){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, trainer_id, photo_url FROM trainer_photos";
                $result = $pdo->query($query_string);
                $photos =[];
                while($row = $result->fetch()){
                    $photos[] = (new TrainerPhoto())->init($row['id'], $row['trainer_id'], 'https://affectionate-mcclintock.89-35-125-20.plesk.page'.$row['photo_url']);
                }
                return $photos;
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error."]);
    }

    public function Delete($id){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "DELETE FROM trainer_photos WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                return json_encode(["success" => "Photo deleted successfully."]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error."]);
    }
}