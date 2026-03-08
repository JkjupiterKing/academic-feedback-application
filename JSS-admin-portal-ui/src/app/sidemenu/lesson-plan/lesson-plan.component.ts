import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export interface Document {
  docId?: number;
  documentType: string;
  fileName: string;
  fileType: string;
  uploadDate?: Date;
  semester: string;
  documentCategory: string;
  documentPath: string;
}


interface Subject {
  id?: number;
  semester: string;
  subject: string;
  subjectCode: string;
  fileName?: string;
  uploadedDate?: string;
}

@Component({
  selector: 'app-lesson-plan',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './lesson-plan.component.html',
  styleUrl: './lesson-plan.component.css'
})
export class LessonPlanComponent {

  selectedSemesterInModal: string = ``;
  selectedDocumentCategory: string = `LessonPlan`;
  selectedSubjectInModal: string = ``;
  subjectsInModal: Subject[] = [];
  iaBankDocuments: any[] = [];
  loadingSubjectsInModal: boolean = false;

  constructor(private router: Router, private http: HttpClient) { }

  home() {
    this.router.navigate(['/sidemenu/home']);

  }
  timetable() {
    this.router.navigate(['/sidemenu/time-table']);

  }
  studentsmanagement() {
    this.router.navigate(['/sidemenu/students-management']);
  }
  newAttendancemanagement() {
    this.router.navigate(['/sidemenu/new-attendance-management']);
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
  logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginUser');
    localStorage.removeItem('userId');
    this.router.navigate(['/auth/login']);
  }
  personaldocuments() {

    this.router.navigate(['/sidemenu/personal-documents'])
  }
  staffmanagement() {
    this.router.navigate(['/sidemenu/staff-management'])
  }
  subjectmanagement() {
    this.router.navigate(['/sidemenu/subject-management'])
  }

  subjects: Subject[] = [];
  selectedSemester: string = '';
  selectedSubject: string = '';
  fileToUpload: File | null = null;
  showModal: boolean = false;
  lessonplandocuments: any[] = [];
  semesters: string[] = ['Sem1', 'Sem2', 'Sem3', 'Sem4', 'Sem5', 'Sem6'];
  selectedDocumentType = '';
  uploadDate: Date = new Date();
  loadingSemesters = false;
  loadingSubjects = false;
  submitting = false;
  uploadProgress = 0;
  uploadSuccess = false;
  errorMessage = '';

  // Assuming you have the user ID from your authentication system
  userId = 1; // Replace with actual user ID from your auth system

  private baseUrl = 'http://localhost:8080/api/subjects';

  onFileChange(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  onSemesterChange() {
    if (!this.selectedSemester) {
      this.subjects = [];
      return;
    }

    this.loadingSubjects = true;
    this.selectedSubject = '';
    this.subjects = [];

    this.http
      .get<Subject[]>(
        `${this.baseUrl}/semester/${this.selectedSemester.charAt(
          this.selectedSemester.length - 1
        )}`
      )
      .subscribe({
        next: (data) => {
          this.subjects = data;
          this.loadingSubjects = false;
        },
        error: (error) => {
          this.errorMessage = 'Error loading subjects';
          this.loadingSubjects = false;
        },
      });
  }


  uploadFile() {
    if (this.fileToUpload && this.selectedSemester && this.selectedDocumentCategory && this.selectedDocumentType) {
      const formData = new FormData();
      const fileType = this.fileToUpload.name.split('.').pop()?.toLowerCase();
      formData.append('file', this.fileToUpload);
      formData.append('fileName', this.fileToUpload.name);
      formData.append('semester', this.selectedSemester);
      formData.append('subject', this.selectedSubject.toString());
      formData.append('month', 'January');
      formData.append('documentCategory', this.selectedDocumentCategory);
      formData.append('documentType', this.selectedDocumentType);
      formData.append('fileType', fileType || 'unknown');
      formData.append('uploadDate', this.uploadDate.toISOString());
      formData.append('userEmail', 'admin@example.com');

      this.http.post<any>('http://localhost:8080/api/alldocuments/upload', formData)
        .subscribe({
          next: (response) => {
            alert('Lesson Plan uploaded successfully');
          },
          error: (error) => {
            alert('The lesson plan alredy exist, try to upload another file');
          }
        });
    } else {
      alert('Please select a file, semester, and document type');
    }
  }




  openFile(doc: any) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const fileType = doc.fileName.split('.').pop()?.toLowerCase();
    const viewUrl = `http://localhost:8080/api/alldocuments/viewFile/${doc.semester}/${doc.fileName}`;

    if (!isAuthenticated) {
      alert("You are not logged in. Please log in to access your files.");
      return;
    }

    // Handle different file types
    if (fileType === 'txt' || fileType === 'json' || fileType === 'pdf' ||
      ['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      window.open(viewUrl, '_blank');
    } else if (['doc', 'docx'].includes(fileType)) {
      // Embed Word document using Office Online
      const officeOnlineUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewUrl)}`;
      window.open(officeOnlineUrl, '_blank');
    } else if (['xls', 'xlsx'].includes(fileType)) {
      // Embed Excel document using Office Online
      const officeOnlineUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewUrl)}`;
      window.open(officeOnlineUrl, '_blank');
    } else if (['ppt', 'pptx'].includes(fileType)) {
      // Embed PowerPoint document using Office Online
      const officeOnlineUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewUrl)}`;
      window.open(officeOnlineUrl, '_blank');
    } else {
      alert("This file type is not supported for viewing.");
    }
  }


  viewQuestionBank() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;

  }

  getDocumentsBySemester() {
    if (this.selectedSemesterInModal) {
      this.http.get<any[]>(`http://localhost:8080/api/alldocuments/category/${this.selectedDocumentCategory}/${this.selectedSemesterInModal}`)
        .subscribe({
          next: (documents) => {
            this.lessonplandocuments = documents;
          },
          error: (error) => {
            alert('Error fetching documents');
          }
        });
    }
  }





  viewTextFile(doc: any) {
    this.http.get(doc.downloadUrl, { responseType: 'text' })
      .subscribe(content => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
  }


  viewPdf(doc: any) {
    window.open(doc.downloadUrl, '_blank');
  }


  viewImage(doc: any) {
    window.open(doc.downloadUrl, '_blank');
  }




  downloadFile(filename: string) {
    const url = `http://localhost:8080/viewFile/sem1/${filename}`;
    const fileType = filename.split('.').pop()?.toLowerCase();  // Get file type
    const headers = { 'Accept': fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream' };

    this.http.get(url, { responseType: 'blob', headers: headers }).subscribe(response => {
      const blob = new Blob([response], { type: `application/${fileType}` });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }, error => {
      console.error('Download failed', error);
    });
  }




  getDownloadLink(semester: string, fileName: string): string {

    return `http://localhost:8080/api/alldocuments/download/${semester}/${fileName}`;

  }
}








