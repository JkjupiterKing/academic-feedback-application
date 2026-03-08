import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    constructor(private router: Router) { }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('loginUser');
            localStorage.removeItem('userId');
            this.router.navigate(['/auth/login']);
        }
    }
}
