// js/main.js
// import * as DOM from './domElements.js'; // Możemy mniej polegać na tym, jeśli pobieramy elementy bezpośrednio
import { showAlert } from './utils.js'; // Upewnij się, że utils.js istnieje
import { initModals } from './modals.js';
import { initNavigation, showSection, registerSectionUpdateCallback } from './navigation.js';

import { initSettingsModule } from './settings.js';
import { initContactsModule, renderContactsApp, getContactsData } from './contacts.js';
import { initCompaniesModule, renderCompaniesApp, getCompaniesData } from './companies.js';
import { initTransactionsModule, renderTransactionsApp, getDealsData, refreshTransactionModuleProcessSelects } from './transactions.js';
import { initTasksModule, renderTasks, getTasksData } from './tasks.js';

export async function updateDashboardData() {
    try {
        // Używamy funkcji pobierających dane bezpośrednio z modułów
        const contacts = await getContactsData();
        const companies = await getCompaniesData();
        const deals = await getDealsData();

        const totalContactsEl = document.getElementById('dashboardTotalContacts');
        const totalCompaniesEl = document.getElementById('dashboardTotalCompanies');
        const totalTransactionsEl = document.getElementById('dashboardTotalTransactions');

        if (totalContactsEl) totalContactsEl.textContent = (contacts && contacts.length !== undefined) ? contacts.length.toString() : '0';
        if (totalCompaniesEl) totalCompaniesEl.textContent = (companies && companies.length !== undefined) ? companies.length.toString() : '0';
        if (totalTransactionsEl) totalTransactionsEl.textContent = (deals && deals.length !== undefined) ? deals.length.toString() : '0';
    } catch (error) {
        console.error("Błąd podczas aktualizacji danych dashboardu:", error);
        if(showAlert) showAlert("Nie udało się zaktualizować danych na pulpicie.", "danger");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("main.js: DOM w pełni załadowany. Rozpoczynam inicjalizację CRM...");
    try {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer && showAlert) { // Sprawdź też, czy showAlert istnieje
            console.error("main.js: Krytyczny brak elementu #alertContainer. Alerty mogą nie działać poprawnie.");
            // Można spróbować stworzyć go dynamicznie, jeśli go nie ma, jako fallback
            const tempAlertContainer = document.createElement('div');
            tempAlertContainer.id = 'alertContainer';
            document.body.appendChild(tempAlertContainer);
            console.log("main.js: Utworzono tymczasowy #alertContainer.");
        }

        initModals();
        initNavigation();

        registerSectionUpdateCallback('dashboardSection', updateDashboardData);
        registerSectionUpdateCallback('contactsSection', renderContactsApp);
        registerSectionUpdateCallback('companiesSection', renderCompaniesApp);
        registerSectionUpdateCallback('transactionsSection', renderTransactionsApp);
        registerSectionUpdateCallback('tasksSection', renderTasks);
        registerSectionUpdateCallback('settingsSection', () => {
            console.log("main.js: Przełączono na sekcję Ustawienia.");
            // const settingsModule = await import('./settings.js'); // Można dynamicznie importować
            // if (settingsModule.renderSettingsApp) settingsModule.renderSettingsApp(); // Jeśli masz taką funkcję
        });

        initSettingsModule();
        initContactsModule();
        initCompaniesModule();
        initTasksModule();
        initTransactionsModule();
        refreshTransactionModuleProcessSelects(); // Upewnij się, że ta funkcja jest zaimplementowana i działa

        const toggleListBtn = document.getElementById('toggleTransactionViewList');
        const toggleKanbanBtn = document.getElementById('toggleTransactionViewKanban');
        const listView = document.getElementById('transactionListView');
        const kanbanView = document.getElementById('transactionKanbanView');

        if (toggleListBtn && toggleKanbanBtn && listView && kanbanView) {
            const switchToListView = () => {
                listView.style.display = 'block';
                kanbanView.style.display = 'none';
                toggleListBtn.classList.add('active');
                toggleKanbanBtn.classList.remove('active');
            };
            const switchToKanbanView = () => {
                listView.style.display = 'none';
                kanbanView.style.display = 'block';
                toggleListBtn.classList.remove('active');
                toggleKanbanBtn.classList.add('active');
                // Tutaj możesz wywołać funkcję renderującą widok Kanban, jeśli jest potrzebna
                // np. renderTransactionKanbanView();
            };
            
            switchToListView(); // Ustaw widok listy jako domyślny
            toggleListBtn.addEventListener('click', switchToListView);
            toggleKanbanBtn.addEventListener('click', switchToKanbanView);
        } else {
            console.warn("main.js: Przyciski przełączania widoku transakcji lub kontenery widoków nie zostały znalezione.");
            if (!toggleListBtn) console.warn("Nie znaleziono: toggleTransactionViewList");
            if (!toggleKanbanBtn) console.warn("Nie znaleziono: toggleTransactionViewKanban");
            if (!listView) console.warn("Nie znaleziono: transactionListView");
            if (!kanbanView) console.warn("Nie znaleziono: transactionKanbanView");
        }

        showSection('dashboardSection');
        await updateDashboardData();

        console.log("main.js: Inicjalizacja CRM zakończona pomyślnie.");

    } catch (e) {
        console.error("main.js: KRYTYCZNY BŁĄD podczas inicjalizacji:", e.stack || e);
        const errorMsg = "Wystąpił błąd podczas uruchamiania aplikacji.";
        if (typeof showAlert === 'function' && document.getElementById('alertContainer')) {
            showAlert(errorMsg, "danger", 10000);
        } else { /* ... fallback błędu jak wcześniej ... */ }
    }
});

console.log("main.js: Skrypt załadowany. Oczekuję na DOMContentLoaded.");
