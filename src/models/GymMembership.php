<?php
include_once(__DIR__ . '/../models/DB.php');
class GymMembership extends DB {

    public $id;
    public $type;
    public $duration;
    public $price;
    public $specialGroup;

    public function init($id, $type, $duration, $price, $specialGroup){
        $this->id = $id;
        $this->type = $type;
        $this->duration = $duration;
        $this->price = $price;
        $this->specialGroup = $specialGroup;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }

    function GetAll(){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "SELECT id, membership_type, duration, price, special_group FROM gym_memberships";
                $result = $pdo->query($query_string);
                $memberships = [];
                while($row = $result->fetch()){
                    $membership = (new GymMembership())->init($row['id'], $row['membership_type'], $row['duration'], $row['price'], $row['special_group']);
                    // Добавляем поля для совместимости с фронтенда
                    $membership->type = $row['membership_type'];
                    $membership->specialGroup = $row['special_group'];
                    $memberships[] = $membership;
                }
                return $memberships;

            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function Create($id, $membership_type, $duration, $price, $special_group){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "INSERT INTO gym_memberships (id, membership_type, duration, price, special_group) VALUES (:id, :membership_type, :duration, :price, :special_group)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'membership_type' => $membership_type, 'duration' => $duration, 'price' => $price, 'special_group' => $special_group]);
                return ["success" => true, "message" => "Membership created successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function Delete($id){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "DELETE FROM gym_memberships WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                return ["success" => true, "message" => "Membership deleted successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }

    function Update($id, $membership_type, $duration, $price, $special_group){
        $pdo = $this->connect();
        if($pdo){
            try {
                $query_string = "UPDATE gym_memberships SET membership_type = :membership_type, duration = :duration, price = :price, special_group = :special_group WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'membership_type' => $membership_type, 'duration' => $duration, 'price' => $price, 'special_group' => $special_group]);
                return ["success" => true, "message" => "Membership updated successfully"];
            } catch (PDOException $e) {
                return ["error" => "Database connection failed", "details" => $e->getMessage()];
            }
        }
    }
}