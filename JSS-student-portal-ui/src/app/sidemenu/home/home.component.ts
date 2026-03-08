import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  staffMembers: any[] = [];
  images: string[] = [
    '/pic1.jpg',
    '/pic2.jpg',
    '/pic3.jpg',
    '/college.jpg'
  ]; // Add your image paths here

  // ngOnInit(): void {

  //   console.log('Username:', this.username);
  // }
  newAttendancemanagement() {
    this.router.navigate(['/sidemenu/new-attendance-management']);
  }

  home() {
    this.router.navigate(['/sidemenu/home']);
  }
  timetable() {
    this.router.navigate(['/sidemenu/time-table']);
  }
  // studentsmanagement(){
  //   this.router.navigate(['/sidemenu/students-management']);
  // }
  attendancemanagement() {
    this.router.navigate(['/sidemenu/attendance-management']);
  }
  questionbank() {
    this.router.navigate(['/sidemenu/question-bank']);
  }
  iamodule() {
    this.router.navigate(['/sidemenu/ia-module']);
  }
  feedbacksystem() {
    this.router.navigate(['/sidemenu/feedback-system']);
  }
  lessonplan() {
    this.router.navigate(['/sidemenu/lesson-plan']);
  }
  teachingaids() {
    this.router.navigate(['/sidemenu/teaching-aids']);
  }
  // personaldocuments(){
  //   this.router.navigate(['/sidemenu/personal-documents'])
  // }
  // staffmanagement(){
  //   this.router.navigate(['/sidemenu/staff-management'])
  // }
  logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('Semester');
    this.router.navigate(['/auth/login']);
  }
  isSidebarOpen: boolean = true;
  username: string | null = localStorage.getItem('username');
  loggedInStudent: any;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    console.log('Username:', this.username);

    // Check if username exists, if not use mock data immediately
    if (!this.username) {
      this.useMockData();
      return;
    }

    this.http
      .get<any>(
        `http://localhost:8080/users/student1?userName=${this.username}`
      )
      .subscribe({
        next: (data) => {
          console.log('Logged-in student data:', data);
          if (data) {
            this.loggedInStudent = data;
          } else {
            this.useMockData();
          }
        },
        error: (error) => {
          console.error('Error fetching logged-in student:', error);
          this.useMockData();
        }
      });
  }

  useMockData() {
    this.loggedInStudent = {
      userName: this.username || 'Student Name',
      regno: 'STU123456',
      email: 'student@example.com',
      phoneno: '9876543210',
      address: 'JSS Polytechnic Campus, Mysore',
      dept: 'Computer Science',
      semester: '5'
    };
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
