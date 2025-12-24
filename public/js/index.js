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

