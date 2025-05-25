// js/domElements.js
export const DOM = {
    alertContainer: document.getElementById('alertContainer'), // Musi być w HTML

    // Modale - te są potrzebne do otwierania/zamykania
    contactFormModal: document.getElementById('contactFormModal'),
    companyFormModal: document.getElementById('companyFormModal'),
    quickAddCompanyModal: document.getElementById('quickAddCompanyModal'),
    transactionFormModal: document.getElementById('transactionFormModal'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    contactDetailsModal: document.getElementById('contactDetailsModal'),
    companyDetailsModal: document.getElementById('companyDetailsModal'),
    transactionDetailsModal: document.getElementById('transactionDetailsModal'),

    // Przyciski zamykania modali (X) i inne przyciski w modalach
    closeContactFormModalButton: document.getElementById('closeContactFormModalButton'),
    closeCompanyFormModalButton: document.getElementById('closeCompanyFormModalButton'),
    closeQuickAddCompanyModalButton: document.getElementById('closeQuickAddCompanyModalButton'),
    closeTransactionFormModalButton: document.getElementById('closeTransactionFormModalButton'),
    closeDeleteConfirmModalButton: document.getElementById('closeDeleteConfirmModalButton'),
    closeContactDetailsModalButton: document.getElementById('closeContactDetailsModalButton'),
    closeCompanyDetailsModalButton: document.getElementById('closeCompanyDetailsModalButton'),
    closeTransactionDetailsModalButton: document.getElementById('closeTransactionDetailsModalButton'),
    cancelQuickAddCompanyButton: document.getElementById('cancelQuickAddCompanyButton'),
    cancelDeleteButton: document.getElementById('cancelDeleteButton'),
    confirmDeleteButton: document.getElementById('confirmDeleteButton'), // Musi być w HTML
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
    toggleTransactionViewList: document.getElementById('toggleTransactionViewList'), // Musi być w HTML
    toggleTransactionViewKanban: document.getElementById('toggleTransactionViewKanban'), // Musi być w HTML

    // Komunikat w modalu usuwania
    deleteMessage: document.getElementById('deleteMessage'),

    // Przyciski otwierania głównych modali formularzy
    openContactFormModalButton: document.getElementById('openContactFormModalButton'),
    openCompanyFormModalButton: document.getElementById('openCompanyFormModalButton'),
    openTransactionFormModalButton: document.getElementById('openTransactionFormModalButton'),
    //addTaskButton: document.getElementById('addTaskButton'), // Dla taskForm, jeśli nie jest częścią samego formularza
};
