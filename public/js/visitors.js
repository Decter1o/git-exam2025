function loadVisitors() {
    let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    let visitor_memberships = JSON.parse(localStorage.getItem('visitors_memberships')) || [];
    let tableBody = document.querySelector('#visitorsTable tbody');
    tableBody.innerHTML = '';

    visitors.forEach(visitor => {
        let row = document.createElement('tr');
            
            let nameCell = document.createElement('td');
            nameCell.textContent = visitor.name;
            row.appendChild(nameCell);
    
            let surnameCell = document.createElement('td');
            surnameCell.textContent = visitor.surname;
            row.appendChild(surnameCell);
            
            let phoneCell = document.createElement('td');
            phoneCell.textContent = '+' + visitor.phone_number;
            row.appendChild(phoneCell);
    
            let visitor_Id = visitor.id;
            let visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor_Id);
            let membership = visitor_membership ? memberships.find(m => m.id === visitor_membership.membershipId) : null;
            let visitor_membershipTypeCell = document.createElement('td');
            visitor_membershipTypeCell.textContent = membership ? membership.type : 'Нет абонемента';
            row.appendChild(visitor_membershipTypeCell);
    
            let membershipVisitsLeft = document.createElement('td');
            membershipVisitsLeft.textContent = visitor_membership ? visitor_membership.
            visitsLeft + ' занятий' : 'Нет абонемента';            
            row.appendChild(membershipVisitsLeft);

            // Добавляем ячейку для кнопки "Редактировать"
            let actionsCell = document.createElement('td');
            let editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
            editButton.classList.add('edit-button', 'button'); // Добавляем общий класс 'button'
            editButton.addEventListener('click', () => UpdateUserForm(visitor)); // Передаем данные посетителя
            actionsCell.appendChild(editButton);

            // Добавляем кнопку "Удалить"
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteButton.classList.add('delete-button', 'button'); // Добавляем общий класс 'button'
            deleteButton.addEventListener('click', () => deleteVisitor(visitor.id)); // Передаем ID посетителя
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);
            tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadVisitors);

function AddUserForm() {
    // Проверяем, существует ли форма на странице
    let form = document.querySelector('.visitor-form');

    if (form) {
        // Если форма уже существует, удаляем ее
        form.remove();
    } else {
        // Если форма не существует, создаем и добавляем ее
        form = document.createElement('div');
        form.classList.add('visitor-form');
        form.innerHTML = `
            <h2>Посетитель</h2>
            <div class="container-box">
                <div class="container">
                    <div class="box">
                        <p>Имя:</p>
                        <input type="text" id="name" placeholder="Введите имя">
                    </div>
                    <div class="box">
                        <p>Телефон:</p>
                        <input type="text" id="phone" placeholder="Введите телефон">
                    </div>
                </div>
                <div class="container">
                    <div class="box">
                        <p>Фамилия:</p>
                        <input type="text" id="surname" placeholder="Введите фамилию">
                    </div>
                    <div class="box">
                        <p>Абонемент:</p>
                        <select id="membership" required>
                            <option value="">Выберите абонемент</option>
                        </select>
                    </div>
                </div>
            </div>
            <button class="add-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.add-submit-button').addEventListener('click', () => {
            let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
            let visitor_memberships = JSON.parse(localStorage.getItem('visitors_memberships')) || [];
            let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
            let id = crypto.randomUUID();
            let visitor_membership_id = crypto.randomUUID();
            let name = document.getElementById('name').value;
            let phone_number = document.getElementById('phone').value;
            if (phone_number.startsWith('+')) {
                phone_number = phone_number.slice(1);
            }
            let surname = document.getElementById('surname').value;
            let membershipId = document.getElementById('membership').value;
        
            if (name && phone_number && surname && membershipId) {
                let visitsLeft = 0;
                let membership_duration = memberships.find(m => m.id === membershipId).duration;
                
                switch (membership_duration) {
                    case 'одноразовый':
                        visitsLeft = 1;
                        break;
                    case '1 месяц':
                        visitsLeft = 12;
                        break;
                    case '3 месяца':
                        visitsLeft = 36;
                        break;
                    case '6 месяцев':
                        visitsLeft = 72;
                        break;
                    case '1 год':
                        visitsLeft = 144;
                        break;
                    default:
                        break;
                }
        
                let visitor = { id, name, surname, phone_number };
                visitors.push(visitor);
                localStorage.setItem('visitors', JSON.stringify(visitors));
                
                let visitorId = id;
                id = crypto.randomUUID();
                let visitor_membership = {id, visitorId, membershipId, visitsLeft };
                
                let requestData = {
                    platform: "website",
                    action: "add_visitor",
                    id: visitorId,
                    name: name,
                    surname: surname,
                    phone_number: phone_number,
                    membershipId: membershipId,
                    visitor_membership_id: visitor_membership_id
                };
        
                visitor_memberships.push(visitor_membership);
        
                localStorage.setItem('visitors_memberships', JSON.stringify(visitor_memberships));
        
                sendRequest('POST', requestData);
                form.remove();
                loadVisitors();
                alert(`Посетитель сохранен`);
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });        
    }
}

function UpdateUserForm(visitor) {
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    let visitors_memberships = JSON.parse(localStorage.getItem('visitors_memberships')) || [];
    let visitor_membership = visitors_memberships.find(vm => vm.visitorId === visitor.id);
    let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    // Проверяем, существует ли visitor_membership
    if (!visitor_membership) {
        alert('Абонемент для данного посетителя не найден!');
        return;
    }

    let form = document.querySelector('.visitor-form');

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('visitor-form');
        form.innerHTML = `
            <h2>Редактировать посетителя</h2>
            <div class="container-box">
                <div class="container">
                    <div class="box">
                        <p>Имя:</p>
                        <input type="text" id="name" value="${visitor.name}" placeholder="Введите имя">
                    </div>
                    <div class="box">
                        <p>Телефон:</p>
                        <input type="text" id="phone" value="+${visitor.phone_number}" placeholder="Введите телефон">
                    </div>
                </div>
                <div class="container">
                    <div class="box">
                        <p>Фамилия:</p>
                        <input type="text" id="surname" value="${visitor.surname}" placeholder="Введите фамилию">
                    </div>
                    <div class="box">
                        <p>Абонемент:</p>
                        <select id="membership" required>
                            <option value="">Выберите абонемент</option>
                        </select>
                    </div>
                </div>
            </div>
            <button class="update-submit-button submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Заполняем список абонементов
        populateMembershipOptions();
        document.getElementById('membership').value = visitor_membership.membershipId || '';

        // Обработчик для кнопки "Сохранить"
        form.querySelector('.update-submit-button').addEventListener('click', () => {
            let name = document.getElementById('name').value.trim();
            let phone_number = document.getElementById('phone').value.trim();
            if (phone_number.startsWith('+')) {
                phone_number = phone_number.slice(1);
            }
            let surname = document.getElementById('surname').value.trim();
            let membershipId = document.getElementById('membership').value;

            if (name && phone_number && surname && membershipId) {
                // Обновляем данные посетителя
                visitor.name = name;
                visitor.phone_number = phone_number;
                visitor.surname = surname;
                visitor_membership.membershipId = membershipId;

                let visitsLeft = 0;
                let membership_duration = memberships.find(m => m.id === membershipId).duration;
                switch (membership_duration) {
                    case 'одноразовый':
                        visitsLeft = 1;
                        break;
                    case '1 месяц':
                        visitsLeft = 12;
                        break;
                    case '3 месяца':
                        visitsLeft = 36;
                        break;
                    case '6 месяцев':
                        visitsLeft = 72;
                        break;
                    case '1 год':
                        visitsLeft = 144;
                        break;
                    default:
                        break;
                }

                
                visitor_membership.visitsLeft = visitsLeft;
                

                let requestData = {
                    platform: "website",
                    action: "update_visitor",
                    id: visitor.id,
                    name: visitor.name,
                    surname: visitor.surname,
                    phone_number: visitor.phone_number,
                    membershipId: visitor_membership.membershipId,
                    visitor_membership_id: visitor_membership.id
                };
                sendRequest('POST', requestData);



                // Сохраняем изменения в массив visitors
                let updatedVisitors = visitors.map(v => v.id === visitor.id ? visitor : v);
                localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
                // Сохраняем изменения в массив visitors_memberships
                localStorage.setItem('visitors_memberships', JSON.stringify(visitors_memberships));

                form.remove();
                loadVisitors();
                alert('Данные посетителя обновлены');
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });
    }
}

document.getElementById('add-user').addEventListener('click', AddUserForm);

function populateMembershipOptions() {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);
    
    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction('gym_memberships', 'readonly');
        let store = transaction.objectStore('gym_memberships');
        let getAllRequest = store.getAll();

        getAllRequest.onsuccess = function() {
            let memberships = getAllRequest.result; 
            
            // Получаем элемент <select> по его ID
            let membershipSelect = document.getElementById('membership');
            // Очищаем существующие опции
            membershipSelect.innerHTML = '<option value="">Выберите абонемент</option>';
        
            // Добавляем новые опции из localStorage
            memberships.forEach(membership => {
                let option = document.createElement('option');
                option.value = membership.id; // Устанавливаем значение (например, ID абонемента)
                option.textContent = membership.type + ', ' + membership.duration + ', ' + membership.price + ', ' + membership.specialGroup; // Устанавливаем текст (например, название абонемента)
                membershipSelect.appendChild(option); // Добавляем опцию в <select>
            });
        };

        getAllRequest.onerror = function(event) {
            console.error('Ошибка получения данных из IndexedDB:', event.target.error);
        };
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

// Вызываем функцию после загрузки формы
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-user').addEventListener('click', () => {
        populateMembershipOptions();
    });
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

function deleteVisitor(visitorId) {
    if (!confirm('Вы уверены, что хотите удалить этого посетителя?')) {
        return;
    }

    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['visitors', 'visitors_memberships'], 'readwrite');
        let visitorsStore = transaction.objectStore('visitors');
        let membershipsStore = transaction.objectStore('visitors_memberships');

        // Удаление из stores
        visitorsStore.delete(visitorId);

        // Для удаления записи из visitors_memberships по visitorId, нужно пройтись по записям
        let index = membershipsStore.index('visitorId'); // Убедись, что индекс visitorId существует
        let request = index.getAllKeys(visitorId);

        request.onsuccess = function() {
            let keys = request.result;
            keys.forEach(key => {
                membershipsStore.delete(key);
            });
        };

        transaction.oncomplete = function() {
            let requestData = {
                platform: "website",
                action: "delete_visitor",
                id: visitorId
            };
            sendRequest('POST', requestData);
            alert('Посетитель удален');
            loadVisitors(); // Перезагружаем таблицу
        };

        transaction.onerror = function(event) {
            console.error('Ошибка при удалении:', event.target.error);
            alert('Ошибка при удалении посетителя');
        };
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}


function SearchVisitor() {
    let searchInput = document.getElementById('search-input').value.toLowerCase();
    let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    let visitor_memberships = JSON.parse(localStorage.getItem('visitors_memberships')) || [];
    let tableBody = document.querySelector('#visitorsTable tbody');
    tableBody.innerHTML = '';

    visitors
        .filter(visitor => {
            if (searchInput.startsWith('+')) {
                searchInput = searchInput.slice(1);
            }
            return (
                visitor.name.toLowerCase().includes(searchInput) ||
                visitor.surname.toLowerCase().includes(searchInput) ||
                visitor.phone_number.includes(searchInput) // Убираем toLowerCase, так как phone_number числовой
            );
        })
        .forEach(visitor => {
            let row = document.createElement('tr');
            
            let nameCell = document.createElement('td');
            nameCell.textContent = visitor.name;
            row.appendChild(nameCell);

            let surnameCell = document.createElement('td');
            surnameCell.textContent = visitor.surname;
            row.appendChild(surnameCell);

            let phoneCell = document.createElement('td');
            phoneCell.textContent = '+' + visitor.phone_number;
            row.appendChild(phoneCell);

            let visitor_Id = visitor.id;
            let visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor_Id);
            let membership = visitor_membership ? memberships.find(m => m.id === visitor_membership.membershipId) : null;

            let visitor_membershipTypeCell = document.createElement('td');
            visitor_membershipTypeCell.textContent = membership ? membership.type : 'Нет абонемента';
            row.appendChild(visitor_membershipTypeCell);

            let membershipVisitsLeft = document.createElement('td');
            membershipVisitsLeft.textContent = visitor_membership ? visitor_membership.visitsLeft + ' занятий' : 'Нет абонемента';
            row.appendChild(membershipVisitsLeft);

            let actionsCell = document.createElement('td');
            let editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
            editButton.classList.add('edit-button', 'button');
            editButton.addEventListener('click', () => UpdateUserForm(visitor));
            actionsCell.appendChild(editButton);

            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteButton.classList.add('delete-button', 'button');
            deleteButton.addEventListener('click', () => deleteVisitor(visitor.id));
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
}

document.getElementById('search-button').addEventListener('click', SearchVisitor);
