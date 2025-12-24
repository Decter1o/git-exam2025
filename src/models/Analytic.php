<?php
include_once(__DIR__ . '/../models/DB.php');

class Analytic extends DB{
    
    public $visitor_id;
    public $visits_count;
    public $avg_check;
    public $last_visit_date;
    public $churn_risk;

    public function init($id, $visitor_id, $visits_count, $avg_check, $last_visit_date, $churn_risk){
        $this->visitor_id = $visitor_id;
        $this->visits_count = $visits_count;
        $this->avg_check = $avg_check;
        $this->last_visit_date = $last_visit_date;
        $this->churn_risk = $churn_risk;
        return $this;
    }
    
    private function connect() {
        return parent::DBConnect();
    }

    public function GetAll(){
    $pdo = $this->connect();
    if ($pdo) {
        try {
            Analytic::Analytic();
            $query_string = "
                SELECT 
                    vu.id,
                    vu.username as name,
                    vu.usersurname as surname,
                    vu.phone_number,
                    COALESCE(va.avg_check, 0) as avg_check,
                    TO_CHAR(va.last_visit_date, 'YYYY-MM-DD') as last_visit_date,
                    COALESCE(va.churn_risk, 'unknown') as churn_risk
                FROM visitor_users vu
                LEFT JOIN visitor_analytics va ON vu.id = va.visitor_id
                ORDER BY COALESCE(va.visits_count, 0) DESC
            ";
            $result = $pdo->query($query_string);
            $analytics = [];
            while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
                $analytics[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'surname' => $row['surname'],
                    'phone_number' => $row['phone_number'],
                    'avg_check' => $row['avg_check'],
                    'last_visit_date' => $row['last_visit_date'] ?? 'нет данных',
                    'churn_risk' => $row['churn_risk'] ?? 'unknown'
                ];
            }
            return $analytics;
        } catch (PDOException $e) {
            return json_encode([
                "error" => "Database query failed", 
                "details" => $e->getMessage()
            ]);
        }
    }
    return json_encode(["error" => "Database connection error"]);
}


    public function Analytic(){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO visitor_analytics (visitor_id, visits_count, avg_check, last_visit_date, churn_risk)
                    SELECT
                        v.visitor_id,
                        COUNT(v.id) AS visits_count,
                        AVG(v.price) AS avg_check,
                        MAX(v.visit_date) AS last_visit_date,
                        CASE
                            WHEN MAX(v.visit_date) >= NOW() - INTERVAL '7 days' THEN 'low'
                            WHEN MAX(v.visit_date) >= NOW() - INTERVAL '30 days' THEN 'medium'
                            ELSE 'high'
                        END AS churn_risk
                    FROM visits v
                    GROUP BY v.visitor_id
                    ON CONFLICT (visitor_id) DO UPDATE
                    SET
                        visits_count = EXCLUDED.visits_count,
                        avg_check = EXCLUDED.avg_check,
                        last_visit_date = EXCLUDED.last_visit_date,
                        churn_risk = EXCLUDED.churn_risk
                    ");
                $stmt->execute();
                return json_encode(["success" => true, "message" => "Analytics updated successfully"]);
            } catch (Exception $e) {
                return json_encode(["error" => "Error updating analytics: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }
}