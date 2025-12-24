// Загружаем тренировки с сервера
function loadTrainingTypes() {
    let requestData = {
        platform: "website",
        action: "get_training_types"
    };

    fetch('/src/helpers/requestreader.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(training_types => {
        let tableBody = document.querySelector('#trainingTypesTable tbody');
        tableBody.innerHTML = ''; // Очищаем таблицу перед обновлением

        if (Array.isArray(training_types)) {
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
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
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
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
            <h2>Добавить тренировку</h2>
            <div class="box">
                <input type="text" id="name" placeholder="Название тренировки" required>
                <textarea type="text" id="description" placeholder="Описание тренировки" required></textarea>
            </div>
            <button class="add-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Добавляем обработчик для кнопки "Закрыть"
        form.querySelector('.close-button').addEventListener('click', () => form.remove());

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.add-submit-button').addEventListener('click', () => {
            let name = document.getElementById('name').value;
            let description = document.getElementById('description').value;

            if (name && description) {
                let id = crypto.randomUUID();

                let requestData = {
                    platform: "website",
                    action: "add_training_type",
                    id: id,
                    name: name,
                    description: description,
                };

                sendRequest('POST', requestData);

                loadTrainingTypes();
                let addNotification = new jBox('Notice', {
                    content: 'Тренировка добавлена!',
                    color: '#ddd',
                    autoClose: 3000,
                    animation: 'fade',
                    offset: { x: -15, y: 20 },
                    position: {
                        x: 'right', 
                        y: 'top'
                    }
                });
                form.remove(); // Удаляем форму после успешного добавления
                
            } else {
                let emptyFieldError = new jBox('Notice', {
                    content: 'Пожалуйста, заполните все поля!',
                    color: '#ddd',
                    autoClose: 3000,
                    animation: 'fade',
                    offset: { x: -15, y: 20 },
                    position: {
                        x: 'right',
                        y: 'top'    
                    }
                });
            }
        });
    }
}

function UpdateTrainingType(training_type) {
    let form = document.querySelector('.trainingTypeForm');

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('trainingTypeForm');
        form.innerHTML = `
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
            <h2>Изменить тренировку</h2>
            <div class="box">
                <input type="text" id="name" placeholder="Название тренировки" required>
                <textarea type="text" id="description" placeholder="Описание тренировки" required></textarea>
            </div>
            <button class="update-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Добавляем обработчик для кнопки "Закрыть"
        form.querySelector('.close-button').addEventListener('click', () => form.remove());

        // Заполняем поля формы
        document.getElementById('name').value = training_type.name;
        document.getElementById('description').value = training_type.description;
    
        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.update-submit-button').addEventListener('click', () => {
            let name = document.getElementById('name').value;
            let description = document.getElementById('description').value;

            if (name && description) {
                let requestData = {
                    platform: "website",
                    action: "update_training_type",
                    id: training_type.id,
                    name: name,
                    description: description,
                };

                sendRequest('POST', requestData);

                loadTrainingTypes();
                form.remove();
                let addNotification = new jBox('Notice', {
                    content: 'Тренировка обновлена!',
                    color: '#ddd',
                    autoClose: 3000,
                    animation: 'fade',
                    offset: { x: -15, y: 20 },
                    position: {
                        x: 'right', 
                        y: 'top'
                    }
                });
            } else {
                let emptyFieldError = new jBox('Notice', {
                    content: 'Пожалуйста, заполните все поля!',
                    color: '#ddd',
                    autoClose: 3000,
                    animation: 'fade',
                    offset: { x: -15, y: 20 },
                    position: {
                        x: 'right',
                        y: 'top'    
                    }
                });
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
        credentials: 'include',
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

// Удаление тренировки
function DeleteTrainigType(id) {
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите удалить эту тренировку?',
        confirmButton: 'Удалить',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function () {
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
            new jBox('Notice', {
                content: 'Тренировка удалена!',
                color: '#ddd',
                autoClose: 3000,
                delayOnHover: false,
                animation: 'fade',
                offset: { x: -15, y: 20 },
                position: {
                    x: 'right',
                    y: 'top'
                }
            });
        }
    }).open();
}

