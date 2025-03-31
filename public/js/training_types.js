// Загружаем абонементы из localStorage
function loadTrainingTypes() {
    const training_types = JSON.parse(localStorage.getItem('training_types')) || [];
    const tableBody = document.querySelector('#trainingTypesTable tbody');
    tableBody.innerHTML = ''; // Очищаем таблицу перед обновлением

    training_types.forEach(training_type => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = training_type.name;
        row.appendChild(nameCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = training_type.description;
        row.appendChild(descriptionCell);

        // Кнопки для редактирования и удаления
        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Редактировать';
        editButton.onclick = () => editTrainigType(training_type.id);
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.onclick = () => deleteTrainigType(training_type.id);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Добавляем или изменяем абонемент
document.getElementById('trainingTypesForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const id = document.getElementById('trainingTypeId')?.value || crypto.randomUUID();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;

    const training_type = { id, name, description };

    const training_types = JSON.parse(localStorage.getItem('training_types')) || [];
    const existingTrainingTypeIndex = training_types.findIndex(m => m.id === id);

    // Формируем JSON-объект для отправки запроса
    const requestData = {
        platform: "website",
        action: existingTrainingTypeIndex >= 0 ? "update_training_type" : "add_training_type",
        id: id,
        name: name,
        description: description,
    };

    // Определяем, нужно ли обновить или добавить абонемент
    if (existingTrainingTypeIndex >= 0) {
        // Обновляем существующий абонемент
        training_types[existingTrainingTypeIndex] = training_type;
        sendRequest('POST', `/update_training_type/${id}`, requestData);
    } else {
        // Добавляем новый абонемент
        training_types.push(training_type);
        sendRequest('POST', '/add_training_type', requestData);
    }

    // Сохраняем в localStorage
    localStorage.setItem('training_types', JSON.stringify(training_types));

    // Очищаем форму и перезагружаем таблицу
    document.getElementById('trainingTypesForm').reset();
    loadTrainingTypes();
});

// Функция для отправки запросов на сервер с использованием Fetch API
function sendRequest(method, url, data) {
    fetch('/src/helpers/requestreader.php', {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // Преобразуем объект в JSON
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json();
        } else {
            return response.text();
        }
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error('Ошибка при выполнении запроса:', error));
}

// Удаление абонемента
function deleteTrainigType(id) {
    let training_types = JSON.parse(localStorage.getItem('training_types')) || [];
    training_type = training_types.filter(tt => tt.id !== id);
    localStorage.setItem('training_types', JSON.stringify(training_type));

    // Формируем JSON-объект для отправки запроса на удаление
    const requestData = {
        platform: "website",
        action: "delete_training_type",
        id: id
    };

    // Отправляем запрос на сервер для удаления
    sendRequest('POST', `/delete_training_type/${id}`, requestData);

    // Перезагружаем таблицу
    loadTrainingTypes();
}

// Редактирование абонемента
function editTrainigType(id) {
    const training_types = JSON.parse(localStorage.getItem('training_types')) || [];
    const training_type = training_types.find(tt => tt.id === id);
    if (training_type) {
    document.getElementById('name').value = training_type.name;
    document.getElementById('description').value = training_type.description;

    // Добавляем скрытое поле с id для определения редактируемой тренировки
    let trainingTypeIdField = document.getElementById('trainingTypeId');
    if (!trainingTypeIdField) {
        trainingTypeIdField = document.createElement('input');
        trainingTypeIdField.type = 'hidden';
        trainingTypeIdField.id = 'trainingTypeId';
        document.getElementById('trainingTypesForm').appendChild(trainingTypeIdField);
    }
    trainingTypeIdField.value = training_type.id;
    }
}

// Инициализация таблицы при загрузке страницы
document.addEventListener('DOMContentLoaded', loadTrainingTypes);