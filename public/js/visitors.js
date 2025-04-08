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
    
            let visitor_membershipId = visitor.id;
            let visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor_membershipId);
            let membership = visitor_membership ? memberships.find(m => m.id === visitor_membership.membershipId) : null;
            let visitor_membershipTypeCell = document.createElement('td');
            visitor_membershipTypeCell.textContent = membership ? membership.type : 'Нет абонемента';
            row.appendChild(visitor_membershipTypeCell);
    
            let membershipVisitsLeft = document.createElement('td');
            membershipVisitsLeft.textContent = visitor_membership ? visitor_membership.
            visitsLeft + ' занятий' : 'Нет абонемента';            
            row.appendChild(membershipVisitsLeft);
            tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadVisitors);

function toggleVisitorForm() {
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
                            <option value="basic">Базовый</option>
                            <option value="premium">Премиум</option>
                        </select>
                    </div>
                </div>
            </div>
            <button class="submit-button">Сохранить</button>
        `;

        // Добавляем форму в тело страницы
        document.body.appendChild(form);

        // Добавляем обработчик для кнопки "Сохранить"
        form.querySelector('.submit-button').addEventListener('click', () => {
            let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
            let visitor_memberships = JSON.parse(localStorage.getItem('visitors_memberships')) || [];
            let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
            let id = crypto.randomUUID();
            let visitor_membership_id = crypto.randomUUID();
            let name = document.getElementById('name').value;
            let phone_number = document.getElementById('phone').value;
            let surname = document.getElementById('surname').value;
            let membership_id = document.getElementById('membership').value;
        
            if (name && phone_number && surname && membership_id) {
                let days_left = 0;
                let membership_duration = memberships.find(m => m.id === membership_id).duration;
                
                switch (membership_duration) {
                    case 'одноразовый':
                        days_left = 1;
                        break;
                    case '1 месяц':
                        days_left = 12;
                        break;
                    case '3 месяца':
                        days_left = 36;
                        break;
                    case '6 месяцев':
                        days_left = 72;
                        break;
                    case '1 год':
                        days_left = 144;
                        break;
                    default:
                        break;
                }
        
                let visitor = { id, name, surname, phone_number };
                
                let visitor_membership = { visitor_membership_id, id, membership_id, days_left };
                
                let requestData = {
                    platform: "website",
                    action: "add_visitor",
                    id: id,
                    name: name,
                    surname: surname,
                    phone_number: phone_number,
                    membership_id: membership_id,
                    visitor_membership_id: visitor_membership_id
                };
        
                visitors.push(visitor);
                visitor_memberships.push(visitor_membership);
        
                localStorage.setItem('visitors', JSON.stringify(visitors));
                localStorage.setItem('visitors_memberships', JSON.stringify(visitor_memberships));
        
                sendRequest('POST', '/add_visitor', requestData);
                alert(`Посетитель сохранен`);
                form.remove();
                document.getElementById('visitorTable').reset();
                loadVisitors();
            } else {
                alert('Пожалуйста, заполните все поля!');
            }
        });        
    }
}

document.getElementById('add-user').addEventListener('click', toggleVisitorForm);

function populateMembershipOptions() {
    // Получаем элемент <select> по его ID
    let membershipSelect = document.getElementById('membership');

    // Получаем данные из localStorage
    let memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];

    // Очищаем существующие опции
    membershipSelect.innerHTML = '<option value="">Выберите абонемент</option>';

    // Добавляем новые опции из localStorage
    memberships.forEach(membership => {
        let option = document.createElement('option');
        option.value = membership.id; // Устанавливаем значение (например, ID абонемента)
        option.textContent = membership.type + ', ' + membership.duration + ', ' + membership.price + ', ' + membership.specialGroup; // Устанавливаем текст (например, название абонемента)
        membershipSelect.appendChild(option); // Добавляем опцию в <select>
    });
}

// Вызываем функцию после загрузки формы
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-user').addEventListener('click', () => {
        populateMembershipOptions();
    });
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

