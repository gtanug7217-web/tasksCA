import { LightningElement, api } from 'lwc';

export default class FieldCriteriaPopup extends LightningElement {

    //  DATA FROM PARENT
    @api fieldOptions = [];
    @api operatorOptions = [];
    @api valueOptions = [];
    @api selectedField = '';
    @api selectedOperator = '';
    @api selectedValue = '';
    @api inputType = 'text';
    @api isPicklist = false;

    //  HANDLERS
    handleFieldChange(event) {
        this.selectedField = event.detail.value;

        this.dispatchEvent(new CustomEvent('fieldchange', {
            detail: this.selectedField
        }));
    }

    handleOperatorChange(event) {
        this.selectedOperator = event.detail.value;
    }

    handleValueChange(event) {
        this.selectedValue = event.detail.value;
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    handleSave() {
        this.dispatchEvent(new CustomEvent('save', {
            detail: {
                field: this.selectedField,
                operator: this.selectedOperator,
                value: this.selectedValue
            }
        }));
    }
}