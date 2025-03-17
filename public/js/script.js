// Функция для отправки данных формы на сервер
function handleLogin(event) {
  event.preventDefault(); // Останавливаем стандартное поведение формы

  // Получаем данные из формы
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Отправляем данные на сервер
  fetch('https://localhost/src/helpers/requestreader.php', { // Замените '/login' на реальный URL для проверки
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Если авторизация успешна, перенаправляем на другую страницу
      window.location.href = 'https://localhost/pages/main.html'; // Замените '/dashboard' на нужный URL
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
