// index.html
  // Функция для отправки данных формы на сервер
  function handleLogin(event) {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    // Получаем данные из формы
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    // Формируем JSON-объект
    let requestData = {
        platform: "website",
        action: "auth",
        username: username,
        password: password
    };

    // Отправляем данные на сервер
    fetch('/src/helpers/requestreader.php', { // Замените '/login' на реальный URL для проверки
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData) // Преобразуем объект в JSON
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json(); // Если ответ в формате JSON
        } else {
        throw new Error('Invalid content-type, expected application/json');
        }
    })
    .then(data => {
        if (data.success) {
            delete data.success;
            // IndexedDB example
            let dbRequest = indexedDB.open('FitnessFamyli', 1); // Увеличь версию, если уже создавал

            dbRequest.onupgradeneeded = function(event) {
                let db = event.target.result;
                Object.keys(data).forEach(key => {
                    if (!db.objectStoreNames.contains(key)) {
                        db.createObjectStore(key, { keyPath: 'id', autoIncrement: true });
                    }
                });
            };

            dbRequest.onsuccess = function(event) {
                let db = event.target.result;
                Object.keys(data).forEach(key => {
                    let transaction = db.transaction(key, 'readwrite');
                    let store = transaction.objectStore(key);

                    store.clear(); // очищаем перед добавлением

                    data[key].forEach(item => {
                        store.put(item);
                    });

                    transaction.oncomplete = function() {
                        console.log(`Data for "${key}" stored successfully.`);
                    };

                    transaction.onerror = function(event) {
                        console.error(`Error storing "${key}" in IndexedDB:`, event.target.error);
                    };
                });
            };

            dbRequest.onerror = function(event) {
                console.error('Error opening IndexedDB:', event.target.error);
            };

            window.location.href = '/public/pages/main.html';
        } else {
        // Если данные неверны, показываем сообщение об ошибке
            document.getElementById('errorMessage').textContent = 'Invalid credentials';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    }

    // Привязываем функцию к событию клика на кнопке
    document.getElementById('loginButton').addEventListener('click', handleLogin);

