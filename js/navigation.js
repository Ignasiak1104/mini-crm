let sectionCallbacks = {};

export function initNavigation() {
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Zapobiega domyślnej akcji linku (np. przejścia do #)
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

export function showSection(sectionId) {
    let sectionFound = false;
    // Ukryj wszystkie sekcje w głównym kontenerze treści
    document.querySelectorAll('main#mainContent section.content-section').forEach(sec => {
        if (sec.id === sectionId) {
            sec.style.display = 'block';
            sectionFound = true;
        } else {
            sec.style.display = 'none';
        }
    });

    if (!sectionFound) {
        console.error(`showSection: Nie znaleziono sekcji o ID: "${sectionId}"`);
    }

    // Wywołaj callback, jeśli jest zarejestrowany dla tej sekcji
    if (typeof sectionCallbacks[sectionId] === 'function') {
        try {
            sectionCallbacks[sectionId]();
        } catch (e) {
            console.error(`Błąd podczas wywoływania callback dla sekcji ${sectionId}:`, e);
        }
    }
}

export function registerSectionUpdateCallback(sectionId, callback) {
    sectionCallbacks[sectionId] = callback;
}
