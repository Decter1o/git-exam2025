function loadVisitors() {
    let tableBody = document.querySelector('#visitorsTable tbody');
    tableBody.innerHTML = '';

    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['visitors', 'gym_memberships', 'visitors_memberships'], 'readonly');
        let visitorsStore = transaction.objectStore('visitors');
        let membershipsStore = transaction.objectStore('gym_memberships');
        let visitorMembershipsStore = transaction.objectStore('visitors_memberships');

        let visitorsRequest = visitorsStore.getAll();
        let membershipsRequest = membershipsStore.getAll();
        let visitorMembershipsRequest = visitorMembershipsStore.getAll();

        Promise.all([visitorsRequest, membershipsRequest, visitorMembershipsRequest].map(req => new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([visitors, memberships, visitor_memberships]) => {
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

                let visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor.id);
                let membership = visitor_membership ? memberships.find(m => m.id === visitor_membership.membershipId) : null;

                let visitor_membershipTypeCell = document.createElement('td');
                visitor_membershipTypeCell.textContent = membership ? membership.type : 'Нет абонемента';
                row.appendChild(visitor_membershipTypeCell);

                let membershipVisitsLeft = document.createElement('td');
                membershipVisitsLeft.textContent = visitor_membership ? visitor_membership.visitsLeft + ' занятий' : 'Нет абонемента';
                row.appendChild(membershipVisitsLeft);

                let statusCell = document.createElement('td');
                let editCircle = document.createElement('i');
                if (visitor.status == 1) {
                    editCircle.classList.add('fa-solid', 'fa-circle-check');
                    editCircle.style.color = 'green';
                } else {
                    editCircle.classList.add('fa-solid', 'fa-circle-xmark');
                    editCircle.style.color = 'red';
                }
                statusCell.appendChild(editCircle);
                row.appendChild(statusCell);

                let actionsCell = document.createElement('td');
                let editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editButton.classList.add('edit-button', 'button');
                editButton.addEventListener('click', () => UpdateUserForm(visitor));
                actionsCell.appendChild(editButton);

                let deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteButton.classList.add('delete-button', 'button');
                deleteButton.addEventListener('click', () => DeleteVisitor(visitor.id));
                actionsCell.appendChild(deleteButton);

                let blockButton = document.createElement('button');
                blockButton.innerHTML = '<i class="fa-solid fa-ban"></i>';
                blockButton.classList.add('block-button', 'button');
                blockButton.addEventListener('click', () => VisitorsAction(visitor.id));
                actionsCell.appendChild(blockButton);

                row.appendChild(actionsCell);
                tableBody.appendChild(row);
            });
        }).catch(error => {
            console.error('Ошибка при загрузке данных из IndexedDB:', error);
        });
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

document.addEventListener('DOMContentLoaded', loadVisitors);

function AddUserForm() {
    let form = document.querySelector('.visitor-form');

    if (form) {
        form.remove();
    } else {
        form = document.createElement('div');
        form.classList.add('visitor-form');
        form.innerHTML = `
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
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

        document.body.appendChild(form);

        form.querySelector('.close-button').addEventListener('click', () => form.remove());

        form.querySelector('.add-submit-button').addEventListener('click', () => {
            let dbRequest = indexedDB.open('FitnessFamyli', 1);

            dbRequest.onsuccess = function(event) {
                let db = event.target.result;
                let transaction = db.transaction(['visitors', 'visitors_memberships', 'gym_memberships'], 'readwrite');
                let visitorsStore = transaction.objectStore('visitors');
                let visitorMembershipsStore = transaction.objectStore('visitors_memberships');
                let membershipsStore = transaction.objectStore('gym_memberships');

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
                    membershipsStore.get(membershipId).onsuccess = function(event) {
                        let membership = event.target.result;
                        let visitsLeft = 0;

                        switch (membership.duration) {
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
                        visitorsStore.add(visitor);

                        let visitor_membership = { id: visitor_membership_id, visitorId: id, membershipId, visitsLeft };
                        visitorMembershipsStore.add(visitor_membership);

                        let requestData = {
                            platform: "website",
                            action: "add_visitor",
                            id: id,
                            name: name,
                            surname: surname,
                            phone_number: phone_number,
                            membershipId: membershipId,
                            visitor_membership_id: visitor_membership_id
                        };

                        sendRequest('POST', requestData);
                        form.remove();
                        loadVisitors();
                        alert('Посетитель сохранен');
                    };
                } else {
                    alert('Пожалуйста, заполните все поля!');
                }
            };

            dbRequest.onerror = function(event) {
                console.error('Ошибка при открытии базы данных:', event.target.error);
            };
        });
    }
}

function UpdateUserForm(visitor) {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['gym_memberships', 'visitors_memberships', 'visitors'], 'readonly');
        let membershipsStore = transaction.objectStore('gym_memberships');
        let visitorMembershipsStore = transaction.objectStore('visitors_memberships');
        let visitorsStore = transaction.objectStore('visitors');

        let visitorMembershipRequest = visitorMembershipsStore.getAll();
        let membershipsRequest = membershipsStore.getAll();

        Promise.all([visitorMembershipRequest, membershipsRequest].map(req => new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([visitor_memberships, memberships]) => {
            let visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor.id);
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
                    <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
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

                document.body.appendChild(form);

                form.querySelector('.close-button').addEventListener('click', () => form.remove());

                populateMembershipOptions().then(() => {
                    document.getElementById('membership').value = visitor_membership.membershipId || '';
                });
                

                form.querySelector('.update-submit-button').addEventListener('click', () => {
                    let name = document.getElementById('name').value.trim();
                    let phone_number = document.getElementById('phone').value.trim();
                    if (phone_number.startsWith('+')) {
                        phone_number = phone_number.slice(1);
                    }
                    let surname = document.getElementById('surname').value.trim();
                    let membershipId = document.getElementById('membership').value;

                    if (name && phone_number && surname && membershipId) {
                        let transaction = db.transaction(['visitors', 'visitors_memberships', 'gym_memberships'], 'readwrite');
                        let visitorsStore = transaction.objectStore('visitors');
                        let visitorMembershipsStore = transaction.objectStore('visitors_memberships');
                        let membershipsStore = transaction.objectStore('gym_memberships');

                        visitor.name = name;
                        visitor.phone_number = phone_number;
                        visitor.surname = surname;
                        visitor_membership.membershipId = membershipId;

                        membershipsStore.get(membershipId).onsuccess = function(event) {
                            let membership = event.target.result;
                            let visitsLeft = 0;

                            switch (membership.duration) {
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

                            visitorsStore.put(visitor);
                            visitorMembershipsStore.put(visitor_membership);

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

                            form.remove();
                            loadVisitors();
                            alert('Данные посетителя обновлены');
                        };
                    } else {
                        alert('Пожалуйста, заполните все поля!');
                    }
                });
            }
        }).catch(error => {
            console.error('Ошибка при загрузке данных из IndexedDB:', error);
        });
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

document.getElementById('add-user').addEventListener('click', AddUserForm);

function populateMembershipOptions() {
    return new Promise((resolve, reject) => {
        let dbRequest = indexedDB.open('FitnessFamyli', 1);

        dbRequest.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction('gym_memberships', 'readonly');
            let store = transaction.objectStore('gym_memberships');
            let getAllRequest = store.getAll();

            getAllRequest.onsuccess = function() {
                let memberships = getAllRequest.result;
                let membershipSelect = document.getElementById('membership');
                membershipSelect.innerHTML = '<option value="">Выберите абонемент</option>';

                memberships.forEach(membership => {
                    let option = document.createElement('option');
                    option.value = membership.id;
                    option.textContent = `${membership.type}, ${membership.duration}, ${membership.price}, ${membership.specialGroup}`;
                    membershipSelect.appendChild(option);
                });

                resolve();
            };

            getAllRequest.onerror = function(event) {
                console.error('Ошибка получения данных из IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        };

        dbRequest.onerror = function(event) {
            console.error('Ошибка при открытии базы данных:', event.target.error);
            reject(event.target.error);
        };
    });
}

function sendRequest(method, data) {
    fetch('/src/helpers/requestreader.php', {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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

function DeleteVisitor(visitorId) {
    if (!confirm('Вы уверены, что хотите удалить этого посетителя?')) {
        return;
    }

    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['visitors', 'visitors_memberships'], 'readwrite');
        let visitorsStore = transaction.objectStore('visitors');
        let membershipsStore = transaction.objectStore('visitors_memberships');

        visitorsStore.delete(visitorId);

        membershipsStore.getAll().onsuccess = function(event) {
            let items = event.target.result.filter(item => item.visitorId === visitorId);
            items.forEach(item => membershipsStore.delete(item.id));
        };

        transaction.oncomplete = function() {
            let requestData = {
                platform: "website",
                action: "delete_visitor",
                id: visitorId
            };
            sendRequest('POST', requestData);
            alert('Посетитель удален');
            loadVisitors();
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
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['visitors', 'gym_memberships', 'visitors_memberships'], 'readonly');
        let visitorsStore = transaction.objectStore('visitors');
        let membershipsStore = transaction.objectStore('gym_memberships');
        let visitorMembershipsStore = transaction.objectStore('visitors_memberships');

        let visitorsRequest = visitorsStore.getAll();
        let membershipsRequest = membershipsStore.getAll();
        let visitorMembershipsRequest = visitorMembershipsStore.getAll();

        Promise.all([visitorsRequest, membershipsRequest, visitorMembershipsRequest].map(req => new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([visitors, memberships, visitor_memberships]) => {
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
                        visitor.phone_number.includes(searchInput)
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

                    let visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor.id);
                    let membership = visitor_membership ? memberships.find(m => m.id === visitor_membership.membershipId) : null;

                    let visitor_membershipTypeCell = document.createElement('td');
                    visitor_membershipTypeCell.textContent = membership ? membership.type : 'Нет абонемента';
                    row.appendChild(visitor_membershipTypeCell);

                    let membershipVisitsLeft = document.createElement('td');
                    membershipVisitsLeft.textContent = visitor_membership ? visitor_membership.visitsLeft + ' занятий' : 'Нет абонемента';
                    row.appendChild(membershipVisitsLeft);

                    let statusCell = document.createElement('td');
                    let editCircle = document.createElement('i');
                    if (visitor.status == 1) {
                        editCircle.classList.add('fa-solid', 'fa-circle-check');
                        editCircle.style.color = 'green';
                    } else {
                        editCircle.classList.add('fa-solid', 'fa-circle-xmark');
                        editCircle.style.color = 'red';
                    }
                    statusCell.appendChild(editCircle);
                    row.appendChild(statusCell);

                    let actionsCell = document.createElement('td');
                    let editButton = document.createElement('button');
                    editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
                    editButton.classList.add('edit-button', 'button');
                    editButton.addEventListener('click', () => UpdateUserForm(visitor));
                    actionsCell.appendChild(editButton);

                    let deleteButton = document.createElement('button');
                    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    deleteButton.classList.add('delete-button', 'button');
                    deleteButton.addEventListener('click', () => DeleteVisitor(visitor.id));
                    actionsCell.appendChild(deleteButton);

                    let blockButton = document.createElement('button');
                    blockButton.innerHTML = '<i class="fa-solid fa-ban"></i>';
                    blockButton.classList.add('block-button', 'button');
                    blockButton.addEventListener('click', () => VisitorsAction(visitor.id));
                    actionsCell.appendChild(blockButton);

                    row.appendChild(actionsCell);
                    tableBody.appendChild(row);
                });
        }).catch(error => {
            console.error('Ошибка при загрузке данных из IndexedDB:', error);
        });
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

document.getElementById('search-button').addEventListener('click', SearchVisitor);

function VisitorsAction(visitorId) {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['visitors'], 'readwrite');
        let visitorsStore = transaction.objectStore('visitors');

        visitorsStore.get(visitorId).onsuccess = function(event) {
            let visitor = event.target.result;
            
            if(visitor.status == 1) {
                visitor.status = 0;
                visitorsStore.put(visitor);

                let requestData = {
                    platform: "website",
                    action: "block_visitor",
                    id: visitor.id,
                };
                sendRequest('POST', requestData);
            }else {
                visitor.status = 1;
                visitorsStore.put(visitor);
                let requestData = {
                    platform: "website",
                    action: "unblock_visitor",
                    id: visitor.id,
                };
                sendRequest('POST', requestData);
            }
            loadVisitors();
        };
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}