import { Injectable } from '@angular/core';
import { ICollection, IEndPoint, KeyValuePair, IEnvironment } from './headers';
import { IpcRenderer } from 'electron';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    ipc: IpcRenderer = (window as any).require('electron').ipcRenderer;

    collections: ICollection[] = [];
    environments: IEnvironment[] = [];

    selectedEndpoint: IEndPoint = null;
    selectedCollection: ICollection = null;
    selectedEnvironment: IEnvironment = null;


    constructor() {
        this.loadJson().then(() => {
            this.selectedCollection = this.collections[0];
            this.selectedEndpoint = this.selectedCollection.endpoints[0];
        });
    }

    async saveJson() {
        await this.ipc.invoke('save', {
            collections: this.collections,
            environments: this.environments,
        });
    }

    async loadJson() {
        const obj: {
            collections: any,
            environments: any,
        } = await this.ipc.invoke('load');
        this.collections = obj.collections;
        this.environments = obj.environments;
        this.selectedEnvironment = this.environments[0];
    }

    setCookie(src: string) {
        const params = src.split(';').map(e => e.split('=').map(a => a.trim()));
        const cookie = {
            key: params[0][0],
            value: params[0][1],
            enable: true,
        };
        params.slice(1).forEach(b => {
            cookie[b[0]] = b[1];
        });
        console.log(cookie);

        // has same key
        for (let i = 0; i < this.selectedEnvironment.cookies.length; i++) {
            if (this.selectedEnvironment.cookies[i].key === cookie.key) {
                this.selectedEnvironment.cookies[i] = cookie;
                return;
            }
        }
        this.selectedEnvironment.cookies.push(cookie);
    }

    getCookie() {
        return this.selectedEnvironment.cookies
            .filter(e => e.enable)
            .map(e => `${e.key}=${e.value}`)
            .join('; ');
    }

    setVariable = (key: string, value: string) => {
        const variable = {
            key, value, enable: true,
        };
        for (let i = 0; i < this.selectedEnvironment.variables.length; i++) {
            if (this.selectedEnvironment.variables[i].key === key) {
                this.selectedEnvironment.variables[i] = variable;
                return;
            }
        }
        this.selectedEnvironment.variables.push(variable);
    }
}
