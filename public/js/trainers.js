function loadTrainers() {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction("trainers", "readonly");
        let store = transaction.objectStore("trainers");
        let getAllRequest = store.getAll();

        getAllRequest.onsuccess = function(event) {
            let trainers = getAllRequest.result;
            let tableBody = document.querySelector("#trainersTable tbody");
            tableBody.innerHTML = "";

            trainers.forEach(function(trainer) {
                let row = document.createElement("tr");
                
                let nameCell = document.createElement("td");
                nameCell.textContent = trainer.name;
                row.appendChild(nameCell);

                let surnameCell = document.createElement("td");
                surnameCell.textContent = trainer.surname;
                row.appendChild(surnameCell);

                let trainingTypeCell = document.createElement("td");
                trainingTypeCell.textContent = trainer.trainingType;
                row.appendChild(trainingTypeCell);

                let phoneCell = document.createElement("td");
                phoneCell.textContent = trainer.phone_number;
                row.appendChild(phoneCell);

                let socialMediaCell = document.createElement("td");
                socialMediaCell.innerHTML = `<i class="fa-brands fa-instagram"></i> ${trainer.inst}<br><i class="fa-brands fa-telegram"></i> ${trainer.tg}<br><i class="fa-brands fa-whatsapp"></i> ${trainer.whatsapp}`;
                row.appendChild(socialMediaCell);

                let descriptionCell = document.createElement("td");
                descriptionCell.textContent = trainer.description;
                row.appendChild(descriptionCell);

                // Кнопки для редактирования и удаления
                let actionCell = document.createElement('td');
                let editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editButton.classList.add('edit-button', 'button');
                // editButton.onclick = () => ;
                actionCell.appendChild(editButton);

                let deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteButton.classList.add('delete-button', 'button');
                //deleteButton.onclick = () => ;
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", loadTrainers);

function populateTrainingTypeOptions() {
    return new Promise((resolve, reject) => {
        let dbRequest = indexedDB.open('FitnessFamyli', 1);

        dbRequest.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction('training_types', 'readonly');
            let store = transaction.objectStore('training_types');
            let getAllRequest = store.getAll();

            getAllRequest.onsuccess = function() {
                let types = getAllRequest.result;
                let trainingTypeSelect = document.getElementById('training-type');
                trainingTypeSelect.innerHTML = '<option value="">Выберите тип тренировок</option>';

                types.forEach(type => {
                    let option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.name;
                    trainingTypeSelect.appendChild(option);
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

function AddTrainer() {
    let form = document.querySelector('.trainer-form');

    if(form){
        form.remove();
    }else{
        form  = document.createElement('div');
        form.classList.add('trainer-form');
        form.innerHTML = `
            <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
        <h2>Тренер</h2>
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
                <div class="box">
                    <p>Telegram</p>
                    <input type="text" id="Telegram" placeholder="Ссылка на Telegram...">
                </div>

                <div class="box">
                    <p>Instagram</p>
                    <input type="text" id="Instagram" placeholder="Ссылка на Instagram...">
                </div>
                <div class="box">
                    <p>Whatsapp</p>
                    <input type="text" id="Whatsapp" placeholder="Ссылка на Whatsapp...">
                </div>
            </div>
            <div class="container">
                <div class="box">
                    <p>Фамилия:</p>
                    <input type="text" id="surname" placeholder="Введите фамилию">
                </div>
                <div class="box">
                    <p>Тип тренировок:</p>
                    <select id="training-type" required>
                        <option value="">Выберите тип тренировок</option>
                    </select>
                </div>
                <div class="box">
                    <p>Описание:</p>
                    <textarea id="description" placeholder="Введите описание"></textarea>
                </div>
            </div>
        </div>
        <div class="photo-container">
            <div class="box">
                <p>Фото:</p>
                <input type="file" id="photo" accept="image/*" multiple/>
            </div>
        </div>
        <button class="add-submit-button submit-button">Сохранить</button>`;

        document.body.appendChild(form);

        // Загружаем типы тренировок после добавления формы
        populateTrainingTypeOptions()
            .catch(error => console.error('Ошибка при загрузке типов тренировок:', error));

        form.querySelector('.close-button').addEventListener('click', () =>  form.remove());
        
        form.querySelector('.add-submit-button').addEventListener('click', () => {

            let name = form.querySelector('#name').value;
            let surname = form.querySelector('#surname').value;
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
            let trainingType = form.querySelector('#training-type').value;
            let instagram = form.querySelector('#Instagram').value;
            let telegram = form.querySelector('#Telegram').value;
            let whatsapp = form.querySelector('#Whatsapp').value;
            let description = form.querySelector('#description').value;
            let photo = form.querySelector('#photo').files;
            let base64Images = [];
        
            if (name && surname && phone && trainingType) {
                if (photo.length > 0) {
                    let fileArray = Array.from(photo);
                    let filesPromises = fileArray.map(file => readFileBase64(file));
        
                    Promise.all(filesPromises)
                        .then(base64Array => {
                            base64Images = base64Array; // Сохраняем массив изображений
        
                            let id = crypto.randomUUID();
                            let trainer = {
                                id: id,
                                name: name,
                                surname: surname,
                                phone: phone,
                                trainingType: trainingType,
                                instagram: instagram,
                                telegram: telegram,
                                whatsapp: whatsapp,
                                description: description
                            };

                            let requestData = {
                                platform: "website",
                                action: "add_trainer",
                                id: id,
                                name: name,
                                surname: surname,
                                phone: phone,
                                trainingType: trainingType,
                                instagram: instagram,
                                telegram: telegram,
                                whatsapp: whatsapp,
                                description: description,
                                images: base64Images
                            };
        
                            sendRequest('POST', requestData);
        
                            let dbRequest = indexedDB.open("myDatabase", 1);

                            dbRequest.onsuccess = function(event) {
                                let db = event.target.result;
                                let transaction = db.transaction("trainers", "readwrite");
                                let store = transaction.objectStore("trainers");
                                store.put(trainer);

                                transaction.oncomplete = function() {
                                    console.log('succes');
                                };
                                transaction.onerror = function(event) {
                                    console.error('error', event.target.error);
                                };
                            }

                            form.remove();
                            let addNotification = new jBox('Notice', {
                                content: 'Тренер добавлен!',
                                color: '#ddd',
                                autoClose: 3000,
                                animation: 'fade',
                                offset: { x: -15, y: 20 },
                                position: { x: 'right', y: 'top' }
                            });
                            loadTrainers();
                        })
                        .catch(error => console.error('Ошибка при чтении файлов:', error));
                } else {
                    // Если фото не выбраны, можно всё равно отправлять без изображений
                    let id = crypto.randomUUID();
                    let trainer = {
                        id: id,
                        name: name,
                        surname: surname,
                        phone: phone,
                        trainingType: trainingType,
                        instagram: instagram,
                        telegram: telegram,
                        whatsapp: whatsapp,
                        description: description
                    };
                    
                    let requestData = {
                        platform: "website",
                        action: "add_trainer",
                        id: id,
                        name: name,
                        surname: surname,
                        phone: phone,
                        trainingType: trainingType,
                        instagram: instagram,
                        telegram: telegram,
                        whatsapp: whatsapp,
                        description: description,
                        images: base64Images
                    };

                    sendRequest('POST', requestData);

                    let dbRequest = indexedDB.open("myDatabase", 1);

                    dbRequest.onsuccess = function(event) {
                        let db = event.target.result;
                        let transaction = db.transaction("trainers", "readwrite");
                        let store = transaction.objectStore("trainers");
                        store.put(trainer);

                        transaction.oncomplete = function() {
                            console.log('succes');
                        };
                        transaction.onerror = function(event) {
                            console.error('error', event.target.error);
                        };
                    }
        
                    form.remove();
                    let addNotification = new jBox('Notice', {
                        content: 'Тренер добавлен!',
                        color: '#ddd',
                        autoClose: 3000,
                        animation: 'fade',
                        offset: { x: -15, y: 20 },
                        position: { x: 'right', y: 'top' }
                    });
                    loadTrainers();
                }
            } else {
                let emptyFieldError = new jBox('Notice', {
                    content: 'Пожалуйста, заполните все поля!',
                    color: '#ddd',
                    autoClose: 3000,
                    animation: 'fade',
                    offset: { x: -15, y: 20 },
                    position: { x: 'right', y: 'top' }
                });
            }
        });        
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-trainer').addEventListener('click', AddTrainer);
});

function readFileBase64(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

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

