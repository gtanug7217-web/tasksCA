import { LightningElement } from 'lwc';

export default class NavbarToggle extends LightningElement {
    handleClick() {
        this.dispatchEvent(new CustomEvent('togglenav'));
    }
}