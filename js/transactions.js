// js/transactions.js
import { supabase } from './supabaseClient.js';
import { showAlert } from './utils.js';
import { closeModal, openModal, openDeleteConfirmModal } from './modals.js';
// Potrzebne mogą być funkcje z contacts.js i companies.js do wypełniania selectów
// import { getContactsData } from './contacts.js';
// import { getCompaniesData } from './companies.js';


const TRANSACTIONS_TABLE = 'deals'; // Upewnij się, że nazwa tabeli jest poprawna

// --- Implementacja renderTransactionsApp ---
export async function renderTransactionsApp() {
    console.log("renderTransactionsApp: Rozpoczynam renderowanie transakcji (widok listy).");
    // Na razie implementacja dla widoku listy. Widok Kanban wymaga osobnej logiki.
    try {
        const deals = await getDealsData(); // Ta funkcja powinna pobierać też powiązane dane
        const tableBody = document.getElementById('transactionsTableBody');
        const noTransactionsMessage = document.getElementById('noTransactionsMessage');

        if (!tableBody || !noTransactionsMessage) {
            console.error("renderTransactionsApp: Brak tabeli transakcji lub komunikatu.");
            if(showAlert) showAlert("Błąd renderowania listy transakcji.", "danger");
            return;
        }
        tableBody.innerHTML = '';

        if (deals.length === 0) {
            noTransactionsMessage.classList.remove('hidden');
        } else {
            noTransactionsMessage.classList.add('hidden');
            deals.forEach(deal => {
                const row = tableBody.insertRow();
                row.insertCell().textContent = deal.name || '-';
                row.insertCell().textContent = deal.value ? `${deal.value.toFixed(2)} PLN` : '-';
                row.insertCell().textContent = deal.sales_processes?.name || '-'; // Zakładając JOIN i tabelę sales_processes
                row.insertCell().textContent = deal.transaction_stages?.name || '-'; // Zakładając JOIN i tabelę transaction_stages
                row.insertCell().innerHTML = `<span class="status-badge status-${deal.status || 'oczekujaca'}">${deal.status || 'oczekujaca'}</span>`;
                row.insertCell().textContent = deal.contacts ? `${deal.contacts.firstName || ''} ${deal.contacts.lastName || ''}`.trim() || '-' : '-'; // Zakładając JOIN
                row.insertCell().textContent = deal.companies?.name || '-'; // Zakładając JOIN
                row.insertCell().textContent = deal.created_at ? new Date(deal.created_at).toLocaleDateString() : '-';

                const actionsCell = row.insertCell();
                actionsCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';
                actionsCell.innerHTML = `
                    <button class="action-btn view-btn" data-deal-id="${deal.id}">Zobacz</button>
                    <button class="action-btn edit-btn" data-deal-id="${deal.id}">Edytuj</button>
                    <button class="action-btn delete-btn" data-deal-id="${deal.id}" data-deal-name="${deal.name || ''}">Usuń</button>
                `;
            });
        }
        console.log("renderTransactionsApp: Zakończono renderowanie transakcji.");
        attachActionListenersToTransactionsTable();
    } catch (error) {
        console.error("Błąd w renderTransactionsApp:", error);
        if(showAlert) showAlert("Nie udało się załadować transakcji.", "danger");
    }
}

// --- Funkcja do odświeżania/ładowania selectów w formularzu transakcji ---
export async function refreshTransactionModuleProcessSelects() {
    console.log("refreshTransactionModuleProcessSelects: Odświeżanie selectów procesów i etapów.");
    try {
        // Select dla procesów w formularzu transakcji
        const transactionProcessSelect = document.getElementById('transactionProcessSelect');
        if (transactionProcessSelect) {
            const processes = await getSalesProcessesForSelect(); // Musi być zaimplementowane
            transactionProcessSelect.innerHTML = '<option value="">-- Wybierz proces --</option>';
            processes.forEach(process => {
                const option = document.createElement('option');
                option.value = process.id;
                option.textContent = process.name;
                transactionProcessSelect.appendChild(option);
            });

            // Listener do zmiany procesu, aby załadować odpowiednie etapy
            transactionProcessSelect.removeEventListener('change', handleProcessChangeForStages); // Usuń stary
            transactionProcessSelect.addEventListener('change', handleProcessChangeForStages);
        }

        // Select dla procesów w widoku transakcji (filtr Kanban/Lista)
        const selectProcessForView = document.getElementById('selectProcessForTransactionsView');
        if (selectProcessForView) {
             const processes = await getSalesProcessesForSelect();
             selectProcessForView.innerHTML = '<option value="">-- Wszystkie Procesy (Lista) / Wybierz (Kanban) --</option>';
             processes.forEach(process => {
                const option = document.createElement('option');
                option.value = process.id;
                option.textContent = process.name;
                selectProcessForView.appendChild(option);
            });
            // TODO: Dodać listener do tego selecta, aby filtrować transakcje lub przełączać widok Kanban
        }


        // Selecty dla kontaktów i firm
        const contactSelect = document.getElementById('transactionContactId');
        const companySelect = document.getElementById('transactionCompanyId');

        if (contactSelect) {
            const contactsModule = await import('./contacts.js');
            const contacts = await contactsModule.getContactsData();
            contactSelect.innerHTML = '<option value="">-- Wybierz --</option>';
            contacts.forEach(c => contactSelect.add(new Option(`${c.firstName || ''} ${c.lastName || ''}`.trim(), c.id)));
        }
        if (companySelect) {
            const companiesModule = await import('./companies.js');
            const companies = await companiesModule.getCompaniesData();
            companySelect.innerHTML = '<option value="">-- Wybierz --</option>';
            companies.forEach(c => companySelect.add(new Option(c.name, c.id)));
        }


    } catch (error) {
        console.error("Błąd podczas ładowania selectów dla transakcji:", error);
        if(showAlert) showAlert("Błąd ładowania opcji dla transakcji.", "danger");
    }
}

async function handleProcessChangeForStages(event) {
    const processId = event.target.value;
    const stageSelect = document.getElementById('transactionStageId');
    if (!stageSelect) return;

    stageSelect.innerHTML = '<option value="">Ładowanie etapów...</option>';
    if (!processId) {
        stageSelect.innerHTML = '<option value="">-- Najpierw wybierz proces sprzedaży --</option>';
        stageSelect.disabled = true;
        return;
    }

    try {
        const stages = await getTransactionStagesForSelect(processId); // Musi być zaimplementowane
        stageSelect.innerHTML = '<option value="">-- Wybierz etap --</option>';
        if (stages.length > 0) {
            stages.forEach(stage => {
                const option = document.createElement('option');
                option.value = stage.id;
                option.textContent = stage.name;
                stageSelect.appendChild(option);
            });
            stageSelect.disabled = false;
        } else {
            stageSelect.innerHTML = '<option value="">Brak etapów dla tego procesu</option>';
            stageSelect.disabled = true;
        }
    } catch (error) {
        console.error("Błąd ładowania etapów:", error);
        stageSelect.innerHTML = '<option value="">Błąd ładowania etapów</option>';
        stageSelect.disabled = true;
    }
}


// --- Funkcje danych ---
export async function getDealsData() {
    const { data, error } = await supabase
        .from(TRANSACTIONS_TABLE)
        .select(`
            *,
            sales_processes ( name ),
            transaction_stages ( name ),
            contacts ( firstName, lastName, email ),
            companies ( name )
        `);
    if (error) { console.error('Błąd pobierania transakcji:', error); return []; }
    return data || [];
}

export async function addDeal(dealData) {
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).insert([dealData]).select();
    if (error) { console.error('Błąd dodawania transakcji:', error); return null; }
    return data ? data[0] : null;
}

export async function updateDeal(id, dealData) {
    const { data, error } = await supabase.from(TRANSACTIONS_TABLE).update(dealData).eq('id', id).select();
    if (error) { console.error('Błąd aktualizacji transakcji:', error); return null; }
    return data ? data[0] : null;
}

export async function getDealById(id) {
    const { data, error } = await supabase
        .from(TRANSACTIONS_TABLE)
        .select(`*, sales_processes(*), transaction_stages(*), contacts(*), companies(*)`)
        .eq('id', id)
        .single();
    if (error) { console.error('Błąd pobierania transakcji po ID:', error); return null; }
    return data;
}

export async function getSalesProcessesForSelect() { // Definicja funkcji
    const { data, error } = await supabase.from('sales_processes').select('id, name').order('name');
    if (error) { console.error("Błąd pobierania procesów sprzedaży dla selecta:", error); return []; }
    return data || [];
}

export async function getTransactionStagesForSelect(processId) { // Definicja funkcji
    if (!processId) return [];
    const { data, error } = await supabase
        .from('transaction_stages')
        .select('id, name')
        .eq('sales_process_id', processId)
        .order('order_index', { ascending: true });
    if (error) { console.error("Błąd pobierania etapów dla selecta:", error); return []; }
    return data || [];
}


// --- Obsługa formularza ---
async function handleTransactionFormSubmit(event) {
    event.preventDefault();
    const formElement = event.target;
    const transactionId = formElement.transactionId.value;
    const isEditing = Boolean(transactionId);

    const transactionData = { // Upewnij się, że nazwy atrybutów `name` w HTML pasują do tych kluczy
        name: formElement.transactionName.value,
        value: parseFloat(formElement.transactionValue.value) || null,
        sales_process_id: formElement.transactionProcessSelect.value || null,
        transaction_stage_id: formElement.transactionStageId.value || null,
        status: formElement.transactionStatus.value,
        contact_id: formElement.transactionContactId.value || null,
        company_id: formElement.transactionCompanyId.value || null,
        closing_date: formElement.transactionClosingDate.value || null,
        description: formElement.transactionDescription.value,
    };
    // Walidacja prostych pól
    if (!transactionData.name || !transactionData.value || !transactionData.sales_process_id || !transactionData.transaction_stage_id) {
        if(showAlert) showAlert("Proszę wypełnić wszystkie wymagane pola transakcji (Nazwa, Wartość, Proces, Etap).", "danger");
        return;
    }


    console.log("Wysyłanie danych transakcji:", transactionData, "Edycja:", isEditing);

    try {
        let result;
        if (isEditing) {
            result = await updateDeal(transactionId, transactionData);
            if (result && showAlert) showAlert('Transakcja zaktualizowana!', 'success');
        } else {
            result = await addDeal(transactionData);
            if (result && showAlert) showAlert('Transakcja dodana!', 'success');
        }

        if (result) {
            const transactionFormModal = document.getElementById('transactionFormModal');
            if(transactionFormModal) closeModal(transactionFormModal);
            formElement.reset();
            if(formElement.transactionId) formElement.transactionId.value = '';
            document.getElementById('transactionStageId').innerHTML = '<option value="">-- Najpierw wybierz proces sprzedaży --</option>'; // Resetuj etapy
            document.getElementById('transactionStageId').disabled = true;
            await renderTransactionsApp(); // Odśwież listę lub widok Kanban
            const mainModule = await import('./main.js');
            if (mainModule.updateDashboardData) mainModule.updateDashboardData();
        } else {
            if (showAlert) showAlert('Wystąpił błąd podczas zapisywania transakcji.', 'danger');
        }
    } catch (error) {
        console.error('Błąd zapisu transakcji:', error);
        if (showAlert) showAlert(`Błąd zapisu transakcji: ${error.message || 'Nieznany błąd'}`, 'danger');
    }
}

// --- Obsługa przycisków akcji w tabeli ---
function attachActionListenersToTransactionsTable() {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) {
        console.warn("transactions.js: Nie znaleziono transactionsTableBody.");
        return;
    }
    const newTableBody = tableBody.cloneNode(true);
    tableBody.parentNode.replaceChild(newTableBody, tableBody);

    newTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button.action-btn');
        if (!target) return;
        const dealId = target.dataset.dealId;
        const dealName = target.dataset.dealName;
        if (!dealId) return;

        if (target.classList.contains('edit-btn')) {
            console.log(`Edycja transakcji ID: ${dealId}`);
            const deal = await getDealById(dealId);
            if (deal) {
                const form = document.getElementById('transactionForm');
                const modalTitle = document.getElementById('transactionFormModalTitle');
                const modal = document.getElementById('transactionFormModal');
                if (form && modalTitle && modal) {
                    modalTitle.textContent = 'Edytuj Transakcję';
                    form.transactionId.value = deal.id;
                    form.transactionName.value = deal.name || '';
                    form.transactionValue.value = deal.value || '';
                    
                    await refreshTransactionModuleProcessSelects(); // Załaduj procesy i firmy/kontakty
                    // Ustaw wybrane wartości po załadowaniu selectów
                    setTimeout(async () => { // Opóźnienie, aby dać czas na załadowanie selectów
                        form.transactionProcessSelect.value = deal.sales_process_id || '';
                        // Po ustawieniu procesu, załaduj i ustaw etapy
                        if (deal.sales_process_id) {
                            await handleProcessChangeForStages({ target: form.transactionProcessSelect });
                            form.transactionStageId.value = deal.transaction_stage_id || '';
                        }
                        form.transactionStatus.value = deal.status || 'oczekujaca';
                        form.transactionContactId.value = deal.contact_id || '';
                        form.transactionCompanyId.value = deal.company_id || '';
                        form.transactionClosingDate.value = deal.closing_date || '';
                        form.transactionDescription.value = deal.description || '';
                    }, 100); // Krótkie opóźnienie

                    openModal(modal);
                }
            }
        } else if (target.classList.contains('delete-btn')) {
            openDeleteConfirmModal(dealId, 'transaction', dealName, async (id, type) => {
                if (type === 'transaction') {
                    await renderTransactionsApp();
                    const mainModule = await import('./main.js');
                    if (mainModule.updateDashboardData) mainModule.updateDashboardData();
                }
            });
        } else if (target.classList.contains('view-btn')) {
            // TODO: Implementacja modala szczegółów transakcji
            const transactionDetailsModal = document.getElementById('transactionDetailsModal');
            const transactionDetailsContent = document.getElementById('transactionDetailsContent');
            if(transactionDetailsModal && transactionDetailsContent) {
                const deal = await getDealById(dealId);
                if(deal) {
                    transactionDetailsContent.innerHTML = `<p><strong>Nazwa:</strong> ${deal.name}</p> ... więcej pól`;
                    openModal(transactionDetailsModal);
                }
            }
        }
    });
}


// --- Inicjalizacja modułu ---
export function initTransactionsModule() {
    console.log("Transactions module initialized.");
    const form = document.getElementById('transactionForm');
    if (form) {
        form.removeEventListener('submit', handleTransactionFormSubmit);
        form.addEventListener('submit', handleTransactionFormSubmit);
    } else {
        console.warn("transactions.js: Element transactionForm nie został znaleziony w DOM.");
    }

    const openButton = document.getElementById('openTransactionFormModalButton');
    const modal = document.getElementById('transactionFormModal');
    const modalTitle = document.getElementById('transactionFormModalTitle'); // Upewnij się, że istnieje
    const transactionIdInput = document.getElementById('transactionId');

    if (openButton && modal && modalTitle && form && transactionIdInput) {
        openButton.removeEventListener('click', openTransactionFormForNew);
        openButton.addEventListener('click', openTransactionFormForNew);
    } else {
        if (!openButton) console.warn("transactions.js: Przycisk 'openTransactionFormModalButton' nie znaleziony.");
    }

    async function openTransactionFormForNew() {
        const form = document.getElementById('transactionForm');
        const modalTitle = document.getElementById('transactionFormModalTitle');
        const transactionIdInput = document.getElementById('transactionId');
        const modal = document.getElementById('transactionFormModal');

        if(form && modalTitle && transactionIdInput && modal){
            modalTitle.textContent = 'Dodaj Nową Transakcję';
            form.reset();
            transactionIdInput.value = '';
            document.getElementById('transactionStageId').innerHTML = '<option value="">-- Najpierw wybierz proces sprzedaży --</option>';
            document.getElementById('transactionStageId').disabled = true;
            await refreshTransactionModuleProcessSelects(); // Załaduj opcje do selectów
            openModal(modal);
        }
    }
}
