import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  // Corrected from 'styleUrl' to 'styleUrls'
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
    role: 'Admin'
  };

  remember: boolean = false;
  showPassword: boolean = false;
  currentTheme: string = 'light';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.applyTheme('dark');
    }
  }

  applyTheme(theme: string) {
    const el = document.documentElement;
    if (theme) {
      el.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      this.currentTheme = theme;
    } else {
      el.removeAttribute('data-theme');
      localStorage.removeItem('theme');
      this.currentTheme = 'light';
    }
  }

  setTheme(theme: string) { this.applyTheme(theme); }

  onLoginSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter email and password.');
      return;
    }

    console.log('Logging in with:', this.loginData);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('http://localhost:8080/users/login', this.loginData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Login successful:', response);

          // If API returns user object or token, adapt accordingly
          const userId = response?.id || response?.userId || null;

          if (userId) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('loginUser', this.loginData.email);
            localStorage.setItem('userId', userId.toString());

            this.router.navigate(['/sidemenu/home']);
          } else {
            console.error('Login response missing user ID');
            alert('Login failed. Please try again.');
          }
        },
        (error) => {
          console.error('Login failed:', error);
          if (error.status === 401) {
            alert('Invalid credentials');
          } else if (error.status === 0) {
            alert('Cannot connect to server. Please check if the backend is running.');
          } else {
            alert('An error occurred. Please try again later.');
          }
        }
      );
  }

  onRegister() {
    this.router.navigate(['/auth/register']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onHelp() {
    // Help functionality
    alert('Need help? Contact our support team at support@jss-admin.com');
  }
}
