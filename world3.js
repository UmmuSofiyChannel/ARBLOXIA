(function () {

    const openWorld3Button = document.getElementById('openWorld3Button');
    const world3Card = document.getElementById('world3Card');
    const world3Status = document.getElementById('world3Status');

    // Aktifkan visual World 3
    if (world3Card) {
        world3Card.classList.remove('locked');
        world3Card.classList.add('active');
    }

    // Tukar status
    if (world3Status) {
        world3Status.textContent = '🔓 FIDAAI Mission';
    }

    // Masuk ke FIDAAI
    if (openWorld3Button) {
        openWorld3Button.disabled = false;

        openWorld3Button.addEventListener('click', function () {
            window.location.href = 'FIDAII/index.html';
        });
    }

})();