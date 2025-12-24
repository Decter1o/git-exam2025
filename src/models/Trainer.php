<?php
include_once(__DIR__ . '/../models/DB.php');
class Trainer extends DB {
    public $id;
    public $name;
    public $surname;
    public $phone_number;
    public $training_type_id;
    public $inst;
    public $tg;
    public $whatsapp;
    public $description;

    public function init($id, $name, $surname, $phone_number, $training_type_id, $inst, $tg, $whatsapp, $description){
        $this->id = $id;
        $this->name = $name;
        $this->surname = $surname;
        $this->phone_number = $phone_number;
        $this->training_type_id = $training_type_id;
        $this->inst = $inst;
        $this->tg = $tg;
        $this->whatsapp = $whatsapp;
        $this->description = $description;
        return $this;
    }

    private function connect() {
        return parent::DBConnect();
    }
    
    public function GetAll(){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "
                    SELECT 
                        t.id, 
                        t.name, 
                        t.surname, 
                        t.telephone_number as phone_number, 
                        t.training_type as training_type_id,
                        t.instagram as inst,
                        t.telegram as tg,
                        t.whatsapp,
                        t.description,
                        tt.training_name as training_type
                    FROM trainers t
                    LEFT JOIN training_types tt ON t.training_type = tt.id
                ";
                $result = $pdo->query($query_string);
                $trainers = [];
                while($row = $result->fetch()){
                    $trainer = (new Trainer())->init(
                        $row['id'], 
                        $row['name'], 
                        $row['surname'], 
                        $row['phone_number'], 
                        $row['training_type_id'], 
                        $row['inst'], 
                        $row['tg'], 
                        $row['whatsapp'], 
                        $row['description']
                    );
                    // Добавляем поля которые ожидает фронтенд
                    $trainer->phone_number = $row['phone_number'];
                    $trainer->training_type_id = $row['training_type_id'];
                    $trainer->training_type = $row['training_type'] ?? 'Неизвестный тип';
                    $trainer->inst = $row['inst'];
                    $trainer->tg = $row['tg'];
                    $trainers[] = $trainer;
                }
                return $trainers;
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error."]);
    }

    public function Create($id, $name, $surname, $phone_number, $training_type_id, $inst, $tg, $whatsapp, $description, $img){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "INSERT INTO trainers (id, name, surname, telephone_number, training_type, instagram, telegram, whatsapp, description) VALUES (:id, :name, :surname, :phone_number, :training_type_id, :inst, :tg, :whatsapp, :description)";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute([
                    'id' => $id,
                    'name' => $name,
                    'surname' => $surname,
                    'phone_number' => $phone_number,
                    'training_type_id' => $training_type_id,
                    'inst' => $inst,
                    'tg' => $tg,
                    'whatsapp' => $whatsapp,
                    'description' => $description
                ]);
                for ($i=0; $i < count($img); $i++) { 
                    $trainer_img = preg_replace('#data:image/\w+;base64,#i', '', $img[$i]);
                    $trainer_img = base64_decode($trainer_img);
                    $root = realpath(__DIR__ . '/../../');
                    $web_path = '/img/' . $id . '_' . $i . '.png';
                    $file_path = $root . $web_path;

                    file_put_contents($file_path, $trainer_img);

                    $query_string = "INSERT INTO trainer_photos (photo_url, trainer_id) VALUES (:photo_url, :trainer_id)";
                    $sql_query = $pdo->prepare($query_string);
                    $sql_query->execute([
                        'photo_url' => $web_path,  // сохраняем путь, доступный в браузере
                        'trainer_id' => $id
                    ]);

                }
                return json_encode(["status" => "success", "message" => "Trainer created successfully."]);
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
                $query_string = "SELECT photo_url FROM trainer_photos WHERE trainer_id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute(['id' => $id]);
                $photos = $sql_query->fetchAll(PDO::FETCH_COLUMN, 0);
                
                $root = realpath(__DIR__ . '/../../');
                // Удаляем физические файлы
                foreach ($photos as $photo) {
                    $file_path = $root . $photo;
                    if (file_exists($file_path)) {
                        unlink($file_path);
                    }
                }
                
                $pdo->beginTransaction();
    
                $stmtPhotos = $pdo->prepare("DELETE FROM trainer_photos WHERE trainer_id = :id");
                $stmtPhotos->execute(['id' => $id]);
    
                $stmtTrainer = $pdo->prepare("DELETE FROM trainers WHERE id = :id");
                $stmtTrainer->execute(['id' => $id]);
    
                $pdo->commit();
    
                return json_encode(["status" => "success", "message" => "Trainer deleted successfully."]);
            } catch (PDOException $e) {
                $pdo->rollBack();
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error."]);
    }
    

    public function Update($id, $name, $surname, $phone_number, $training_type_id, $inst, $tg, $whatsapp, $description, $img){
        $pdo = $this->connect();
        if ($pdo) {
            try {
                $query_string = "UPDATE trainers SET name = :name, surname = :surname, telephone_number = :phone_number, training_type = :training_type_id, instagram = :inst, telegram = :tg, whatsapp = :whatsapp, description = :description WHERE id = :id";
                $sql_query = $pdo->prepare($query_string);
                $sql_query->execute([
                    'id' => $id,
                    'name' => $name,
                    'surname' => $surname,
                    'phone_number' => $phone_number,
                    'training_type_id' => $training_type_id,
                    'inst' => $inst,
                    'tg' => $tg,
                    'whatsapp' => $whatsapp,
                    'description' => $description
                ]);
                if (!empty($img) && is_array($img)) {
                    // Удаляем старые фото
                    $query_string = "DELETE FROM trainer_photos WHERE trainer_id = :trainer_id";
                    $sql_query = $pdo->prepare($query_string);
                    $sql_query->execute(['trainer_id' => $id]);

                    for ($i = 0; $i < count($img); $i++) {
                        $trainer_img = preg_replace('#data:image/\w+;base64,#i', '', $img[$i]);
                        $trainer_img = base64_decode($trainer_img);
                        $root = realpath(__DIR__ . '/../../');
                        $web_path = '/img/' . $id . '_' . $i . '.png';
                        $file_path = $root . $web_path;
                        file_put_contents($file_path, $trainer_img);

                        $query_string = "INSERT INTO trainer_photos (photo_url, trainer_id) VALUES (:photo_url, :trainer_id)";
                        $sql_query = $pdo->prepare($query_string);
                        $sql_query->execute([
                            'photo_url' => $web_path,
                            'trainer_id' => $id
                        ]);
                    }
                }
                return json_encode(["status" => "success", "message" => "Trainer updated successfully."]);
            } catch (PDOException $e) {
                return json_encode(["error" => "Ошибка запроса: " . $e->getMessage()]);
            }
        }
        return json_encode(["error" => "Database connection error."]);
    }
}