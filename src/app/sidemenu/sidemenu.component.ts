import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DataService } from '../data.service';
import { MethodColor, IEndPoint } from '../headers';

@Component({
    selector: 'app-sidemenu',
    templateUrl: './sidemenu.component.html',
    styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit {

    constructor(
        public data: DataService
    ) { }

    methodColor = MethodColor;
    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;

    contextMenuPosition = { x: '0px', y: '0px' };

    onContextMenu(event: MouseEvent, endpoint: IEndPoint) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { endpoint };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
    }

    onContextMenuDelete(endpoint: IEndPoint) {
        this.data.selectedCollection.endpoints = this.data.selectedCollection.endpoints.filter(e => e.requestId !== endpoint.requestId);
        if (this.data.selectedEndpoint.requestId === endpoint.requestId) {
            this.data.selectedEndpoint = null;
        }
        this.data.saveJson();
    }

    ngOnInit() {
    }

    onSelectionChange(collectionId: string) {
        this.data.selectedCollection = this.data.collections.find(e => e.collectionId === collectionId);
    }

    onSelectEndpoint(endpointId: string) {
        this.data.selectedEndpoint = this.data.selectedCollection.endpoints.find(e => e.requestId === endpointId);
    }

    addEndpoint() {
        this.data.selectedCollection.endpoints.push({
            method: 'GET',
            url: '',
            headers: [],
            params: [],
            name: '',
            requestId: this.generateId(10),
            postScript: '',
            preScript: '',
            body: ''
        });
    }

    addCollection() {
        this.data.collections.push({
            collectionId: this.generateId(10),
            name: 'no name',
            endpoints: [],
        });
        this.data.saveJson();
    }

    generateId(n: number) {
        let result = '';
        const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < n; i++) {
            result += str[Math.floor(Math.random() * str.length)];
        }
        return result;
    }

}
