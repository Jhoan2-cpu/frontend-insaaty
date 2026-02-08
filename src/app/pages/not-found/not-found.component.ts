import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './not-found.html'
})
export class NotFoundComponent { }
