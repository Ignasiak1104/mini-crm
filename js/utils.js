// js/utils.js
export function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        // Komunikat o braku kontenera jest już w main.js, więc tutaj możemy być cicho
        // lub dodać dodatkowy log, jeśli jest to potrzebne do debugowania utils.js
        console.warn("utils.js: Alert container not found! Alerts will not be shown.");
        return;
    }

    const alertDiv = document.createElement('div');
    // Użyj klas zdefiniowanych w style.css
    alertDiv.className = `custom-alert alert-${type}`; // np. custom-alert alert-success
    alertDiv.textContent = message;

    alertContainer.appendChild(alertDiv);

    // Pokaż alert (trigger animacji)
    // Krótkie opóźnienie, aby przeglądarka zdążyła zastosować style początkowe przed animacją
    requestAnimationFrame(() => {
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);
    });


    setTimeout(() => {
        alertDiv.classList.remove('show');
        // Poczekaj na zakończenie animacji ukrywania przed usunięciem elementu
        alertDiv.addEventListener('transitionend', () => {
            alertDiv.remove();
        }, { once: true }); // Upewnij się, że listener zostanie wywołany tylko raz
         // Fallback gdyby transitionend nie zadziałało (np. brak animacji)
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 500); // Czas musi być dłuższy niż transition duration

    }, duration);
}
