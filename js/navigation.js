let sectionCallbacks = {};

export function initNavigation() {
    document.querySelectorAll('[data-section]').forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

export function showSection(sectionId) {
    document.querySelectorAll('section').forEach(sec => {
        sec.style.display = (sec.id === sectionId) ? 'block' : 'none';
    });

    if (typeof sectionCallbacks[sectionId] === 'function') {
        sectionCallbacks[sectionId]();
    }
}

export function registerSectionUpdateCallback(sectionId, callback) {
    sectionCallbacks[sectionId] = callback;
}