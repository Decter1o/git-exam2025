function handleLogin(event) {
    event.preventDefault();

    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    
    let requestData = {
        platform: "website",
        action: "auth",
        username: username,
        password: password
    };


    fetch('/src/helpers/requestreader.php', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json();
        } else {
        throw new Error('Invalid content-type, expected application/json');
        }
    })
    .then(data => {
        if (data.success) {
            delete data.success;

            let dbRequest = indexedDB.open('FitnessFamyli', 1);

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

                    store.clear();

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
            document.getElementById('errorMessage').textContent = 'Invalid credentials';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    }

    document.getElementById('loginButton').addEventListener('click', handleLogin);

