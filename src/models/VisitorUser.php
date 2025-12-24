<?php
include_once(__DIR__ . '/../models/DB.php');
class VisitorUser extends DB {
    
    public $id;
    public $name;
    public $surname;
    public $phone_number;
    public $status;

    public function init($id, $name, $surname, $phone_number, $status) {
        $this->id = $id;
        $this->name = $name;
        $this->surname = $surname;
        $this->phone_number = $phone_number;
        $this->status = $status;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }

    // Проверка номера телефона
    function CheckPhoneNumber($phone) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT COUNT(*) FROM visitor_users WHERE phone_number = :phone";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone]);
                return $sql_query->fetchColumn();
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Не удалось подключиться к базе данных."]);
    }

    // Вставка OTP
    function InsertOTP($otp, $phone) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT insert_otp(:phone, :otp)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone, 'otp' => $otp]);

                return json_encode(["status" => "success", "message" => "OTP inserted/updated successfully."]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        } else {
            return json_encode(["error" => "Не удалось подключиться к базе данных."]);
        }
    }

    function VerifyOTP($phone, $otp){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                // Получаем OTP, если не истек срок
                $query_string = "SELECT otp FROM visitor_otp WHERE phone_number = :phone AND expires_at > NOW()";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['phone' => $phone]);

                $otp_data = $sql_query->fetch(PDO::FETCH_ASSOC);

                // Если OTP не найден или просрочен
                if (!$otp_data) {
                    echo json_encode(["success" => false, "message" => "OTP is invalid or expired"]);
                }
                else {
                    // Проверяем правильность OTP
                    if ($otp_data["otp"] == $otp) {
                       
                        // Получаем имя пользователя
                        $verify_query_string = "SELECT id, username, usersurname, phone_number, status FROM visitor_users WHERE phone_number = :phone";
                        $verify_query = $pdo->prepare($verify_query_string);
                        $verify_query->execute(['phone' => $phone]);
                        $visitor_row = $verify_query->fetch(PDO::FETCH_ASSOC);

                        if ($visitor_row) {
                            $visitor_data = $this->init(
                                $visitor_row['id'],
                                $visitor_row['username'],
                                $visitor_row['usersurname'],
                                $visitor_row['phone_number'],
                                $visitor_row['status']
                            );
                            return $visitor_data;
                        } else {
                            echo json_encode(["success" => false, "message" => "Visitor not found"]);
                        }

                    } else {
                        echo json_encode(["success" => false, "message" => "OTP is invalid"]);
                    }
                }

            } catch (PDOException $e) {
                echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        else {
            echo json_encode(["error" => "Database connection error"]);
        }
    }
    // Получение всех пользователей
    function GetAll() {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "
                    SELECT 
                        vu.id, 
                        vu.username, 
                        vu.usersurname, 
                        vu.phone_number, 
                        vu.status,
                        vm.id as visitor_membership_id,
                        vm.membership_id,
                        gm.membership_type,
                        vm.visits_left
                    FROM visitor_users vu
                    LEFT JOIN visitor_memberships vm ON vu.id = vm.visitor_id
                    LEFT JOIN gym_memberships gm ON vm.membership_id = gm.id
                ";
                $result = $pdo->query($query_string);
                $visitor_users = [];
                while ($row = $result->fetch()) {
                    $visitor = new VisitorUser();
                    $visitor = $visitor->init($row['id'], $row['username'], $row['usersurname'], $row['phone_number'], $row['status']);
                    // Добавляем дополнительные поля
                    $visitor->membership_id = $row['membership_id'];
                    $visitor->visitor_membership_id = $row['visitor_membership_id'];
                    $visitor->membership_type = $row['membership_type'];
                    $visitor->visits_left = $row['visits_left'];
                    $visitor_users[] = $visitor;
                }
                return $visitor_users;
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Создание нового пользователя
    function Create($id, $username, $usersurname, $phone_number, $membership_id, $visitor_membership_id) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT create_visitor(:id, :username, :usersurname, :phone_number, :membership_id, :visitor_membership_id)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'username' => $username, 'usersurname' => $usersurname, 'phone_number' => $phone_number, 'membership_id' => $membership_id, 'visitor_membership_id' => $visitor_membership_id]);

                return json_encode(["success" => true, "message" => "Visitor user created successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Обновление пользователя
    function Update($id, $username, $usersurname, $phone_number, $membership_id, $visitor_membership_id) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT update_visitor(:id, :username, :usersurname, :phone_number, :membership_id, :visitor_membership_id)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id, 'username' => $username, 'usersurname' => $usersurname, 'phone_number' => $phone_number, 'membership_id' => $membership_id, 'visitor_membership_id' => $visitor_membership_id]);

                return json_encode(["success" => true, "message" => "Visitor user updated successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Удаление пользователя
    function Delete($id) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "SELECT delete_visitor(:id)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);

                return json_encode(["success" => true, "message" => "Visitor user deleted successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Блокировка пользователя
    function Block($id) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "UPDATE visitor_users SET status = '0' WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                
                return json_encode(["success" => true, "status" => 0, "message" => "Visitor user blocked successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }

    // Разблокировка пользователя
    function Unblock($id) {
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "UPDATE visitor_users SET status = '1' WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                
                return json_encode(["success" => true, "status" => 1, "message" => "Visitor user unblocked successfully"]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error"]);
    }
}

