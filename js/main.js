
// --- GŁÓWNE IMPORTY MODUŁÓW ---
import * as DOM from './domElements.js';
import { showAlert } from './utils.js';
import { initModals } from './modals.js';
import { initNavigation, showSection, registerSectionUpdateCallback } from './navigation.js';

import {
    initSettingsModule
} from './settings.js';

import {
    initContactsModule,
    renderContactsApp,
    getContactsData
} from './contacts.js';

import {
    initCompaniesModule,
    renderCompaniesApp,
    getCompaniesData
} from './companies.js';

import {
    initTransactionsModule,
    renderTransactionsApp,
    getDealsData,
    refreshTransactionModuleProcessSelects
} from './transactions.js';

import {
    initTasksModule,
    renderTasks,
    getTasksData
} from './tasks.js';

// --- GLOBALNE FUNKCJE POMOCNICZE / "HAKI" DO ODŚWIEŻANIA ---
export async function updateDashboardData() {
    const contacts = await getContactsData();
    const companies = await getCompaniesData();
    const deals = await getDealsData();

    if (DOM.dashboardTotalContacts) DOM.dashboardTotalContacts.textContent = contacts.length.toString();
    if (DOM.dashboardTotalCompanies) DOM.dashboardTotalCompanies.textContent = companies.length.toString();
    if (DOM.dashboardTotalTransactions) DOM.dashboardTotalTransactions.textContent = deals.length.toString();
}

// --- INICJALIZACJA APLIKACJI ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("main.js: DOM w pełni załadowany. Rozpoczynam inicjalizację CRM...");
    try {
        if (!DOM.alertContainer) {
            console.error("main.js: Krytyczny brak elementu #alertContainer. Alerty mogą nie działać poprawnie.");
        }

        initModals();
        initNavigation();

        registerSectionUpdateCallback('dashboardSection', updateDashboardData);
        registerSectionUpdateCallback('contactsSection', renderContactsApp);
        registerSectionUpdateCallback('companiesSection', renderCompaniesApp);
        registerSectionUpdateCallback('transactionsSection', renderTransactionsApp);
        registerSectionUpdateCallback('tasksSection', renderTasks);
        registerSectionUpdateCallback('settingsSection', () => {
            console.log("main.js: Callback dla settingsSection.");
        });

        initSettingsModule();
        initContactsModule();
        initCompaniesModule();
        initTasksModule();
        initTransactionsModule();
        refreshTransactionModuleProcessSelects();

        if (DOM.toggleTransactionViewList && DOM.toggleTransactionViewKanban) {
            DOM.toggleTransactionViewList.classList.add('active');
            DOM.toggleTransactionViewKanban.classList.remove('active');
            if(DOM.transactionListView) DOM.transactionListView.style.display = 'block';
            if(DOM.transactionKanbanView) DOM.transactionKanbanView.style.display = 'none';
        } else {
            console.warn("main.js: Przyciski przełączania widoku transakcji nie zostały znalezione.");
        }

        showSection('dashboardSection');
        console.log("main.js: Inicjalizacja CRM zakończona pomyślnie.");

    } catch (e) {
        console.error("main.js: KRYTYCZNY BŁĄD podczas inicjalizacji:", e.stack || e);
        const errorMsg = "Wystąpił błąd podczas uruchamiania aplikacji.";
        if (typeof showAlert === 'function' && DOM.alertContainer) {
            showAlert(errorMsg, "danger", 10000);
        } else {
            const body = document.querySelector('body');
            if (body) {
                const errorDiv = document.createElement('div');
                errorDiv.textContent = `BŁĄD: ${errorMsg}`;
                errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:20px;background-color:red;color:white;text-align:center;z-index:9999;font-size:16px;';
                body.prepend(errorDiv);
            } else {
                alert(errorMsg);
            }
        }
    }
});

console.log("main.js: Skrypt załadowany. Oczekuję na DOMContentLoaded.");
