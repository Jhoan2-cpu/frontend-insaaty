import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './homepage.html',
    styleUrl: './homepage.css'
})
export class Homepage {
    mobileMenuOpen = false;
    currentLang = 'es';

    constructor(private translate: TranslateService) {
        // Establecer español como idioma por defecto
        this.translate.setDefaultLang('es');
        this.translate.use('es');
        this.currentLang = this.translate.currentLang || 'es';
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
        this.currentLang = lang;
    }

    scrollTo(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    features = [
        {
            icon: 'fa-file-pdf',
            titleKey: 'FEATURES.ANALYTICS_TITLE',
            descKey: 'FEATURES.ANALYTICS_DESC'
        },
        {
            icon: 'fa-history',
            titleKey: 'FEATURES.WORKFLOWS_TITLE',
            descKey: 'FEATURES.WORKFLOWS_DESC'
        },
        {
            icon: 'fa-tachometer-alt',
            titleKey: 'FEATURES.WAREHOUSE_TITLE',
            descKey: 'FEATURES.WAREHOUSE_DESC'
        },
        {
            icon: 'fa-truck',
            titleKey: 'FEATURES.INTEGRATIONS_TITLE',
            descKey: 'FEATURES.INTEGRATIONS_DESC'
        }
    ];

    brands = ['LuxeWear', 'VoltEnergy', 'GreenLife', 'StarTech', 'PureFlow'];
}
