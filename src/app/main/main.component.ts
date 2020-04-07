import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { HttpMethods, IEndPoint, KeyValuePair, CommonHttpHeaders, MethodColor } from '../headers';
import { FormControl } from '@angular/forms';
import { IpcRenderer } from 'electron';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    constructor(
        public data: DataService,
    ) { }

    ipc: IpcRenderer = (window as any).require('electron').ipcRenderer;
    httpMethods = HttpMethods;
    httpHeaders = CommonHttpHeaders;

    response: {
        statusCode: number;
        statusMessage: string;
        headers: KeyValuePair[];
        body: string;
        httpVersion: string;
        timems: number;
    } = null;

    @ViewChild('previewIframe', { static: false }) previewIframe: ElementRef;




    ngOnInit() {
    }

    contentTypeChanged(ev) {
        this.data.selectedEndpoint.headers.forEach(e => {
            if (e.key.toLowerCase() === 'content-type') {
                e.value = ev.value;
            }
        });
        this.data.saveJson();
    }

    addHeader() {
        this.data.selectedEndpoint.headers.push({
            key: '',
            value: '',
            enable: true,
        } as KeyValuePair);
    }
    addParam() {
        this.data.selectedEndpoint.params.push({
            key: '',
            value: '',
            enable: true,
        } as KeyValuePair);
    }
    addCookie() {
        this.data.selectedEnvironment.cookies.push({
            key: '',
            value: '',
            enable: true,
        } as KeyValuePair);
    }
    addVariable() {
        this.data.selectedEnvironment.variables.push({
            key: '',
            value: '',
            enable: true,
        } as KeyValuePair);
    }

    removeHeader(key: string) {
        this.data.selectedEndpoint.headers = this.data.selectedEndpoint.headers.filter(e => e.key !== key);
        this.data.saveJson();
    }

    removeParam(key: string) {
        this.data.selectedEndpoint.params = this.data.selectedEndpoint.params.filter(e => e.key !== key);
        this.data.saveJson();
    }
    removeCookie(key: string) {
        this.data.selectedEnvironment.cookies = this.data.selectedEnvironment.cookies.filter(e => e.key !== key);
        this.data.saveJson();
    }
    removeVariable(key: string) {
        this.data.selectedEnvironment.variables = this.data.selectedEnvironment.variables.filter(e => e.key !== key);
        this.data.saveJson();
    }

    async send() {
        this.response = null;
        const gm = {
            setVariable: this.data.setVariable
        };

        eval(this.data.selectedEndpoint.preScript);

        const start = Date.now();
        let reqSrc = JSON.stringify(this.data.selectedEndpoint);
        for (const variable of this.data.selectedEnvironment.variables) {
            if (variable.enable) {
                reqSrc = reqSrc.replace(new RegExp(`\{\{${variable.key}\}\}`, 'g'), variable.value);
            }
        }
        console.log(reqSrc);
        const req: IEndPoint = JSON.parse(reqSrc);

        const cookies = this.data.getCookie();
        if (cookies) {
            req.headers.push({
                key: 'cookie',
                value: cookies,
                enable: true,
            });
        }
        const res = await this.ipc.invoke('send', req);

        // headers
        const headers = [];
        Object.keys(res.headers).forEach(e => {
            headers.push({ key: e, value: res.headers[e] });
        });

        this.response = {
            body: res.body,
            headers,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            timems: Math.floor(Date.now() - start),
            httpVersion: res.httpVersion,
        };

        if (res.headers['set-cookie']) {
            for (const cookie of res.headers['set-cookie']) {
                console.log(cookie);
                this.data.setCookie(cookie);
            }
        }

        this.setPreviewIframe();
        eval(this.data.selectedEndpoint.postScript);

        this.data.saveJson();
    }

    setPreviewIframe() {
        const e = document.querySelector('#previewIframe');
        if (this.response && this.response.body && e && (e as HTMLIFrameElement)?.contentDocument?.documentElement?.innerHTML) {
            (e as HTMLIFrameElement).contentDocument.documentElement.innerHTML = this.response.body;
        }
    }

    getStatusColor(statusCode: number) {
        if (statusCode >= 500) {
            return '#7C4DFF';
        } else if (statusCode >= 400) {
            return '#FF4081';
        } else if (statusCode >= 300) {
            return '#FF9800';
        } else if (statusCode >= 200) {
            return '#4CAF50';
        } else {
            return '#607D8B';
        }
    }

    onSelectEnvironment(envId: string) {
        this.data.selectedEnvironment = this.data.environments.find(e => e.environmentId === envId);
    }
}
