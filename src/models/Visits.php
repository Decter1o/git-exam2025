<?php
include_once(__DIR__ . '/../models/DB.php');

class Visits extends DB {

    public $id;
    public $visitor_id;
    public $visit_date;
    public $service_id;
    public $membership_id;

    public function init($id, $visitor_id, $visit_date, $membership_id, $price){
        $this->id = $id;
        $this->visitor_id = $visitor_id;
        $this->visit_date = $visit_date;
        $this->membership_id = $membership_id;
        $this->price = $price;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }

    function Visit($visitor_id, $membership_id) {
        $pdo = $this->connect();
        if (!$pdo) {
            return json_encode(["error" => "Database connection error"]);
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT price, duration FROM gym_memberships WHERE id = :membership_id;");
            $stmt->execute(['membership_id' => $membership_id]);
            $membership = $stmt->fetch();

            if (!$membership) {
                $pdo->rollBack();
                return json_encode(["success" => false, "message" => "Membership not found"]);
            }

            $membership_price = $membership['price'];
            $membership_duration = $membership['duration'];
            $price = 0;

            switch ($membership_duration) {
                case 'разовый':
                    $price = $membership_price;
                    break;
                case '1 месяц':
                    $price = $membership_price / 12;
                    break;
                case '3 месяца':
                    $price = $membership_price / 36;
                    break;
                case '6 месяцев':
                    $price = $membership_price / 72;
                    break;
                case '1 год':
                    $price = $membership_price / 144;
                    break;
                default:
                    $price = $membership_price;
                    break;
            }

            $stmt = $pdo->prepare("
                UPDATE visitor_memberships
                SET visits_left = visits_left - 1
                WHERE visitor_id = :visitor_id AND visits_left > 0
                RETURNING visits_left;
            ");
            $stmt->execute(['visitor_id' => $visitor_id]);
            $row = $stmt->fetch();

            if (!$row) {
                $pdo->rollBack();
                return json_encode(["success" => false, "message" => "No visits left"]);
            }

            $visit_date = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("
                INSERT INTO visits (visitor_id, membership_id, visit_date, price)
                VALUES (:visitor_id, :membership_id, :visit_date, :price)
            ");
            $stmt->execute([
                'visitor_id' => $visitor_id,
                'membership_id' => $membership_id,
                'visit_date' => $visit_date,
                'price' => $price
            ]);

            $pdo->commit();
            return json_encode(["success" => true, "message" => "Visit recorded successfully"]);

        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            return json_encode(["error" => "Database error", "details" => $e->getMessage()]);
        }
    }

    function GetAll() {
        $pdo = $this->connect();
        if (!$pdo) {
            return json_encode(["error" => "Database connection error"]);
        }

        try {
            $stmt = $pdo->prepare("
                SELECT id, visitor_id, visit_date, membership_id, price
                FROM visits
                ORDER BY visit_date DESC
            ");
            $stmt->execute();
            $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return $visits ? $visits : [];
        } catch (PDOException $e) {
            return json_encode(["error" => "Database error", "details" => $e->getMessage()]);
        }
    }

}