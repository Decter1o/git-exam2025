let currentSort = {
    column: null,
    direction: 'asc'
};

let isFilterActive = false;

function sortMemberships(memberships, column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    return memberships.sort((a, b) => {
        let valueA, valueB;

        switch(column) {
            case 'тип':
                valueA = a.type.toLowerCase();
                valueB = b.type.toLowerCase();
                break;
            case 'длительность':
                valueA = a.duration.toLowerCase();
                valueB = b.duration.toLowerCase();
                break;
            case 'цена':
                valueA = parseFloat(a.price);
                valueB = parseFloat(b.price);
                break;
            case 'группа':
                valueA = a.specialGroup.toLowerCase();
                valueB = b.specialGroup.toLowerCase();
                break;
            default:
                return 0;
        }

        if (currentSort.direction === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
}

function loadGymMemberships() {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);
    
    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction('gym_memberships', 'readonly');
        let store = transaction.objectStore('gym_memberships');
        let getAllRequest = store.getAll();

        getAllRequest.onsuccess = function() {
            let memberships = getAllRequest.result; 

            let tableBody = document.querySelector('#gymMembershipsTable tbody');
            tableBody.innerHTML = ''; // Очищаем таблицу перед обновлением

            memberships.forEach(membership => {
                if(membership.type != "нет абонемента"){
                    let row = document.createElement('tr');

                    let typeCell = document.createElement('td');
                    typeCell.textContent = membership.type;
                    row.appendChild(typeCell);

                    let durationCell = document.createElement('td');
                    durationCell.textContent = membership.duration;
                    row.appendChild(durationCell);

                    let priceCell = document.createElement('td');
                    priceCell.textContent = membership.price.replace(".00", " тг");
                    row.appendChild(priceCell);

                    let groupCell = document.createElement('td');
                    groupCell.textContent = membership.specialGroup;
                    row.appendChild(groupCell);

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
                }
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
document.addEventListener('DOMContentLoaded', () => {
    loadGymMemberships();

    // Добавляем обработчики для сортируемых столбцов
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.textContent.toLowerCase().split(' ')[0];
            let dbRequest = indexedDB.open('FitnessFamyli', 1);

            dbRequest.onsuccess = function(event) {
                let db = event.target.result;
                let transaction = db.transaction('gym_memberships', 'readonly');
                let store = transaction.objectStore('gym_memberships');
                
                store.getAll().onsuccess = function(event) {
                    let sortedMemberships = sortMemberships(event.target.result, column);
                    
                    // Обновляем таблицу с отсортированными данными
                    let tableBody = document.querySelector('#gymMembershipsTable tbody');
                    tableBody.innerHTML = '';
                    
                    sortedMemberships.forEach(membership => {
                        if(membership.type != "нет абонемента"){
                            let row = document.createElement('tr');
        
                            let typeCell = document.createElement('td');
                            typeCell.textContent = membership.type;
                            row.appendChild(typeCell);
        
                            let durationCell = document.createElement('td');
                            durationCell.textContent = membership.duration;
                            row.appendChild(durationCell);
        
                            let priceCell = document.createElement('td');
                            priceCell.textContent = membership.price.replace(".00", " тг");
                            row.appendChild(priceCell);
        
                            let groupCell = document.createElement('td');
                            groupCell.textContent = membership.specialGroup;
                            row.appendChild(groupCell);
        
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
                        }
                    });
                };
            };
        });
    });
});

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
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
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

        // Добавляем обработчик для кнопки "Закрыть"
        form.querySelector('.close-button').addEventListener('click', () => form.remove());

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.add-submit-button').addEventListener('click', () => {
            let type = document.getElementById('type').value;
            let duration = document.getElementById('duration').value;
            let price = document.getElementById('price').value;
            let specialGroup = document.getElementById('specialGroup').value;

            if (type && duration && price && specialGroup) {
                let id = crypto.randomUUID();
                let membership = { id, type, duration, price, specialGroup };

                let dbRequest = indexedDB.open('FitnessFamyli', 1);
    
                dbRequest.onsuccess = function(event) {
                    let db = event.target.result;
                    let transaction = db.transaction('gym_memberships', 'readwrite');
                    let store = transaction.objectStore('gym_memberships');

                    store.put(membership);
                    transaction.oncomplete = function() {
                        console.log('succes');
                    };
                    transaction.onerror = function(event) {
                        console.error('error', event.target.error);
                    };
                
                }
        
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
                new jBox('Notice', {
                    content: 'Абонемент добавлен',
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
                new jBox('Notice', {
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

function UpdateMembershipForm(membership) {
    let form = document.querySelector('.membershipForm');

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('membershipForm');
        form.innerHTML = `
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
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

        // Добавляем обработчик для кнопки "Закрыть"
        form.querySelector('.close-button').addEventListener('click', () => form.remove());

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

                
                let dbRequest = indexedDB.open('FitnessFamyli', 1);
    
                dbRequest.onsuccess = function(event) {
                    let db = event.target.result;
                    let transaction = db.transaction('gym_memberships', 'readwrite');
                    let store = transaction.objectStore('gym_memberships');

                    store.put(membership);
                    transaction.oncomplete = function() {
                        console.log('succes');
                    };
                    transaction.onerror = function(event) {
                        console.error('error', event.target.error);
                    };
                
                }

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
                new jBox('Notice', {
                    content: 'Абонемент обновлен',
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
                new jBox('Notice', {
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
    document.getElementById('add-membership').addEventListener('click', AddMembershipForm);
});

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

function DeleteMembership(id) {
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите удалить этого посетителя?',
        confirmButton: 'Удалить',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function () {
            let dbRequest = indexedDB.open('FitnessFamyli', 1);

            dbRequest.onsuccess = function(event) {
                let db = event.target.result;
                let transaction = db.transaction('gym_memberships', 'readwrite');
                let store = transaction.objectStore('gym_memberships');

                store.delete(id);
                transaction.oncomplete = function() {
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
                    new jBox('Notice', {
                        content: 'Абонемент удален',
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
                };
                transaction.onerror = function(event) {
                    console.error('Ошибка при удалении абонемента:', event.target.error);
                    new jBox('Notice', {
                        content: 'Ошибка при удалении абонемента',
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
                };
            };
        }
    }).open();
}

function AddFilterForm() {
    let form = document.querySelector('.filter-container');
    let filterButton = document.getElementById('filter-button');
    
    if (isFilterActive) {
        // Сброс фильтра
        loadGymMemberships();
        isFilterActive = false;
        filterButton.innerHTML = '<i class="fa-solid fa-filter"></i>';
        return;
    }

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('filter-container');
        form.innerHTML = `
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
            <h3 class="filter-title">Фильтрация</h3>
            <form id="filterForm" class="filter-form">
                <div class="filter-group">
                    <label for="type_filter">Тип:</label>
                    <select id="type_filter" class="filter-select">
                        <option value="">Все</option>
                        <option value="стандарт">Стандарт</option>
                        <option value="дневной">Дневной</option>
                        <option value="безлимит">Безлимит</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="duration_filter">Длительность:</label>
                    <select id="duration_filter" class="filter-select">
                        <option value="">Все</option>
                        <option value="1 месяц">1 месяц</option>
                        <option value="3 месяца">3 месяца</option>
                        <option value="6 месяцев">6 месяцев</option>
                        <option value="1 год">1 год</option>
                        <option value="разовый">Разовый</option>
                    </select>
                </div>
        
                <div class="filter-group">
                    <label for="price_filter_min">Цена от:</label>
                    <input type="number" id="price_filter_min" class="filter-input" placeholder="От">
                    <label for="price_filter_max">Цена до:</label>
                    <input type="number" id="price_filter_max" class="filter-input" placeholder="До">
                </div>
        
                <div class="filter-group">
                    <label for="group_filter">Группа:</label>
                    <select id="group_filter" class="filter-select">
                        <option value="">Все</option>
                        <option value="стандарт">Стандарт</option>
                        <option value="золотой возраст">Золотой возраст</option>
                    </select>
                </div>
        
                <button type="submit" class="filter-button">Применить фильтры</button>
            </form>
        `;

        // Вставляем форму в контейнер для фильтров (или в другое подходящее место)
        let filterContainer = document.querySelector('#filterContainer'); // Укажите правильный контейнер
        if (filterContainer) {
            filterContainer.appendChild(form);
        } else {
            document.body.appendChild(form); // Если контейнера нет, добавляем в body
        }

        // Добавляем обработчик для кнопки "Закрыть"
        form.querySelector('.close-button').addEventListener('click', () => form.remove());

        // Обработчик формы
        form.querySelector("#filterForm").addEventListener("submit", (e) => {
            e.preventDefault();

            let typeFilter = document.getElementById('type_filter').value;
            let durationFilter = document.getElementById('duration_filter').value;
            let priceMinFilter = parseFloat(document.getElementById('price_filter_min').value);
            let priceMaxFilter = parseFloat(document.getElementById('price_filter_max').value);
            let groupFilter = document.getElementById('group_filter').value;

            let dbRequest = indexedDB.open('FitnessFamyli', 1);
            
            dbRequest.onsuccess = function(event) {
                let db = event.target.result;
                let transaction = db.transaction('gym_memberships', 'readonly');
                let store = transaction.objectStore('gym_memberships');
                
                store.getAll().onsuccess = function(event) {
                    let memberships = event.target.result;
                    let hasActiveFilters = typeFilter || durationFilter || priceMinFilter || priceMaxFilter || groupFilter;
                    
                    if (hasActiveFilters) {
                        isFilterActive = true;
                        filterButton.innerHTML = '<i class="fa-solid fa-filter-circle-xmark"></i>';
                    }
                    
                    // Применяем фильтры
                    let filteredMemberships = memberships.filter(membership => {
                        let matchesType = !typeFilter || membership.type === typeFilter;
                        let matchesDuration = !durationFilter || membership.duration === durationFilter;
                        let matchesGroup = !groupFilter || membership.specialGroup === groupFilter;
                        let matchesPrice = (!isNaN(priceMinFilter) || isNaN(priceMinFilter)) &&
                                         (!isNaN(priceMaxFilter) || isNaN(priceMaxFilter)) &&
                                         (isNaN(priceMinFilter) || membership.price >= priceMinFilter) &&
                                         (isNaN(priceMaxFilter) || membership.price <= priceMaxFilter);
                        
                        return matchesType && matchesDuration && matchesGroup && matchesPrice;
                    });

                    // Обновляем таблицу с отфильтрованными данными
                    let tableBody = document.querySelector('#gymMembershipsTable tbody');
                    tableBody.innerHTML = '';
                    
                    filteredMemberships.forEach(membership => {
                        if(membership.type != "нет абонемента"){
                            let row = document.createElement('tr');
        
                            let typeCell = document.createElement('td');
                            typeCell.textContent = membership.type;
                            row.appendChild(typeCell);
        
                            let durationCell = document.createElement('td');
                            durationCell.textContent = membership.duration;
                            row.appendChild(durationCell);
        
                            let priceCell = document.createElement('td');
                            priceCell.textContent = membership.price.replace(".00", " тг");
                            row.appendChild(priceCell);
        
                            let groupCell = document.createElement('td');
                            groupCell.textContent = membership.specialGroup;
                            row.appendChild(groupCell);
        
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
                            form.remove();
                        }
                    });
                };
            };
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-button').addEventListener('click', AddFilterForm);
});