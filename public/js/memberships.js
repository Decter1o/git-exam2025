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
        editButton.textContent = 'Редактировать';
        editButton.onclick = () => editMembership(membership.id);
        actionCell.appendChild(editButton);

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.onclick = () => deleteMembership(membership.id);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Добавляем или изменяем абонемент
document.getElementById('membershipForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let id = document.getElementById('membershipId')?.value || crypto.randomUUID();
    let type = document.getElementById('type').value;
    let duration = document.getElementById('duration').value;
    let price = document.getElementById('price').value;
    let specialGroup = document.getElementById('specialGroup').value;

    let membership = { id, type, duration, price, specialGroup };

    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    let existingMembershipIndex = memberships.findIndex(m => m.id === id);

    // Формируем JSON-объект для отправки запроса
    let requestData = {
        platform: "website",
        action: existingMembershipIndex >= 0 ? "update_membership" : "add_membership",
        membership_type: type,
        duration: duration,
        price: price,
        id: id,
        special_group: specialGroup
    };

    // Определяем, нужно ли обновить или добавить абонемент
    if (existingMembershipIndex >= 0) {
        // Обновляем существующий абонемент
        memberships[existingMembershipIndex] = membership;
        sendRequest('POST', `/update_membership/${id}`, requestData);
    } else {
        // Добавляем новый абонемент
        memberships.push(membership);
        sendRequest('POST', '/add_membership', requestData);
    }

    // Сохраняем в localStorage
    localStorage.setItem('gym_memberships', JSON.stringify(memberships));

    // Очищаем форму и перезагружаем таблицу
    document.getElementById('membershipForm').reset();
    loadGymMemberships();
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
function deleteMembership(id) {
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
    sendRequest('POST', `/delete_membership/${id}`, requestData);

    // Перезагружаем таблицу
    loadGymMemberships();
}

// Редактирование абонемента
function editMembership(id) {
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    let membership = memberships.find(m => m.id === id);
    if (membership) {
        document.getElementById('type').value = membership.type;
        document.getElementById('duration').value = membership.duration;
        document.getElementById('price').value = membership.price;
        document.getElementById('specialGroup').value = membership.specialGroup;

        // Добавляем скрытое поле с id для определения редактируемого абонемента
        let membershipIdField = document.getElementById('membershipId');
        if (!membershipIdField) {
            membershipIdField = document.createElement('input');
            membershipIdField.type = 'hidden';
            membershipIdField.id = 'membershipId';
            document.getElementById('membershipForm').appendChild(membershipIdField);
        }
        membershipIdField.value = membership.id;
    }
}

// Инициализация таблицы при загрузке страницы
document.addEventListener('DOMContentLoaded', loadGymMemberships);