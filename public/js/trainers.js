function loadTrainers() {
    let tableBody = document.querySelector("#trainersTable tbody");
    tableBody.innerHTML = "";
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['trainers', 'training_types'], 'readonly');
        let trainers_store = transaction.objectStore("trainers");
        let training_types_store = transaction.objectStore("training_types");
        let trainers_store_request = trainers_store.getAll();
        let training_types_store_request = training_types_store.getAll();

        Promise.all([trainers_store_request, training_types_store_request].map(req => new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([trainers, training_types]) => {
            trainers.forEach(trainer => {
                let row = document.createElement("tr");
                
                let nameCell = document.createElement("td");
                nameCell.textContent = trainer.name;
                row.appendChild(nameCell);

                let surnameCell = document.createElement("td");
                surnameCell.textContent = trainer.surname;
                row.appendChild(surnameCell);

                let trainingTypeCell = document.createElement("td");
                trainingTypeCell.textContent = training_types.find(type => type.id == trainer.training_type_id).name || 'Неизвестный тип';
                row.appendChild(trainingTypeCell);

                let phoneCell = document.createElement("td");
                phoneCell.textContent = '+' + trainer.phone_number;
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
                editButton.onclick = () => UpdateTrainer(trainer);
                actionCell.appendChild(editButton);

                let deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteButton.classList.add('delete-button', 'button');
                deleteButton.onclick = () => DeleteTrainer(trainer.id);
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        }).catch(error => {
            console.error('Ошибка при загрузке данных из IndexedDB:', error);
        });
    }
    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
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
                <div id="previewContainer"></div>
            </div>
        </div>
        <button class="add-submit-button submit-button">Сохранить</button>`;

        document.body.appendChild(form);
        document.getElementById("photo").addEventListener("change", function(event) {
            const previewContainer = document.getElementById("previewContainer");
            previewContainer.innerHTML = ""; // Очистить старые превью
        
            const files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imgElement = document.createElement("img");
                    imgElement.src = e.target.result;
                    imgElement.style.width = "100px"; // размер превью
                    imgElement.style.margin = "5px";
                    previewContainer.appendChild(imgElement);
                };
                
                reader.readAsDataURL(file);
            }
        });

        // Загружаем типы тренировок после добавления формы
        populateTrainingTypeOptions()
            .catch(error => console.error('Ошибка при загрузке типов тренировок:', error));

        form.querySelector('.close-button').addEventListener('click', () =>  form.remove());
        
        form.querySelector('.add-submit-button').addEventListener('click', () => {

            let name = form.querySelector('#name').value;
            let surname = form.querySelector('#surname').value;
            let phone_number = form.querySelector('#phone').value;
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
            let training_type_id = form.querySelector('#training-type').value;
            let instagram = form.querySelector('#Instagram').value;
            let telegram = form.querySelector('#Telegram').value;
            let whatsapp = form.querySelector('#Whatsapp').value;
            let description = form.querySelector('#description').value;
            let photo = form.querySelector('#photo').files;
            let base64Images = [];
        
            if (name && surname && phone_number && training_type_id) {
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
                                phone_number: phone_number,
                                training_type_id: training_type_id,
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
                                phone_number: phone_number,
                                training_type_id: training_type_id,
                                instagram: instagram,
                                telegram: telegram,
                                whatsapp: whatsapp,
                                description: description,
                                images: base64Images
                            };
        
                            sendRequest('POST', requestData);
        
                            let dbRequest = indexedDB.open("FitnessFamyli", 1);

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
                        phone_number: phone_number,
                        training_type_id: training_type_id,
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
                        phone_number: phone_number,
                        training_type_id: training_type_id,
                        instagram: instagram,
                        telegram: telegram,
                        whatsapp: whatsapp,
                        description: description,
                        images: base64Images
                    };

                    sendRequest('POST', requestData);

                    let dbRequest = indexedDB.open("FitnessFamyli", 1);

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

function UpdateTrainer(trainer) {
    let dbRequest = indexedDB.open('FitnessFamyli', 1);

    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction(['trainers', 'training_types'], 'readonly');
        let trainers_store = transaction.objectStore("trainers");
        let training_types_store = transaction.objectStore("training_types");
        let trainers_store_request = trainers_store.getAll();
        let training_types_store_request = training_types_store.getAll();

        Promise.all([trainers_store_request, training_types_store_request].map(req => new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        }))).then(([trainers, training_types]) => {
            let form = document.querySelector('.trainer-form');

            if (form) {
                form.remove();
            }

            form = document.createElement('div');
            form.classList.add('trainer-form');
            form.innerHTML = `
                <button class="close-button"><i class="fa-solid fa-xmark"></i></button>
                <h2>Тренер</h2>
                <div class="container-box">
                    <div class="container">
                        <div class="box">
                            <p>Имя:</p>
                            <input type="text" id="name" value="${trainer.name}" placeholder="Введите имя">
                        </div>
                        <div class="box">
                            <p>Телефон:</p>
                            <input type="text" id="phone" value="+${trainer.phone_number}" placeholder="Введите телефон">
                        </div>
                        <div class="box">
                            <p>Telegram</p>
                            <input type="text" id="Telegram" value="${trainer.tg}" placeholder="Ссылка на Telegram...">
                        </div>
                        <div class="box">
                            <p>Instagram</p>
                            <input type="text" id="Instagram" value="${trainer.inst}" placeholder="Ссылка на Instagram...">
                        </div>
                        <div class="box">
                            <p>Whatsapp</p>
                            <input type="text" id="Whatsapp" value="${trainer.whatsapp}" placeholder="Ссылка на Whatsapp...">
                        </div>
                    </div>
                    <div class="container">
                        <div class="box">
                            <p>Фамилия:</p>
                            <input type="text" id="surname" value="${trainer.surname}" placeholder="Введите фамилию">
                        </div>
                        <div class="box">
                            <p>Тип тренировок:</p>
                            <select id="training-type" required>
                                <option value="">Выберите тип тренировок</option>
                            </select>
                        </div>
                        <div class="box">
                            <p>Описание:</p>
                            <textarea id="description" placeholder="Введите описание">${trainer.description}</textarea>
                        </div>
                    </div>
                </div>
                <div class="photo-container">
                    <div class="box">
                        <p>Фото:</p>
                        <input type="file" id="photo" accept="image/*" multiple/>
                        <div id="previewContainer"></div>
                    </div>
                </div>
                <button class="update-submit-button submit-button">Сохранить</button>`;

            document.body.appendChild(form);

            document.getElementById("photo").addEventListener("change", function(event) {
                const previewContainer = document.getElementById("previewContainer");
                previewContainer.innerHTML = ""; // Очистить старые превью
            
                const files = event.target.files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imgElement = document.createElement("img");
                        imgElement.src = e.target.result;
                        imgElement.style.width = "100px"; // размер превью
                        imgElement.style.margin = "5px";
                        previewContainer.appendChild(imgElement);
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
            
            form.querySelector('.close-button').addEventListener('click', () => form.remove());

            populateTrainingTypeOptions().then(() => {
                document.getElementById('training-type').value = trainer.training_type_id || '';
            });

            form.querySelector('.update-submit-button').addEventListener('click', () => {
                let name = form.querySelector('#name').value;
                let surname = form.querySelector('#surname').value;
                let phone_number = form.querySelector('#phone').value;
                if (phone_number.startsWith('+')) {
                    phone_number = phone_number.slice(1);
                }
                if (phone_number.length > 11) {
                    new jBox('Notice', {
                        content: 'Неверный номер телефона!',
                        color: 'red',
                        autoClose: 3000,
                        animation: 'fade',
                        offset: { x: -15, y: 20 },
                        position: { x: 'right', y: 'top' }
                    });
                    return;
                }

                let training_type_id = form.querySelector('#training-type').value;
                let instagram = form.querySelector('#Instagram').value;
                let telegram = form.querySelector('#Telegram').value;
                let whatsapp = form.querySelector('#Whatsapp').value;
                let description = form.querySelector('#description').value;
                let photo = form.querySelector('#photo').files;

                if (name && surname && phone_number && training_type_id) {
                    let fileArray = Array.from(photo);
                    let filesPromises = fileArray.map(file => readFileBase64(file));

                    Promise.all(filesPromises).then(base64Array => {
                        let base64Images = base64Array;

                        let id = trainer.id;
                        let trainerData = {
                            id,
                            name,
                            surname,
                            phone_number,
                            training_type_id: training_type_id,
                            inst: instagram,
                            tg: telegram,
                            whatsapp,
                            description
                        };

                        let requestData = {
                            platform: "website",
                            action: "update_trainer",
                            id: id,
                            name: name,
                            surname: surname,
                            phone_number: phone_number,
                            training_type_id: training_type_id,
                            instagram: instagram,
                            telegram: telegram,
                            whatsapp: whatsapp,
                            description: description,
                            images: base64Images
                        };

                        sendRequest('POST', requestData);

                        let updateTx = db.transaction("trainers", "readwrite");
                        let store = updateTx.objectStore("trainers");
                        store.put(trainerData);

                        updateTx.oncomplete = () => console.log('Тренер обновлён в IndexedDB');
                        updateTx.onerror = (event) => console.error('Ошибка при обновлении:', event.target.error);

                        form.remove();
                        loadTrainers();

                        new jBox('Notice', {
                            content: 'Тренер обновлен!',
                            color: '#ddd',
                            autoClose: 3000,
                            animation: 'fade',
                            offset: { x: -15, y: 20 },
                            position: { x: 'right', y: 'top' }
                        });
                    });
                } else {
                    new jBox('Notice', {
                        content: 'Пожалуйста, заполните все обязательные поля!',
                        color: '#ddd',
                        autoClose: 3000,
                        animation: 'fade',
                        offset: { x: -15, y: 20 },
                        position: { x: 'right', y: 'top' }
                    });
                }
            });
        });
    };

    dbRequest.onerror = function(event) {
        console.error('Ошибка при открытии базы данных:', event.target.error);
    };
}

function DeleteTrainer(id){
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите удалить этого посетителя?',
        confirmButton: 'Удалить',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function () {
            let dbRequest = indexedDB.open('FitnessFamyli', 1);

            dbRequest.onsuccess = function (event) {
                let db = event.target.result;
                let transaction = db.transaction('trainers', 'readwrite');
                let store = transaction.objectStore('trainers');
                

                store.delete(id);

                transaction.oncomplete = function () {
                    let requestData = {
                        platform: "website",
                        action: "delete_trainer",
                        id: id
                    };
                    sendRequest('POST', requestData);

                    new jBox('Notice', {
                        content: 'Тренер удален',
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

                    loadTrainers();
                };

                transaction.onerror = function (event) {
                    console.error('Ошибка при удалении:', event.target.error);
                    new jBox('Notice', {
                        content: 'Ошибка при удалении Тренер',
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

