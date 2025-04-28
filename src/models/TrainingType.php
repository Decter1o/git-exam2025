<?php
include_once(__DIR__ . '/../models/DB.php');
class TrainingType extends DB {

    public $id;
    public $name;
    public $description;

    public function init($id, $name, $description){
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }

    // Получение всех типов тренировок
    function GetAll(){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, training_name, description FROM training_types";
                $result = $pdo->query($query_string);
                $training_types = [];
                while ($row = $result->fetch()) {
                    $training_types[] = (new TrainingType()) -> init($row['id'], $row['training_name'], $row['description']);
                }
                return $training_types;
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Создание типа тренировки
    function Create($id, $training_name, $description){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "INSERT INTO training_types (id, training_name, description) VALUES (:id, :training_name, :description)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'training_name' => $training_name, 'description' => $description]);
                return json_encode(["success" => true, "message" => "Training type created successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
    }

    // Удаление типа тренировки
    function Delete($id){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "DELETE FROM training_types WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                return json_encode(["success" => true, "message" => "Training type deleted successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
    }

    // Обновление типа тренировки
    function Update($id, $training_name, $description){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "UPDATE training_types SET training_name = :training_name, description = :description WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'training_name' => $training_name, 'description' => $description]);
                return json_encode(["success" => true, "message" => "Training type updated successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
    }
}
