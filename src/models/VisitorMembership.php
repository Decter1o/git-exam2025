<?php
include_once(__DIR__ . '/../models/DB.php');
class VisitorMembership extends DB {

    public $id;
    public $visitorId;
    public $membershipId;
    public $visitsLeft;
    

    public function init($id, $visitorId, $membershipId, $visitsLeft){
        $this->id = $id;
        $this->visitorId = $visitorId;
        $this->membershipId = $membershipId;
        $this->visitsLeft = $visitsLeft;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }
    
    function GetByVisitorID($visitor_id){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, visitor_id, membership_id, visits_left FROM visitor_memberships WHERE visitor_id = :visitor_id;";
                $stmt = $pdo->prepare($query_string);
                $stmt->execute(['visitor_id' => $visitor_id]);;
                $row = $stmt->fetch();
                if ($row) {
                    return (new VisitorMembership()) -> init($row['id'], $row['visitor_id'], $row['membership_id'], $row['visits_left']);
                } else {
                    return null;
                }
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Получение всех абонементов для посетителей
    function GetAll() {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT id, visitor_id, membership_id, visits_left FROM visitor_memberships;";
                $result = $pdo->query($query_string);
                $visitor_memberships = [];
                while ($row = $result->fetch()) {
                    $visitor_memberships[] = (new VisitorMembership()) -> init($row['id'], $row['visitor_id'], $row['membership_id'], $row['visits_left']);
                }
                return $visitor_memberships;
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }
}