import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[appClickSelect]'
})
export class ClickSelectDirective {
    constructor(el: ElementRef) {
        (el.nativeElement as HTMLElement).addEventListener('click', ev => {
            (el.nativeElement as HTMLInputElement).select();
        });
    }
}
