// Загружаем абонементы из localStorage
function loadGymMemberships() {
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    let tableBody = document.querySelector('#gymMembershipsTable tbody');
    tableBody.innerHTML = ''; // Очищаем таблицу перед обновлением

    memberships.forEach(membership => {
        let row = document.createElement('tr');

        let typeCell = document.createElement('td');
        typeCell.textContent = membership.type;
        row.appendChild(typeCell);

        let durationCell = document.createElement('td');
        durationCell.textContent = membership.duration;
        row.appendChild(durationCell);

        let priceCell = document.createElement('td');
        priceCell.textContent = membership.price;
        row.appendChild(priceCell);

        let groupCell = document.createElement('td');
        groupCell.textContent = membership.specialGroup;
        row.appendChild(groupCell);

        // Кнопки для редактирования и удаления
        let actionCell = document.createElement('td');
        let editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editButton.classList.add('edit-button', 'button');
        editButton.onclick = () => UpdateMembershipForm(membership);
        actionCell.appendChild(editButton);

        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteButton.classList.add('delete-button', 'button');
        deleteButton.onclick = () => DeleteMembership(membership.id);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Инициализация таблицы при загрузке страницы
document.addEventListener('DOMContentLoaded', loadGymMemberships);

function AddMembershipForm() {
    let form = document.querySelector('.membershipForm');

    if (form) {
        // Если форма уже существует, удаляем её
        form.remove();
    } else {
        // Если форма не существует, создаём и добавляем её
        form = document.createElement('div');
        form.classList.add('membershipForm');
        form.innerHTML = `
            <h2>Добавить абонемент</h2>
            <div class="box">
                <select id="type" required>
                    <option value="">Тип абонемента</option>
                    <option value="дневной">Дневной</option>
                    <option value="стандарт">Стандарт</option>
                    <option value="безлимит">Безлимит</option>
                </select>
                <select id="duration" required>
                    <option value="">Длительность</option>
                    <option value="разовый">Разовый</option>
                    <option value="1 месяц">1 месяц</option>
                    <option value="3 месяца">3 месяца</option>
                    <option value="6 месяцев">6 месяцев</option>
                    <option value="1 год">1 год</option>
                </select>
                <input type="number" id="price" placeholder="Цена" required>
                <select id="specialGroup" required>
                    <option value="">Группа</option>
                    <option value="стандарт">Стандарт</option>
                    <option value="золотой возраст">Золотой возраст</option>
                </select>
            </div>
            <button class="add-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.add-submit-button').addEventListener('click', () => {
            let type = document.getElementById('type').value;
            let duration = document.getElementById('duration').value;
            let price = document.getElementById('price').value;
            let specialGroup = document.getElementById('specialGroup').value;

            if (type && duration && price && specialGroup) {
                let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
                let id = crypto.randomUUID();

                let membership = { id, type, duration, price, specialGroup };

                memberships.push(membership);
                localStorage.setItem('gym_memberships', JSON.stringify(memberships));

                let requestData = {
                    platform: "website",
                    action: "add_membership",
                    membership_type: type,
                    duration: duration,
                    price: price,
                    id: id,
                    special_group: specialGroup
                };

                sendRequest('POST', requestData);

                loadGymMemberships();
                form.remove();
                alert('Абонемент успешно добавлен!');
                form.remove(); // Удаляем форму после успешного добавления
                
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });
    }
}

function UpdateMembershipForm(membership) {
    let form = document.querySelector('.membershipForm');

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('membershipForm');
        form.innerHTML = `
            <h2>Редактировать абонемент</h2>
            <div class="box">
                <select id="type" required>
                    <option value="">Тип абонемента</option>
                    <option value="дневной">Дневной</option>
                    <option value="стандарт">Стандарт</option>
                    <option value="безлимит">Безлимит</option>
                </select>
                <select id="duration" required>
                    <option value="">Длительность</option>
                    <option value="разовый">Разовый</option>
                    <option value="1 месяц">1 месяц</option>
                    <option value="3 месяца">3 месяца</option>
                    <option value="6 месяцев">6 месяцев</option>
                    <option value="1 год">1 год</option>
                </select>
                <input type="number" id="price" placeholder="Цена" required>
                <select id="specialGroup" required>
                    <option value="">Группа</option>
                    <option value="стандарт">Стандарт</option>
                    <option value="золотой возраст">Золотой возраст</option>
                </select>
            </div>
            <button class="update-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Заполняем поля формы
        document.getElementById('type').value = membership.type;
        document.getElementById('duration').value = membership.duration;
        document.getElementById('price').value = membership.price;
        document.getElementById('specialGroup').value = membership.specialGroup;

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.update-submit-button').addEventListener('click', () => {
            let type = document.getElementById('type').value;
            let duration = document.getElementById('duration').value;
            let price = document.getElementById('price').value;
            let specialGroup = document.getElementById('specialGroup').value;

            if (type && duration && price && specialGroup) {
                membership.type = type;
                membership.duration = duration;
                membership.price = price;
                membership.specialGroup = specialGroup;

                let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
                let index = memberships.findIndex(m => m.id === membership.id);
                memberships[index] = membership;

                localStorage.setItem('gym_memberships', JSON.stringify(memberships));

                let requestData = {
                    platform: "website",
                    action: "update_membership",
                    membership_type: type,
                    duration: duration,
                    price: price,
                    id: membership.id,
                    special_group: specialGroup
                };

                sendRequest('POST', requestData);

                loadGymMemberships();
                form.remove();
                alert('Абонемент успешно обновлён!');
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-membership').addEventListener('click', AddMembershipForm);
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
function DeleteMembership(id) {
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    memberships = memberships.filter(m => m.id !== id);
    localStorage.setItem('gym_memberships', JSON.stringify(memberships));

    // Формируем JSON-объект для отправки запроса на удаление
    let requestData = {
        platform: "website",
        action: "delete_membership",
        id: id
    };

    // Отправляем запрос на сервер для удаления
    sendRequest('POST', requestData);

    // Перезагружаем таблицу
    loadGymMemberships();
}