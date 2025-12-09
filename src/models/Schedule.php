<?php
include_once(__DIR__ . '/../models/DB.php');
class Schedule extends DB {

    public $id;
    public $day_of_week;
    public $start_time;
    public $end_time;
    public $training_type_id;
    public $room_name;
    public $trainer;
    public $category;

    public function init($id, $day_of_week, $start_time, $end_time, $training_type_id, $room_name, $trainer, $category){
        $this->id = $id;
        $this->day_of_week = $day_of_week;
        $this->start_time = $start_time;
        $this->end_time = $end_time;
        $this->training_type_id = $training_type_id;
        $this->room_name = $room_name;
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
                    $schedules[] = (new Schedule()) -> init($row['id'], $row['day_of_week'], $row['start_time'], $row['end_time'], $row['training_type_id'], $row['room_name'], $row['trainer'], $row['category']);
                }
                return $schedules;
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    function Create($id, $day_of_week, $start_time, $end_time, $training_type_id, $room_name, $trainer, $category){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "INSERT INTO schedule (id, day_of_week, start_time, end_time, training_type_id, room_name, trainer, category) VALUES (:id, :day_of_week, :start_time, :end_time, :training_type_id, :room_name, :trainer, :category) ON CONFLICT (id) DO UPDATE SET day_of_week = :day_of_week, start_time = :start_time, end_time = :end_time, training_type_id = :training_type_id, room_name = :room_name, trainer = :trainer, category = :category";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute([
                    'id' => $id,
                    'day_of_week' => $day_of_week,
                    'start_time' => $start_time,
                    'end_time' => $end_time,
                    'training_type_id' => $training_type_id,
                    'room_name' => $room_name,
                    'trainer' => $trainer,
                    'category' => $category
                ]);
                return json_encode(["success" => "Schedule created successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    function Update($id, $day_of_week, $start_time, $end_time, $training_type_id, $room_name, $trainer, $category){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "UPDATE schedule SET day_of_week = :day_of_week, start_time = :start_time, end_time = :end_time, training_type_id = :training_type_id, room_name = :room_name, trainer = :trainer, category = :category WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute([
                    'id' => $id,
                    'day_of_week' => $day_of_week,
                    'start_time' => $start_time,
                    'end_time' => $end_time,
                    'training_type_id' => $training_type_id,
                    'room_name' => $room_name,
                    'trainer' => $trainer,
                    'category' => $category
                ]);
                return json_encode(["success" => "Schedule updated successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    function Delete($id){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "DELETE FROM schedule WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                return json_encode(["success" => "Schedule deleted successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }
}

