import { LightningElement, api, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columnsOpportunity = [
    { label: 'Account Name', fieldName: 'AccountName',
        type: "button",
        typeAttributes: {
            label: { fieldName: "AccountName" },
            name: "accountView",
            variant: "base"
        }
     },
    {
        label: 'Name',
        fieldName: "Name",
        type: "button",
        typeAttributes: {
            label: { fieldName: "Name" },
            name: "opportunityView",
            variant: "base"
        }
    },
    { label: 'Stage Name', fieldName: 'StageName', editable: true },
    { label: 'Close Date', fieldName: 'CloseDate', editable: true },
    { label: 'Amount', fieldName: 'Amount', type: 'currency', editable: true }
];

export default class ShowOpportunityFromFilters extends NavigationMixin(LightningElement) {

    columnsOpportunity = columnsOpportunity;

    @track paginatedData = [];

    _filteredData = [];
    currentDataSet = [];

    currentPage = 1;
    pageSize = 10;
    totalPages = 0;

    draftValuesOpportunity = [];

    //  RECEIVE DATA FROM PARENT
    @api
    set filteredData(value) {
        this._filteredData = value;

        if (value && value.length > 0) {
            this.currentDataSet = value;
        } else {
            this.currentDataSet = [];
        }

        this.currentPage = 1;
        this.totalPages = Math.ceil(this.currentDataSet.length / this.pageSize) || 1;

        this.updatePaginatedData();
    }

    get filteredData() {
        return this._filteredData;
    }

    // PAGINATION LOGIC
    updatePaginatedData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;

        this.paginatedData = this.currentDataSet.slice(start, end);
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePaginatedData();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePaginatedData();
        }
    }

    // BUTTON STATES
    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    // DISPLAY DATA
    get displayData() {
        return this.paginatedData;
    }

    // NAVIGATION
  handleRowAction(event) {
    const row = event.detail.row;
    const actionName = event.detail.action.name;

    if (actionName === 'opportunityView') {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });

    } else if (actionName === 'accountView') {
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.AccountId, 
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }
}


    // INLINE EDIT SAVE
    handleSaveEditOpp(event) {

        const draftValues = event.detail.draftValues;

        draftValues.forEach(draft => {

            const fields = { ...draft };

            updateRecord({ fields })
                .then(() => {
                    this.dispatchEvent(new ShowToastEvent({
        title: 'Success',
        message: 'Record updated successfully',
        variant: 'success'
    }));
                    this.dispatchEvent(new CustomEvent('refreshdata'));
                })
                .catch(error => {
                    console.error(error);
                });

        });

        // clear draft values
        this.draftValuesOpportunity = [];


        // refresh current page UI
        this.updatePaginatedData();
    }
}