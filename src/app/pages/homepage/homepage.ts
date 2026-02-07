import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './homepage.html',
    styleUrl: './homepage.css'
})
export class Homepage {
    mobileMenuOpen = false;

    features = [
        {
            icon: 'fa-chart-line',
            title: 'Real-time Analytics',
            description: 'Gain deep insights into your inventory performance. Track sales velocity, profit margins, and forecast demand with AI-powered precision.'
        },
        {
            icon: 'fa-robot',
            title: 'Automated Workflows',
            description: 'Set triggers for low stock alerts and auto-generate purchase orders.'
        },
        {
            icon: 'fa-warehouse',
            title: 'Multi-warehouse Sync',
            description: 'Synchronize stock across unlimited locations instantly.'
        },
        {
            icon: 'fa-plug',
            title: 'Seamless Integrations',
            description: 'Connect with Shopify, Amazon, WooCommerce, and more in just a few clicks.'
        }
    ];

    brands = ['LuxeWear', 'VoltEnergy', 'GreenLife', 'StarTech', 'PureFlow'];
}
