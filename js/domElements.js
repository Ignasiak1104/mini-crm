// js/domElements.js
export const DOM = {
    // Kontener na alerty
    alertContainer: document.getElementById('alertContainer'),

    // Modale formularzy
    contactFormModal: document.getElementById('contactFormModal'),
    companyFormModal: document.getElementById('companyFormModal'),
    quickAddCompanyModal: document.getElementById('quickAddCompanyModal'),
    transactionFormModal: document.getElementById('transactionFormModal'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),

    // Modale szczegółów
    contactDetailsModal: document.getElementById('contactDetailsModal'),
    companyDetailsModal: document.getElementById('companyDetailsModal'),
    transactionDetailsModal: document.getElementById('transactionDetailsModal'),

    // Przyciski zamykania modali (X)
    closeContactFormModalButton: document.getElementById('closeContactFormModalButton'),
    closeCompanyFormModalButton: document.getElementById('closeCompanyFormModalButton'),
    closeQuickAddCompanyModalButton: document.getElementById('closeQuickAddCompanyModalButton'),
    closeTransactionFormModalButton: document.getElementById('closeTransactionFormModalButton'),
    closeDeleteConfirmModalButton: document.getElementById('closeDeleteConfirmModalButton'),
    closeContactDetailsModalButton: document.getElementById('closeContactDetailsModalButton'),
    closeCompanyDetailsModalButton: document.getElementById('closeCompanyDetailsModalButton'),
    closeTransactionDetailsModalButton: document.getElementById('closeTransactionDetailsModalButton'),

    // Przyciski akcji w modalach (Anuluj, Zamknij itp.)
    cancelQuickAddCompanyButton: document.getElementById('cancelQuickAddCompanyButton'),
    cancelDeleteButton: document.getElementById('cancelDeleteButton'), // Przycisk "Anuluj" w deleteConfirmModal
    confirmDeleteButton: document.getElementById('confirmDeleteButton'), // Przycisk "Usuń" w deleteConfirmModal
    closeContactDetailsViewButton: document.getElementById('closeContactDetailsViewButton'),
    closeCompanyDetailsViewButton: document.getElementById('closeCompanyDetailsViewButton'),
    closeTransactionDetailsViewButton: document.getElementById('closeTransactionDetailsViewButton'),

    // Elementy Dashboardu
    dashboardTotalContacts: document.getElementById('dashboardTotalContacts'),
    dashboardTotalCompanies: document.getElementById('dashboardTotalCompanies'),
    dashboardTotalTransactions: document.getElementById('dashboardTotalTransactions'),

    // Elementy sekcji Transakcji (widoki, przełączniki)
    transactionListView: document.getElementById('transactionListView'),
    transactionKanbanView: document.getElementById('transactionKanbanView'),
    toggleTransactionViewList: document.getElementById('toggleTransactionViewList'),
    toggleTransactionViewKanban: document.getElementById('toggleTransactionViewKanban'),

    // Formularze (do podpięcia event listenerów submit)
    contactForm: document.getElementById('contactForm'),
    companyForm: document.getElementById('companyForm'),
    quickAddCompanyForm: document.getElementById('quickAddCompanyForm'),
    transactionForm: document.getElementById('transactionForm'),
    taskForm: document.getElementById('taskForm'),
    salesProcessForm: document.getElementById('salesProcessForm'),
    transactionStageForm: document.getElementById('transactionStageForm'),
    customContactFieldForm: document.getElementById('customContactFieldForm'),
    customCompanyFieldForm: document.getElementById('customCompanyFieldForm'),


    // Inne potrzebne elementy (uzupełnij w miarę potrzeb)
    deleteMessage: document.getElementById('deleteMessage'), // Wiadomość w deleteConfirmModal

    // Możesz tu dodać więcej elementów, jeśli są często używane
    // np. przyciski otwierania modali z formularzami
    openContactFormModalButton: document.getElementById('openContactFormModalButton'),
    openCompanyFormModalButton: document.getElementById('openCompanyFormModalButton'),
    openTransactionFormModalButton: document.getElementById('openTransactionFormModalButton'),
};
