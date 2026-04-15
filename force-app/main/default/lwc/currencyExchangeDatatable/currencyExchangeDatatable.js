import { LightningElement,wire,track } from 'lwc';
import getCurrencyData from '@salesforce/apex/currencyExchange.getRates'
const columns=[
{label:"Serial No",fieldName:"serialNo",type:"Number"},
{label:"Currency Types",fieldName:"currencyType",type:"String"},
{label:"Currency Value",fieldName:"currencyValue",type:"Decimal"}
];
export default class CurrencyExchangeDatatable extends LightningElement {
    columns=columns;
    @track currencyData=[];
    @track filteredData=[];
    currentPage=1;
    totalPages=0;
    pageSize=5;
    index=0;
    searchKey='';
    @track paginatedData=[];

    @wire(getCurrencyData)
    WiredCurrencyData({data,error}){
        if(data){
            this.index = 0;
            this.currencyData = Object.entries(data).map(([key,value]) => {
                this.index++;
                return {
                    id:key, serialNo:this.index,
                    currencyType:key, currencyValue: value,
                };
            });
            this.filteredData=[...this.currencyData];
            this.totalPages=Math.ceil(this.filteredData.length/this.pageSize) || 1;
            this.currentPage=1;
            this.updatePaginatedData();
        }
        else if(error){
            throw new Error('Fetching of data failed from wire!!');
        }
    }
    handlePrevious(){
        if(this.currentPage>1){
            this.currentPage--;
            this.updatePaginatedData();
        }
    }
    handleNext(){
        if(this.currentPage<this.totalPages){
            this.currentPage++;
            this.updatePaginatedData();
        }
    }
    get isPreviousDisabled(){
       return this.currentPage===1;
    }
    get isNextDisabled(){
       return this.currentPage===this.totalPages;
    }
    updatePaginatedData(){
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedData=this.filteredData.slice(start,end);
    }
    onChangeSearchHandler(event){
        const value = event.target.value.toLowerCase();
        this.searchKey = value;
        this.applyAllFilters();
    }
    applyAllFilters() {

        let data = [...this.currencyData];

        if (this.searchKey) {
            data = data.filter(rec =>
                rec.currencyType?.toLowerCase().includes(this.searchKey) ||
                String(rec.currencyValue).toLowerCase().includes(this.searchKey)
            );
        }

        this.filteredData=data;
        this.currentPage=1;
        this.totalPages=Math.max(1, Math.ceil(this.filteredData.length/this.pageSize));
        this.updatePaginatedData();
    }
}