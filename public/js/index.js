// index.html
  // Функция для отправки данных формы на сервер
  function handleLogin(event) {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    // Получаем данные из формы
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Формируем JSON-объект
    const requestData = {
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
            localStorage.setItem('visitors', JSON.stringify(data.visitors));
            localStorage.setItem('gym_memberships', JSON.stringify(data.gym_memberships));
            localStorage.setItem('visitors_memberships', JSON.stringify(data.visitors_memberships));
            localStorage.setItem('training_types', JSON.stringify(data.training_types));
            localStorage.setItem('schedule', JSON.stringify(data.schedule));
            window.location.href = '/public/pages/main.html'; // Замените '/dashboard' на нужный URL
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

