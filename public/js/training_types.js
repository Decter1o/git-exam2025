// Загружаем абонементы из localStorage
function loadTrainingTypes() {
    let training_types = JSON.parse(localStorage.getItem('training_types')) || [];
    let tableBody = document.querySelector('#trainingTypesTable tbody');
    tableBody.innerHTML = ''; // Очищаем таблицу перед обновлением

    training_types.forEach(training_type => {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        nameCell.textContent = training_type.name;
        row.appendChild(nameCell);

        let descriptionCell = document.createElement('td');
        descriptionCell.textContent = training_type.description;
        row.appendChild(descriptionCell);

        // Кнопки для редактирования и удаления
        let actionCell = document.createElement('td');
        let editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editButton.classList.add('edit-button', 'button');
        editButton.onclick = () => UpdateTrainingType(training_type);
        actionCell.appendChild(editButton);

        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteButton.classList.add('delete-button', 'button');
        deleteButton.onclick = () => DeleteTrainigType(training_type.id);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadTrainingTypes); 

function AddTrainingType() {
    let form = document.querySelector('.trainingTypeForm');

    if (form) {
        // Если форма уже существует, удаляем её
        form.remove();
    } else {
        // Если форма не существует, создаём и добавляем её
        form = document.createElement('div');
        form.classList.add('trainingTypeForm');
        form.innerHTML = `
            <h2>Добавить тренировку</h2>
            <div class="box">
                <input type="text" id="name" placeholder="Название тренировки" required>
                <textarea type="text" id="description" placeholder="Описание тренировки" required></textarea>
            </div>
            <button class="add-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.add-submit-button').addEventListener('click', () => {
            let name = document.getElementById('name').value;
            let description = document.getElementById('description').value;

            if (name && description) {
                let training_types = JSON.parse(localStorage.getItem('training_types')) || [];
                let id = crypto.randomUUID();

                let training_type = { id, name, description };

                training_types.push(training_type);
                localStorage.setItem('training_types', JSON.stringify(training_types));

                let requestData = {
                    platform: "website",
                    action: "add_training_type",
                    id: id,
                    name: name,
                    description: description,
                };

                sendRequest('POST', requestData);

                loadTrainingTypes();
                form.remove();
                alert('Тренировка успешно добавлена!');
                form.remove(); // Удаляем форму после успешного добавления
                
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });
    }
}

function UpdateTrainingType(trainingType) {
    let form = document.querySelector('.trainingTypeForm');

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('trainingTypeForm');
        form.innerHTML = `
            <h2>Изменить тренировку</h2>
            <div class="box">
                <input type="text" id="name" placeholder="Название тренировки" required>
                <textarea type="text" id="description" placeholder="Описание тренировки" required></textarea>
            </div>
            <button class="update-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Заполняем поля формы
        document.getElementById('name').value = trainingType.name;
        document.getElementById('description').value = trainingType.description;
    
        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.update-submit-button').addEventListener('click', () => {
            let name = document.getElementById('name').value;
            let description = document.getElementById('description').value;

            if (name && description) {
                trainingType.name = name;
                trainingType.description = description;

                let training_types = JSON.parse(localStorage.getItem('training_types')) || [];
                let index = training_types.findIndex(m => m.id === trainingType.id);
                training_types[index] = trainingType;

                localStorage.setItem('training_types', JSON.stringify(training_types));

                let requestData = {
                    platform: "website",
                    action: "update_training_type",
                    id: trainingType.id,
                    name: trainingType.name,
                    description: trainingType.description,
                };

                sendRequest('POST', requestData);

                loadTrainingTypes();
                form.remove();
                alert('Тренировка успешно изменена!');
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-training-type').addEventListener('click', AddTrainingType);
});

// Функция для отправки запросов на сервер с использованием Fetch API
function sendRequest(method, data) {
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
function DeleteTrainigType(id) {
    let training_types = JSON.parse(localStorage.getItem('training_types')) || [];
    training_type = training_types.filter(tt => tt.id !== id);
    localStorage.setItem('training_types', JSON.stringify(training_type));

    // Формируем JSON-объект для отправки запроса на удаление
    let requestData = {
        platform: "website",
        action: "delete_training_type",
        id: id
    };

    // Отправляем запрос на сервер для удаления
    sendRequest('POST', requestData);

    // Перезагружаем таблицу
    loadTrainingTypes();
}

