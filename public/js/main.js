document.getElementById('exit-button').addEventListener('click', function() {
    new jBox('Confirm', {
        title: 'Подтверждение',
        content: 'Вы уверены, что хотите выйти?',
        confirmButton: 'Выйти',
        cancelButton: 'Отмена',
        overlay: false,
        closeButton: false,
        confirm: function() {
            indexedDB.deleteDatabase('FitnessFamyli');
            window.location.href = '/index.html';
        },
    }).open();
});