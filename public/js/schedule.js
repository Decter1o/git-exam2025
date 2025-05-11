let selected_day_of_week = "Понедельник";
let selected_room_name = "1";

document.querySelectorAll('.day').forEach(day => {
    day.addEventListener('click', function () {
        document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
        this.classList.add('active');
        switch (this.id) {
            case 'monday': selected_day_of_week = "Понедельник"; break;
            case 'tuesday': selected_day_of_week = "Вторник"; break;
            case 'wednesday': selected_day_of_week = "Среда"; break;
            case 'thursday': selected_day_of_week = "Четверг"; break;
            case 'friday': selected_day_of_week = "Пятница"; break;
            case 'saturday': selected_day_of_week = "Суббота"; break;
            case 'sunday': selected_day_of_week = "Воскресенье"; break;
        }
        loadSchedule(selected_day_of_week, selected_room_name);
    });
});

document.querySelectorAll('.room').forEach(room => {
    room.addEventListener('click', function () {
        document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
        selected_room_name = this.id;
        loadSchedule(selected_day_of_week, selected_room_name);
    });
});

function loadSchedule(selected_day_of_week, selected_room_name) {
    let tableBody = document.querySelector("#schedule-table tbody");
    tableBody.innerHTML = "";

    let dbRequest = indexedDB.open("FitnessFamyli", 1);
    dbRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction(['schedule', 'trainers', 'training_types'], 'readonly');
        let scheduleStore = transaction.objectStore('schedule');
        let trainersStore = transaction.objectStore('trainers');
        let training_types_store = transaction.objectStore('training_types');
        let schedule_request = scheduleStore.getAll();
        let trainers_request = trainersStore.getAll();
        let training_types_request = training_types_store.getAll();

        Promise.all([schedule_request, trainers_request, training_types_request].map(req => new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([schedules_data, trainers, training_types]) => {
            let schedules = schedules_data.filter(schedule =>
                schedule.day_of_week === selected_day_of_week &&
                schedule.room_name === selected_room_name
            );

            if (schedules.length === 0) {
                let row = document.createElement("tr");
                let cell = document.createElement("td");
                cell.colSpan = 6;
                cell.textContent = "Нет занятий на этот день";
                row.appendChild(cell);
                tableBody.appendChild(row);
                return;
            }

            schedules.sort((a, b) => {
                const getTimeInMinutes = (timeStr) => {
                    const [hours, minutes] = timeStr.split(':');
                    return parseInt(hours) * 60 + parseInt(minutes);
                };
                
                const startTimeA = getTimeInMinutes(a.start_time);
                const startTimeB = getTimeInMinutes(b.start_time);
                
                return startTimeA - startTimeB;
            });

            schedules.forEach(schedule => {
                let row = document.createElement("tr");

                let timeCell = document.createElement("td");
                timeCell.textContent = `${schedule.start_time.split(' ')[0].slice(0, 5)} - ${schedule.end_time.split(' ')[0].slice(0, 5)}`;
                row.appendChild(timeCell);

                let trainingTypeCell = document.createElement("td");
                trainingTypeCell.textContent = training_types.find(type => type.id === schedule.training_type_id)?.name || "—";
                row.appendChild(trainingTypeCell);

                let trainer = trainers.find(tr => tr.id === schedule.trainer);
                let trainerCell = document.createElement("td");
                trainerCell.textContent = trainer ? `${trainer.name} ${trainer.surname}` : "—";
                row.appendChild(trainerCell);

                let categoryCell = document.createElement("td");
                categoryCell.textContent = schedule.category;
                row.appendChild(categoryCell);

                let actionCell = document.createElement("td");
                let editButton = document.createElement("button");
                editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editButton.classList.add('edit-button', 'button');
                editButton.onclick = () => UpdateSchedule(schedule);
                actionCell.appendChild(editButton);

                let deleteButton = document.createElement("button");
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteButton.classList.add('delete-button', 'button');
                deleteButton.onclick = () => DeleteSchedule(schedule.id);
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        }).catch(error => {
            console.error('Ошибка при загрузке данных из IndexedDB:', error);
        });
    }

    dbRequest.onerror = function (event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(`#monday`)?.classList.add('active');
    document.querySelector(`.room`)?.classList.add('active');
    loadSchedule(selected_day_of_week, selected_room_name);
});

function AddSchedule(selected_day_of_week, selected_room_name) {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([ 'trainers', 'training_types'], 'readonly');
        let trainersStore = transaction.objectStore('trainers');
        let training_types_store = transaction.objectStore('training_types');
        let trainers_request = trainersStore.getAll();
        let training_types_request = training_types_store.getAll();

        Promise.all([trainers_request, training_types_request].map(req=> new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([trainers, training_types]) => {
            let form = document.querySelector('.schedule-form');
            if(form) {
                form.remove();
            }else{
                form = document.createElement('div');
                form.classList.add('schedule-form');
                form.innerHTML = `
                <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
                <h2>Добавить тренировку</h2>
                <div class="form-group">
                    <label for="training-time">Начало:</label>
                    <input type="time" id="training-start-time" required>
                    <label for="training-time">Конец:</label>
                    <input type="time" id="training-end-time" required>
                </div>
                <div class="form-group">
                    <label for="training-type">Тип тренировки:</label>
                    <select id="training-type" required>
                    </select>
                </div>
                <div class="form-group">
                    <label for="training-trainer">Тренер:</label>
                    <select id="training-trainer" required>
                    </select>
                </div>
                <div class="form-group">
                    <label for="training-category">Категория:</label>
                    <select id="training-category" required>
                        <option value="Взрослые">Взрослые</option>
                        <option value="Дети">Дети</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="add-submit-button submit-button">Сохранить</button>
                </div>`;

                document.body.appendChild(form);

                populateTrainingTypeOptions(training_types);

                document.getElementById('training-type').addEventListener('change', function(){
                    let selected_type = this.value;

                    document.getElementById('training-trainer').innerHTML = '<option value="">Выберите тренера</option>';
                    let filtered_trainers = trainers.filter(trainer => trainer.training_type_id === selected_type);
                    populateTrainerOptions(filtered_trainers);
                });

                form.querySelector('.close-button').addEventListener('click', () => 
                    form.remove());

                form.querySelector('.add-submit-button').addEventListener('click', () => {
                    let start_time = document.getElementById('training-start-time').value;
                    let end_time = document.getElementById('training-end-time').value;
                    let training_type_id = document.getElementById('training-type').value;
                    let trainer = document.getElementById('training-trainer').value;
                    let category = document.getElementById('training-category').value;

                    if (start_time && end_time && training_type_id && trainer && category) {
                        let id = crypto.randomUUID();
                        let schedule = {
                            id: id,
                            start_time: start_time,
                            end_time: end_time,
                            room_name: selected_room_name,
                            day_of_week: selected_day_of_week,
                            training_type_id: training_type_id,
                            trainer: trainer,
                            category: category
                        };
                        
                        let requestData = {
                            platform: "website",
                            action: "add_schedule",
                            id: id,
                            start_time: start_time,
                            end_time: end_time,
                            room_name: selected_room_name,
                            day_of_week: selected_day_of_week,
                            training_type_id: training_type_id,
                            trainer: trainer,
                            category: category
                        };
                        sendRequest("POST", requestData);

                        let dbRequest = indexedDB.open('FitnessFamyli', 1);
                        dbRequest.onsuccess = function(event) {
                            let db = event.target.result;
                            let transaction = db.transaction('schedule', 'readwrite');
                            let store = transaction.objectStore('schedule');
                            let addRequest = store.put(schedule);
                            form.remove();
                            loadSchedule(selected_day_of_week, selected_room_name);
                            let addNotification = new jBox('Notice', {
                                content: 'Занятие добавлено!',
                                color: '#ddd',
                                autoClose: 3000,
                                animation: 'fade',
                                offset: { x: -15, y: 20 },
                                position: { x: 'right', y: 'top' }
                            });
                        };
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
        });
    };
    dbRequest.onerror = function (event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-training').addEventListener('click', () => {
        AddSchedule(selected_day_of_week, selected_room_name);
    });
});


function UpdateSchedule(schedule) {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction([ 'trainers', 'training_types'], 'readonly');
        let trainersStore = transaction.objectStore('trainers');
        let training_types_store = transaction.objectStore('training_types');
        let trainers_request = trainersStore.getAll();
        let training_types_request = training_types_store.getAll();

        Promise.all([trainers_request, training_types_request].map(req=> new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([trainers, training_types]) => {
            let form = document.querySelector('.schedule-form');
            
            if(form) {
                form.remove();
            }

            form = document.createElement('div');
            form.classList.add('schedule-form');
            form.innerHTML = `
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
            <h2>Добавить тренировку</h2>
            <div class="form-group">
                <label for="training-time">Начало:</label>
                <input type="time" id="training-start-time" value="${schedule.start_time}"required>
                <label for="training-time">Конец:</label>
                <input type="time" id="training-end-time" value="${schedule.end_time}" required>
            </div>
            <div class="form-group">
                <label for="training-hall">Зал:</label>
                <select id="training-hall" required>
                    <option value="1">Зал 1</option>
                    <option value="2">Зал 2</option>
                    <option value="3">Зал 3</option>
                </select>
            </div>
            <div class="form-group">
                <label for="training-day">День недели</label>
                <select id="training-day" required>
                    <option value="Понедельник">Пн</option>
                    <option value="Вторник">Вт</option>
                    <option value="Среда">Ср</option>
                    <option value="Четверг">Чт</option>
                    <option value="Пятница">Пт</option>
                    <option value="Суббота">Сб</option>
                    <option value="Воскресенье">Вс</option>
                </select>
            </div>
            <div class="form-group">
                <label for="training-type">Тип тренировки:</label>
                <select id="training-type" required>
                </select>
            </div>
            <div class="form-group">
                <label for="training-trainer">Тренер:</label>
                <select id="training-trainer" required>
                </select>
            </div>
            <div class="form-group">
                <label for="training-category">Категория:</label>
                <select id="training-category" required>
                    <option value="Взрослые">Взрослые</option>
                    <option value="Дети">Дети</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="add-submit-button submit-button">Сохранить</button>
            </div>`;

            document.body.appendChild(form);

            form.querySelector('.close-button').addEventListener('click', () => 
                form.remove());
            document.getElementById('training-day').value = schedule.day_of_week;
            document.getElementById('training-hall').value = schedule.room_name;
            document.getElementById('training-category').value = schedule.category;


            populateTrainingTypeOptions(training_types);
            document.getElementById('training-type').value = schedule.training_type_id;

            let filtered = trainers.filter(trainer => trainer.training_type_id === schedule.training_type_id);
            populateTrainerOptions(filtered);
            document.getElementById('training-trainer').value = schedule.trainer;
            
            document.getElementById('training-type').addEventListener('change', function(){
                let selected_type = this.value;

                document.getElementById('training-trainer').innerHTML = '<option value="">Выберите тренера</option>';
                let filtered_trainers = trainers.filter(trainer => trainer.training_type_id === selected_type);
                populateTrainerOptions(filtered_trainers);
            });
            
            form.querySelector('.add-submit-button').addEventListener('click', () => {
                schedule.start_time = document.getElementById('training-start-time').value;
                schedule.end_time = document.getElementById('training-end-time').value;
                schedule.room_name = document.getElementById('training-hall').value;
                schedule.day_of_week = document.getElementById('training-day').value;
                schedule.training_type_id = document.getElementById('training-type').value;
                schedule.trainer = document.getElementById('training-trainer').value;
                schedule.category = document.getElementById('training-category').value;

                
                let requestData = {
                    platform: "website",
                    action: "update_schedule",
                    id: schedule.id,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    room_name: schedule.room_name,
                    day_of_week: schedule.day_of_week,
                    training_type_id: schedule.training_type_id,
                    trainer: schedule.trainer,
                    category: schedule.category
                };

                sendRequest("POST", requestData);

                let dbRequest = indexedDB.open('FitnessFamyli', 1);
                dbRequest.onsuccess = function(event) {
                    let db = event.target.result;
                    let transaction = db.transaction('schedule', 'readwrite');
                    let store = transaction.objectStore('schedule');
                    let addRequest = store.put(schedule);

                    addRequest.onsuccess = function() {
                        loadSchedule(selected_day_of_week, selected_room_name);
                        form.remove();
                        new jBox('Notice', {
                            content: 'Занятие обновлено!',
                            color: '#ddd',
                            autoClose: 3000,
                            animation: 'fade',
                            offset: { x: -15, y: 20 },
                            position: { x: 'right', y: 'top' }
                        });
                    };
                };
            });
        });
    };
    dbRequest.onerror = function (event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}
                    
function DeleteSchedule(id) {
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите удалить это занятие?',
        confirmButton: 'Удалить',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function () {
            let dbRequest = indexedDB.open('FitnessFamyli', 1);

            dbRequest.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction('schedule', 'readwrite');
                let store = transaction.objectStore('schedule');
                

                store.delete(id);

                transaction.oncomplete = function () {
                    let requestData = {
                        platform: "website",
                        action: "delete_schedule",
                        id: id
                    };
                    sendRequest('POST', requestData);

                    new jBox('Notice', {
                        content: 'Занятие удалено',
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

                    loadSchedule(selected_day_of_week, selected_room_name);
                };

                transaction.onerror = function (event) {
                    console.error('Ошибка при удалении:', event.target.error);
                    new jBox('Notice', {
                        content: 'Ошибка при удалении занятия',
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

            dbRequest.onerror = function (event) {
                console.error('Ошибка при открытии базы данных:', event.target.error);
            };
        }
    }).open();
}

function populateTrainingTypeOptions(training_types) {
    let trainingTypeSelect = document.getElementById('training-type');
    trainingTypeSelect.innerHTML = '<option value="">Выберите тип тренировок</option>';

    training_types.forEach(type => {
        let option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        trainingTypeSelect.appendChild(option);
    });
}

function populateTrainerOptions(trainers) {
        let trainerSelect = document.getElementById('training-trainer');

        trainers.forEach(trainer => {
            let option = document.createElement('option');
            option.value = trainer.id;
            option.textContent = trainer.name + ' ' + trainer.surname;
            trainerSelect.appendChild(option);
        });
}

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