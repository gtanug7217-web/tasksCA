import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/day1getOpportunityFromAccount.getAccounts';
import getOpportunityFromAccount from '@salesforce/apex/day1getOpportunityFromAccount.getOpportunityFromAccount';
import updatingOpportunities from '@salesforce/apex/day1getOpportunityFromAccount.updatingOpportunities';
import { NavigationMixin } from "lightning/navigation";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//columns for the opportunity datatable
const columnsOpportunites = [
    { label: "Account Name", fieldName: "AccountName"},
    { label: "Opportunity Id", fieldName: "Id" },
    { 
        label: "Opportunity Name", 
        fieldName: "Name",
        type: "button",
        typeAttributes: {
            label: { fieldName: "Name" },
            name: "view",
            variant: "base"
        }
    },
    { label: "Stage Name", fieldName: "StageName", editable: true },
    { label: "Close Date", fieldName: "CloseDate" },
    { label: "Amount", fieldName: "Amount", editable: true },
];

export default class Day1getOpportunityFromAccount extends NavigationMixin(LightningElement) {

    @track Accounts = [];
    @track Opportunity = [];

    columnsOpportunites = columnsOpportunites;

    showData = false;
    selectedAccountId = null;
    draftValues = [];

    wiredOppResult; 
    isLoading = false;
    
    @wire(getAccounts)
    wiredAccount({ data, error }) {
        if (data) {
            this.Accounts = data.map(acc => ({
                ...acc,
                toggleButtonLabel: '+',
                rowClass: 'accountRow'
            }));
        } else if (error) {
            console.log(error);
        }
    }

    
    @wire(getOpportunityFromAccount, { accountId: '$selectedAccountId' })
    wiredOpp(result) {
        this.wiredOppResult = result;
        this.isLoading = true;

        if (result.data) {
            this.Opportunity = result.data.map(opp => {
            return {
                ...opp,
                AccountName: opp.Account ? opp.Account.Name : ''
            };
        });
        this.isLoading = false;
        } else if (result.error) {
            console.error(result.error);
            this.isLoading = false;
        }
    }

    
    handleAccountNameClick(event) {
        const accountId = event.target.dataset.id;

        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: accountId,
                objectApiName: "Account",
                actionName: "view",
            },
        });
    }

    
    handleToggleButtonClick(event) {
        const accountId = event.target.value;

        this.Accounts = this.Accounts.map(acc => {
            if (acc.Id === accountId) {
                const isOpening = acc.toggleButtonLabel === '+';
                return {
                    ...acc,
                    toggleButtonLabel: isOpening ? '-' : '+',
                    rowClass: isOpening ? 'selectedAccount' : 'accountRow'
                };
            } else {
                return { ...acc, toggleButtonLabel: '+', rowClass: 'accountRow' };
            }
        });

        const clicked = this.Accounts.find(acc => acc.Id === accountId);

        if (clicked.toggleButtonLabel === '-') {
            this.showData = true;
            this.selectedAccountId = accountId; 
        } else {
            this.showData = false;
            this.Opportunity = [];
            this.selectedAccountId = null;
        }
    }

    
    handleRowAction(event) {
        const row = event.detail.row;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    }

    get hasOpportunity() {
        return this.Opportunity && this.Opportunity.length > 0;
    }

    
    handleOpportunityChangeSave(event) {
        let updatedFields = event.detail.draftValues;
        const updatedOpps = updatedFields.map(draft => {

    const original = this.Opportunity.find(o => o.Id === draft.Id);

    let name = original.Name;

    if (draft.StageName === 'Closed Won') {
        name = 'Won - ' + original.Name;
    } 
    else if (draft.StageName === 'Closed Lost') {
        name = 'Lost - ' + original.Name;
    }

    return {
        Id: draft.Id,
        StageName: draft.StageName,
        Amount: draft.Amount,
        Name: name
    };
});
            
        updatingOpportunities({ opportunityList: updatedOpps })
            .then(() => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Opportunities Updated',
                        variant: 'success'
                    })
                );

                this.draftValues = [];
                return refreshApex(this.wiredOppResult);
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body?.message || 'Error updating opportunities',
                        variant: 'error'
                    })
                );
            });
    }


    get containerClass() {
    return this.showData ? 'containerSplit' : 'containerCenter';
}

get accountSectionClass() {
    return this.showData ? 'accountLeft' : 'accountCenter';
}
}