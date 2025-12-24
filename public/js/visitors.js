function loadVisitors() {
    let tableBody = document.querySelector('#visitorsTable tbody');
    tableBody.innerHTML = '';

    let requestData = {
        platform: "website",
        action: "get_visitors"
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
    .then(data => {
        if (data && Array.isArray(data)) {
            data.forEach(visitor => {
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

                let visitor_membershipTypeCell = document.createElement('td');
                visitor_membershipTypeCell.textContent = visitor.membership_type || 'Нет абонемента';
                row.appendChild(visitor_membershipTypeCell);

                let membershipVisitsLeft = document.createElement('td');
                membershipVisitsLeft.textContent = visitor.visits_left ? visitor.visits_left + ' занятий' : 'Нет абонемента';
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
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
    });
}

document.addEventListener('DOMContentLoaded', loadVisitors);

function AddUserForm() {
    let requestData = {
        platform: "website",
        action: "get_memberships"
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
    .then(memberships => {
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

            populateMembershipOptions(memberships);

            form.querySelector('.add-submit-button').addEventListener('click', () => {
                let id = crypto.randomUUID();
                let visitor_membership_id = crypto.randomUUID();
                let name = document.getElementById('name').value;
                let phone_number = document.getElementById('phone').value;
                if (phone_number.startsWith('+')) {
                    phone_number = phone_number.slice(1);
                    if(phone_number.length > 11){
                        new jBox('Notice', {
                            content: 'Неверный номер телефона!',
                            color: 'red',
                            autoClose: 3000,
                            animation: 'fade',
                            offset: { x: -15, y: 20 },
                            position: {
                                x: 'right',
                                y: 'top'    
                            }
                        });
                        return;
                    }
                }
                let surname = document.getElementById('surname').value;
                let membershipId = document.getElementById('membership').value;

                if (name && phone_number && surname && membershipId) {
                    let requestData = {
                        platform: "website",
                        action: "add_visitor",
                        id: id,
                        name: name,
                        surname: surname,
                        phone_number: phone_number,
                        membership_id: membershipId,
                        visitor_membership_id: visitor_membership_id
                    };

                    sendRequest('POST', requestData);
                    form.remove();
                    loadVisitors();
                    new jBox('Notice', {
                        content: 'Посетитель добавлен',
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
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
    });
}

function UpdateUserForm(visitor) {
    let requestData = {
        platform: "website",
        action: "get_memberships"
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
    .then(memberships => {
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

            populateMembershipOptions(memberships);
            if (visitor.membership_id) {
                document.getElementById('membership').value = visitor.membership_id || '';
            }

            form.querySelector('.update-submit-button').addEventListener('click', () => {
                let name = document.getElementById('name').value.trim();
                let phone_number = document.getElementById('phone').value.trim();
                if (phone_number.startsWith('+')) {
                    phone_number = phone_number.slice(1);
                    if(phone_number.length > 11){
                        new jBox('Notice', {
                            content: 'Неверный номер телефона!',
                            color: 'red',
                            autoClose: 3000,
                            animation: 'fade',
                            offset: { x: -15, y: 20 },
                            position: {
                                x: 'right',
                                y: 'top'    
                            }
                        });
                        return;
                    }
                }
                let surname = document.getElementById('surname').value.trim();
                let membershipId = document.getElementById('membership').value;

                if (name && phone_number && surname && membershipId) {
                    let requestData = {
                        platform: "website",
                        action: "update_visitor",
                        id: visitor.id,
                        name: name,
                        surname: surname,
                        phone_number: phone_number,
                        membership_id: membershipId,
                        visitor_membership_id: visitor.visitor_membership_id
                    };

                    sendRequest('POST', requestData);

                    form.remove();
                    loadVisitors();
                    new jBox('Notice', {
                        content: 'Посетитель обновлен',
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
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
    });
}

function populateMembershipOptions(memberships) {
    let membershipSelect = document.getElementById('membership');
    membershipSelect.innerHTML = '<option value="">Выберите абонемент</option>';

    memberships.forEach(membership => {
        let option = document.createElement('option');
        option.value = membership.id;
        option.textContent = `${membership.type}, ${membership.duration}, ${membership.price.replace(".00", " тг")}, ${membership.specialGroup}`;
        membershipSelect.appendChild(option);
    });
}

function sendRequest(method, data) {
    fetch('/src/helpers/requestreader.php', {
        method: method,
        credentials: 'include',
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
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите удалить этого посетителя?',
        confirmButton: 'Удалить',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function () {
            let requestData = {
                platform: "website",
                action: "delete_visitor",
                id: visitorId
            };
            sendRequest('POST', requestData);

            new jBox('Notice', {
                content: 'Посетитель удален',
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

            loadVisitors();
        }
    }).open();
}


function SearchVisitor() {
    let searchInput = document.getElementById('search-input').value.toLowerCase();
    let requestData = {
        platform: "website",
        action: "get_visitors"
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
    .then(data => {
        let tableBody = document.querySelector('#visitorsTable tbody');
        tableBody.innerHTML = '';

        if (data && Array.isArray(data)) {
            data
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

                    let visitor_membershipTypeCell = document.createElement('td');
                    visitor_membershipTypeCell.textContent = visitor.membership_type || 'Нет абонемента';
                    row.appendChild(visitor_membershipTypeCell);

                    let membershipVisitsLeft = document.createElement('td');
                    membershipVisitsLeft.textContent = visitor.visits_left ? visitor.visits_left + ' занятий' : 'Нет абонемента';
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
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', SearchVisitor);
    }
    document.getElementById('add-user').addEventListener('click', AddUserForm);
});

function VisitorsAction(visitorId) {
    // Получаем текущего посетителя для определения его статуса
    let requestData = {
        platform: "website",
        action: "get_visitors"
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
    .then(visitors => {
        let visitor = visitors.find(v => v.id === visitorId);
        if (!visitor) return;

        if(visitor.status == 1) {
            let blockData = {
                platform: "website",
                action: "block_visitor",
                id: visitor.id,
            };
            sendRequest('POST', blockData);

            new jBox('Notice', {
                content: 'Посетитель заблокирован',
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
            let unblockData = {
                platform: "website",
                action: "unblock_visitor",
                id: visitor.id,
            };
            sendRequest('POST', unblockData);

            new jBox('Notice', {
                content: 'Посетитель разблокирован',
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
        loadVisitors();
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
    });
}