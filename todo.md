# English Learning App - Project TODO

## Database & Schema
- [x] Design database schema (students, teachers, sentences, scores, play history)
- [x] Create Drizzle ORM schema tables
- [x] Push database migrations

## Backend API & Procedures
- [x] Create database helper functions for student, teacher, and sentence management
- [x] Create tRPC procedures for student operations (profile, scores, daily limit check)
- [x] Create tRPC procedures for teacher operations (approve students, view reports)
- [x] Create tRPC procedures for sentence management
- [x] Create tRPC procedures for score recording and play sessions

## Authentication & User Management
- [x] Implement Google OAuth login in frontend
- [x] Create student registration flow (name, grade level selection)
- [x] Create teacher registration and role assignment
- [x] Set teacher roles for niiskandar@gmail.com and halimahsemathong@gmail.com (via database)
- [x] Implement user approval system (teachers approve students)
- [x] Create protected UI routes for student and teacher

## Frontend Pages
- [x] Create Login page
- [x] Create Register page for students
- [x] Create Waiting for Approval page
- [x] Create Student Dashboard
- [x] Create Teacher Dashboard
- [x] Create Lesson page with sentence display and recording
- [x] Create Score History page

## Teacher Dashboard
- [x] Create teacher dashboard layout
- [x] Implement student approval/rejection functionality
- [x] Create student reports page (view all students' scores and progress)
- [x] Add filtering and sorting for student reports

## Sentence Management
- [x] Create sentence database with grade levels (ม1-ม6)
- [x] Implement random sentence selection logic
- [x] Filter sentences by grade level
- [x] Exclude sentences with score > 80 from random selection

## Student Learning Page
- [x] Create sentence display page with English and Thai meaning
- [x] Implement audio recording functionality
- [x] Add 3 random sentences per session
- [x] Implement sentence navigation (previous/next)
- [x] Integrate speech analysis and score display
- [x] Show score result dialog with feedback

## Voice Analysis Integration
- [x] Integrate Manus API for speech analysis
- [x] Send recorded audio to Manus API
- [x] Parse Manus API response for score and feedback
- [x] Display score, feedback (in Thai), and comments to student
- [x] Save scores to database

## Daily Limit & History
- [x] Implement daily play limit (2 times per day) - backend ready
- [x] Create play session tracking - backend ready
- [x] Create student score history page
- [x] Display historical scores with dates and details

## UI/UX Design
- [x] Design professional and modern UI layout
- [x] Create responsive design for mobile and desktop
- [x] Implement navigation structure
- [x] Add loading states and error handling
- [x] Add success/feedback messages
- [x] Polish visual design and typography
- [x] Add Google Fonts (Prompt, Inter)
- [x] Create professional CSS components
- [x] Implement smooth transitions and animations

## Seed Data
- [x] Create seed data script with 60 sample sentences (10 per grade level)
- [x] Create comprehensive example sentences for all grade levels (ม.1-ม.6) - 90 sentences total
- [x] Create seed-db.mjs script to add sentences to database
- [x] Import sentences from seed-db.mjs into MySQL database - 90 sentences successfully inserted

## Bug Fixes
- [x] Fix missing useAuth import in all pages (Login, Register, WaitingApproval, ScoreHistory, Lesson, TeacherDashboard, StudentDashboard)
- [x] Fix audio recording and playback issues (proper object URL cleanup with useMemo)
- [x] Fix timezone handling for daily limits (use UTC date strings)
- [x] Fix API Mutation Error - Removed duplicate useAuth import from StudentDashboard
- [x] Fix "Only teachers can access this" error on Home page - Added missing useAuth import to TeacherDashboard
- [x] Fix daily limit bypass - Added button disable state and server-side validation to prevent multiple session creation
- [x] Fix HTML response instead of JSON error on /dashboard - Added error handling middleware
- [ ] Fix loading state handling
- [ ] Fix error handling in API calls
- [ ] Fix responsive design issues

## Testing & Deployment
- [ ] Test authentication flow
- [ ] Test student learning flow
- [ ] Test teacher approval system
- [ ] Test score recording and history
- [ ] Test daily limit enforcement
- [ ] Create checkpoint for deployment
