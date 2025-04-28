<?php
include_once(__DIR__ . '/../models/DB.php');
class Schedule extends DB {

    public $id;
    public $dayOfWeek;
    public $startTime;
    public $endTime;
    public $trainingTypeId;
    public $roomname;
    public $trainer;
    public $category;

    public function init($id, $dayOfWeek, $startTime, $endTime, $trainingTypeId, $roomname, $trainer, $category){
        $this->id = $id;
        $this->dayOfWeek = $dayOfWeek;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
        $this->trainingTypeId = $trainingTypeId;
        $this->roomname = $roomname;
        $this->trainer = $trainer;
        $this->category = $category;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }

    function GetAll(){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, training_type_id, start_time, end_time, day_of_week, room_name, trainer, category FROM schedule";
                $result = $pdo->query($query_string);
                $schedules = [];
                while ($row = $result->fetch()) {
                    $schedules[] = (new Schedule()) -> init($row['id'], $row['training_type_id'], $row['start_time'], $row['end_time'], $row['day_of_week'], $row['room_name'], $row['trainer'], $row['category']);
                }
                return $schedules;
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }
}

