import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

const OPERATOR_OPTIONS = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Contains', value: 'contains' },
    { label: 'Does Not Contain', value: 'doesNotContain' },
    { label: 'Greater or Equal', value: 'greaterOrEqual' },
    { label: 'Less or Equal', value: 'lessOrEqual' }
];

export default class OpportunityFilterPanel extends LightningElement {

    boxes = [];
    showModal = false;

    selectedFilterId;
    selectedField = '';
    selectedOperator = '';
    selectedValue = '';

    fieldOptions = [];
    recordTypeId;
    picklistValuesByRecordType;
    
    logicExpression = '';
    showLogicEditor = false;

    // 🔹 OBJECT INFO
    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    wiredObjectInfo({ data }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
            this.fieldOptions = Object.keys(data.fields).map(f => ({
                label: data.fields[f].label,
                value: f
            }));
        }
    }

    // 🔹 PICKLIST
    @wire(getPicklistValuesByRecordType, {
        objectApiName: OPPORTUNITY_OBJECT,
        recordTypeId: '$recordTypeId'
    })
    wiredPicklist({ data }) {
        if (data) {
            this.picklistValuesByRecordType = data;
        }
    }

    get operatorOptions() {
        return OPERATOR_OPTIONS;
    }

    // 🔹 PICKLIST VALUES
    get valueOptions() {
        const field = this.selectedField;
        const pick = this.picklistValuesByRecordType?.picklistFieldValues?.[field];

        if (pick?.values) {
            return pick.values.map(v => ({
                label: v.label,
                value: v.value
            }));
        }

        return [];
    }

    get showValueCombobox() {
        return this.valueOptions.length > 0;
    }

    get valueInputType() {
        if (this.selectedField === 'Amount') return 'number';
        if (this.selectedField === 'CloseDate') return 'date';
        return 'text';
    }

    // 🔹 ADD FILTER
    handleAddFilter() {
        const id = Date.now();
        const number = this.boxes.length + 1;
        this.boxes = [...this.boxes, { id, number }];
    }

    handleRemoveAll() {
        this.boxes = [];
        this.dispatchFilters();
    }

    addCustomFilterLogic() {
        this.showLogicEditor = true;
    }

    handleLogicChange(event) {
        this.logicExpression = event.target.value;
    }

    handleSaveLogic() {
        this.showLogicEditor = false;
        this.dispatchFilters();
    }

    handleCancelLogic() {
        this.showLogicEditor = false;
    }

    // CLICK BOX
    handleClickFilterBox(event) {
        const id = parseInt(event.currentTarget.dataset.id, 10);
        const box = this.boxes.find(b => b.id === id);

        this.selectedFilterId = id;
        this.selectedField = box?.field || '';
        this.selectedOperator = box?.operator || '';
        this.selectedValue = box?.value || '';

        this.showModal = true;
    }

    // 🔹 DELETE
    handleDeleteFilter(event) {
        event.stopPropagation();
        const id = parseInt(event.currentTarget.dataset.id, 10);

        this.boxes = this.boxes
            .filter(b => b.id !== id)
            .map((box, index) => ({ ...box, number: index + 1 }));
        this.dispatchFilters();
    }

    // 🔹 FIELD CHANGE (from modal)
    handleFieldChange(event) {
        this.selectedField = event.detail;
        this.selectedValue = '';
    }

    // 🔹 SAVE FROM MODAL
    handleModalSave(event) {
        const { field, operator, value } = event.detail;

        this.boxes = this.boxes.map(box => {
            if (box.id !== this.selectedFilterId) return box;

            return {
                ...box,
                field,
                fieldLabel: this.fieldOptions.find(f => f.value === field)?.label,
                operator,
                value
            };
        });

        this.showModal = false;
        this.dispatchFilters();
    }

    handleCancel() {
        this.showModal = false;
    }

    // SEND TO PARENT
    dispatchFilters() {
        this.dispatchEvent(
            new CustomEvent('filterchange', {
                detail: {
                    boxes: this.boxes,
                    logicExpression: this.logicExpression
                }
            })
        );
    }
}