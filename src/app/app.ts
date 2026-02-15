import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class App {
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('language') || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang);

    // Save language selection changes
    this.translate.onLangChange.subscribe((event) => {
      localStorage.setItem('language', event.lang);
    });
  }
}
