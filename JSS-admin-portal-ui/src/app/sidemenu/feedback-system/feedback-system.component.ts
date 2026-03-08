import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-feedback-system',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './feedback-system.component.html',
  styleUrl: './feedback-system.component.css'
})
export class FeedbackSystemComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) { }

  // ── Sidebar navigation ──────────────────────────────────────────────────────
  home() { this.router.navigate(['/sidemenu/home']); }
  timetable() { this.router.navigate(['/sidemenu/time-table']); }
  studentsmanagement() { this.router.navigate(['/sidemenu/students-management']); }
  newAttendancemanagement() { this.router.navigate(['/sidemenu/new-attendance-management']); }
  questionbank() { this.router.navigate(['/sidemenu/question-bank']); }
  iamodule() { this.router.navigate(['/sidemenu/ia-module']); }
  feedbacksystem() { this.router.navigate(['/sidemenu/feedback-system']); }
  lessonplan() { this.router.navigate(['/sidemenu/lesson-plan']); }
  teachingaids() { this.router.navigate(['/sidemenu/teaching-aids']); }
  personaldocuments() { this.router.navigate(['/sidemenu/personal-documents']); }
  staffmanagement() { this.router.navigate(['/sidemenu/staff-management']); }
  subjectmanagement() { this.router.navigate(['/sidemenu/subject-management']); }
  logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginUser');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }

  // ── Feedback list state ──────────────────────────────────────────────────────
  feedbacks: any[] = [];
  feedbackQuestions: any[] = [];
  paginatedFeedbacks: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  showTable: boolean = true;
  showAddForm: boolean = false;
  highlightedFeedbacks: any[] = [];

  // ── View-mode toggle ──────────────────────────────────────────────────────────
  viewMode: 'all' | 'questions' | 'responses' = 'all';
  groupedResponses: any[] = [];  // student responses grouped under their question

  // ── Subject / Semester data ──────────────────────────────────────────────────
  semesters: number[] = [1, 2, 3, 4, 5, 6];
  allSubjects: any[] = [];
  filteredSubjects: any[] = [];

  // ── "Create Feedback Question" modal fields ──────────────────────────────────
  newFeedbackQuestion: string = '';
  selectedSemester: number | null = null;
  selectedSubjectId: number | null = null;
  selectedSubjectName: string = '';
  starRating: number = 0;
  hoverRating: number = 0;

  // ── Filter / view state ──────────────────────────────────────────────────────
  filterSemester: number | null = null;
  filterSubjectId: number | null = null;
  filterSubjects: any[] = [];

  ngOnInit(): void {
    this.fetchFeedback();
    this.loadAllSubjects();
  }

  isUserRole(roleId: number): boolean {
    return this.user.roleId === roleId;
  }

  // ── Load subjects from backend ───────────────────────────────────────────────
  loadAllSubjects(): void {
    this.http.get<any[]>('http://localhost:8080/api/subjects').subscribe(
      (data) => { this.allSubjects = data; },
      (error) => { console.error('Error loading subjects:', error); }
    );
  }

  onSemesterChange(): void {
    this.selectedSubjectId = null;
    this.selectedSubjectName = '';
    if (this.selectedSemester) {
      this.filteredSubjects = this.allSubjects.filter(
        s => s.semester == this.selectedSemester
      );
    } else {
      this.filteredSubjects = [];
    }
  }

  onSubjectChange(): void {
    const found = this.allSubjects.find(s => s.id == this.selectedSubjectId);
    this.selectedSubjectName = found ? found.subject : '';
  }

  onFilterSemesterChange(): void {
    this.filterSubjectId = null;
    if (this.filterSemester) {
      this.filterSubjects = this.allSubjects.filter(
        s => s.semester == this.filterSemester
      );
    } else {
      this.filterSubjects = [];
    }
    this.applyFilters();
  }

  onFilterSubjectChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let source = this.feedbacks;

    // View-mode filter
    if (this.viewMode === 'questions') {
      source = source.filter(f => f.type === 'Question' || f.addedBy === 'Admin');
    } else if (this.viewMode === 'responses') {
      source = source.filter(f => f.type === 'Response' || f.addedBy === 'Student');
    }

    if (this.filterSemester) {
      source = source.filter(f => f.semester == this.filterSemester);
    }
    if (this.filterSubjectId) {
      const subj = this.allSubjects.find(s => s.id == this.filterSubjectId);
      if (subj) {
        source = source.filter(f => f.subject === subj.subject);
      }
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      source = source.filter(f => f.question?.toLowerCase().includes(term));
    }
    this.currentPage = 1;
    this.totalPages = Math.ceil(source.length / this.pageSize);
    this.paginatedFeedbacks = source.slice(0, this.pageSize);
    this.highlightedFeedbacks = source;

    // Build grouped responses for the "responses" view
    this.buildGroupedResponses();
  }

  setViewMode(mode: 'all' | 'questions' | 'responses'): void {
    this.viewMode = mode;
    this.currentPage = 1;
    this.applyFilters();
  }

  buildGroupedResponses(): void {
    // Get all admin questions to act as parents
    const adminQuestions = this.feedbacks.filter(f => f.type === 'Question' || f.addedBy === 'Admin');
    // Get all student responses
    let studentResponses = this.feedbacks.filter(f => f.type === 'Response' || f.addedBy === 'Student');

    // Apply semester/subject/search filters on student responses too
    if (this.filterSemester) {
      studentResponses = studentResponses.filter(f => f.semester == this.filterSemester);
    }
    if (this.filterSubjectId) {
      const subj = this.allSubjects.find(s => s.id == this.filterSubjectId);
      if (subj) {
        studentResponses = studentResponses.filter(f => f.subject === subj.subject);
      }
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      studentResponses = studentResponses.filter(f => f.question?.toLowerCase().includes(term));
    }

    // Group responses by question text
    const grouped: { [key: string]: any } = {};
    for (const resp of studentResponses) {
      const qText = resp.question || 'Unknown Question';
      if (!grouped[qText]) {
        // Try to find the parent question to get semester/subject
        const parent = adminQuestions.find(q => q.question === qText);
        grouped[qText] = {
          question: qText,
          semester: resp.semester || parent?.semester || null,
          subject: resp.subject || parent?.subject || null,
          starRating: resp.starRating || parent?.starRating || null,
          responses: []
        };
      }
      grouped[qText].responses.push(resp);
    }
    this.groupedResponses = Object.values(grouped);
  }

  isResponse(feedback: any): boolean {
    return feedback.type === 'Response' || feedback.addedBy === 'Student';
  }

  isQuestion(feedback: any): boolean {
    return feedback.type === 'Question' || feedback.addedBy === 'Admin';
  }

  // ── Star rating helpers ──────────────────────────────────────────────────────
  setRating(star: number): void { this.starRating = star; }
  setHover(star: number): void { this.hoverRating = star; }
  clearHover(): void { this.hoverRating = 0; }
  getStarArray(): number[] { return [1, 2, 3, 4, 5]; }

  // ── Fetch all feedbacks ──────────────────────────────────────────────────────
  fetchFeedback(): void {
    this.http.get<any[]>('http://localhost:8080/feedback/all').subscribe(
      (data) => {
        this.feedbacks = data;
        this.totalPages = Math.ceil(this.feedbacks.length / this.pageSize);
        this.updatePagination();
      },
      (error) => { console.error('Error fetching feedback:', error); }
    );
  }

  // ── Add feedback question (with semester, subject, star rating) ──────────────
  addFeedbackQuestion(): void {
    if (!this.newFeedbackQuestion.trim()) {
      alert('Please enter a feedback question.');
      return;
    }
    if (!this.selectedSemester) {
      alert('Please select a semester.');
      return;
    }
    if (!this.selectedSubjectId) {
      alert('Please select a subject.');
      return;
    }
    if (this.starRating === 0) {
      alert('Please provide a star rating.');
      return;
    }

    const feedback = {
      question: this.newFeedbackQuestion,
      answer: 'Not Applicable for Admin',
      addedBy: 'Admin',
      type: 'Question',
      username: 'Admin',
      semester: this.selectedSemester,
      subject: this.selectedSubjectName,
      starRating: this.starRating
    };

    this.http.post('http://localhost:8080/feedback/addFeedback', feedback).subscribe(
      () => {
        alert('Feedback question added successfully');
        this.resetModal();
        this.fetchFeedback();
        // Close Bootstrap modal programmatically
        const modalEl = document.getElementById('feedbackModal');
        if (modalEl) {
          const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }
      },
      (error) => {
        console.error('Error adding feedback question:', error);
        alert('There was a problem adding the feedback question');
      }
    );
  }

  resetModal(): void {
    this.newFeedbackQuestion = '';
    this.selectedSemester = null;
    this.selectedSubjectId = null;
    this.selectedSubjectName = '';
    this.starRating = 0;
    this.hoverRating = 0;
    this.filteredSubjects = [];
  }

  displayManageFeedbacks(): void {
    this.showAddForm = false;
    this.showTable = true;
    this.fetchFeedback();
  }

  performSearch(): void {
    this.applyFilters();
  }

  updatePagination(): void {
    const source = this.highlightedFeedbacks.length > 0 ? this.highlightedFeedbacks : this.feedbacks;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedFeedbacks = source.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getStarDisplay(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
