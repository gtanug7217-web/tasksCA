import { LightningElement, wire } from 'lwc';
import getAllOpportunities from '@salesforce/apex/FilterOpportunityHandler.getAllOpportunities';
import { refreshApex } from '@salesforce/apex';

export default class OpportunityFilterComponent extends LightningElement {

    isFilterPanelVisible = false;

    allOpportunities = [];
    filteredOpportunities = [];
    filters = [];
    filterLogic = '';
    searchKey = '';

    wiredResult; // refresh ke liye

    // FETCH DATA
    @wire(getAllOpportunities)
    wiredOpportunity(result) {

        this.wiredResult = result;

        if (result.data) {

            const modifiedData = result.data.map(rec => {
                return {
                    ...rec,
                    AccountName: rec.Account ? rec.Account.Name : ''
                };
            });

            this.allOpportunities = modifiedData;
            this.applyAllFilters();

        } else if (result.error) {
            console.error(result.error);
        }
    }

    // TOGGLE FILTER PANEL
    handleToggleNav() {
        this.isFilterPanelVisible = !this.isFilterPanelVisible;
    }

    // SEARCH
    handleSearch(event) {
        const value = event.target.value.toLowerCase();
        this.searchKey = value;

        if (value.length < 3) {
            this.searchKey = '';
            this.applyAllFilters();
            return;
        }

        this.applyAllFilters();
    }

    // FILTER FROM CHILD
    handleFilterChange(event) {
        this.filters = event.detail?.boxes || [];
        this.filterLogic = event.detail?.logicExpression || '';
        this.applyAllFilters();
    }


    applyAllFilters() {

        let data = [...this.allOpportunities];

        // SEARCH FILTER
        if (this.searchKey && this.searchKey.length >= 3) {
            data = data.filter(rec =>
                rec.Name?.toLowerCase().includes(this.searchKey) ||
                rec.StageName?.toLowerCase().includes(this.searchKey) ||
                rec.Amount?.toString().includes(this.searchKey)
            );
        }

        // CUSTOM FILTERS
        if (this.filters.length > 0) {

            const numberedFilters = this.filters.map((f, index) => ({
                ...f,
                number: index + 1
            }));

            if (this.filterLogic && this.filterLogic.toUpperCase().includes('OR')) {

                data = data.filter(rec =>
                    numberedFilters.some(f =>
                        this.recordMatchesFilter(rec, f)
                    )
                );

            } else {

                data = data.filter(rec =>
                    numberedFilters.every(f =>
                        this.recordMatchesFilter(rec, f)
                    )
                );
            }
        }

        // UI refresh
        this.filteredOpportunities = [...data];
    }

    //  SINGLE FILTER CHECK
    recordMatchesFilter(rec, f) {

        if (!f.field || !f.operator) {
            return true;
        }

        const val = rec[f.field];
        const fv = f.value;

        const safeVal = val != null ? val.toString().toLowerCase() : '';
        const safeFv = fv != null ? fv.toString().toLowerCase() : '';

        switch (f.operator) {

            case 'equals':
                return safeVal === safeFv;

            case 'notEquals':
                return safeVal !== safeFv;

            case 'greaterThan':
                return Number(val) > Number(fv);

            case 'lessThan':
                return Number(val) < Number(fv);

            case 'greaterOrEqual':
                return Number(val) >= Number(fv);

            case 'lessOrEqual':
                return Number(val) <= Number(fv);

            case 'contains':
                return safeVal.includes(safeFv);

            case 'doesNotContain':
                return !safeVal.includes(safeFv);

            default:
                return true;
        }
    }

    // REFRESH AFTER SAVE
    handleRefresh() {
        refreshApex(this.wiredResult);
    }

    // CSS CLASS
    get dataContainerClass() {
        return this.isFilterPanelVisible
            ? 'data-panel shifted'
            : 'data-panel centered';
    }
}