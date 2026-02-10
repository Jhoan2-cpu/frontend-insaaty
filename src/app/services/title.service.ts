import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TitleService {
    private titleSource = new BehaviorSubject<string>('');
    currentTitle = this.titleSource.asObservable();

    constructor() { }

    setTitle(titleKey: string) {
        this.titleSource.next(titleKey);
    }
}
