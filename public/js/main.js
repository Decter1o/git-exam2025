document.getElementById('exit-button').addEventListener('click', function() {
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите выйти?',
        confirmButton: 'Выйти',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function() {
            sendRequest('POST', { 
                platfortm: 'website',
                action: 'logout'
            });
            indexedDB.deleteDatabase('FitnessFamyli');
            window.location.href = '/index.html';
        },
    }).open();
});

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