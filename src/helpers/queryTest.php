<?php
// Проверяем, что метод запроса POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Проверяем, что заголовок Content-Type - это application/json
    if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
        
        // Получаем сырые данные из тела запроса
        $rawData = file_get_contents('php://input');

        // Пробуем декодировать JSON
        $data = json_decode($rawData, true);

        // Проверяем, был ли JSON декодирован успешно
        if (json_last_error() === JSON_ERROR_NONE) {
            // JSON успешно декодирован
            echo "Получены данные: ";
            print_r($data);
        } else {
            // Ошибка в JSON
            echo "Ошибка: Неверный формат JSON.";
        }
    } else {
        echo "Ошибка: Заголовок Content-Type должен быть application/json.";
    }
} else {
    echo "Ошибка: Некорректный метод запроса.";
}
?>
