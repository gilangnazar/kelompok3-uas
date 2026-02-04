# LMS Application (Kelompok 3 UAS)

A Learning Management System (LMS) mobile application built with React Native (Expo) and a Node.js/Express backend. This application allows students to enroll in courses, access materials, take quizzes, and view grades, while instructors can manage course content and assignments.

## Features

### Student
- **Dashboard:** Overview of enrolled courses and upcoming deadlines.
- **Course Management:** View course details, materials, and schedules.
- **Assignments & Quizzes:** Submit assignments and take timed quizzes.
- **Results:** View grades and feedback for submissions.
- **Profile:** Manage user profile information.

### Instructor
- **Dashboard:** Overview of active courses.
- **Course Management:** Create and manage course content (Materials, Assignments).
- **Grading:** Review student submissions and assign scores.
- **Schedule:** Manage class schedules and attendance.

## Student User Flow (Walkthrough)

Here is a step-by-step guide to testing the student features:

1.  **Login:**
    - Open the app and log in using a student account:
      - **Email:** `joko@lms.test` or `siti@lms.test`
      - **Password:** `password123`

2.  **Dashboard:**
    - Upon login, you will see the **Dashboard**.
    - This screen displays a summary of your activities, enrolled courses, and upcoming deadlines.

3.  **View Courses:**
    - Navigate to the **"Courses"** tab/menu.
    - You will see a list of all courses you are currently enrolled in.
    - Click on a course card to enter the **Course Detail** page.

4.  **Course Details:**
    - Inside a course, you can switch between tabs:
      - **Schedule:** View upcoming class sessions.
      - **Material:** Access learning materials uploaded by the instructor.
      - **Assignment:** View list of assignments and quizzes.

5.  **Take a Quiz:**
    - Go to the **Assignment** tab within a course.
    - Select an assignment labeled as **"Quiz"**.
    - You will see the **Quiz Detail** screen. If you haven't taken it yet, click **"Take Quiz"** (or "Kerjakan Quiz").
    - The **Quiz Ready** screen will appear with a summary and rules. Click to start.
    - Answer the questions and submit your attempt.

6.  **View Results:**
    - After submission, you will see your **Score** and a pass/fail status.
    - Click **"See Detail"** to review your answers.
    - This view shows each question, your selected answer, and the correct answer.

7.  **Download Result:**
    - On the detailed result page, click the **Download icon** (top right).
    - Select **PDF** to download a detailed report of your quiz result.

8.  **Profile & Logout:**
    - Navigate back to the main navigation and select the **"Profile"** tab.
    - View your user details.
    - Click **"Logout"** to exit the application.

## Instructor User Flow (Walkthrough)

Here is a step-by-step guide to testing the instructor features:

1.  **Login:**
    - Open the app and log in using the instructor account:
      - **Email:** `budi@lms.test`
      - **Password:** `password123`

2.  **Dashboard:**
    - You will see the **Instructor Dashboard** with:
      - Quick stats (Active Courses, Attendance, Avg Score).
      - **"Needs Grading"** alert box.
      - **Quick Actions** (New Task, Material, etc.).
      - **Grading Queue** and **Teaching Schedule**.
    - Click **"Course(s)"** in the bottom navigation to view your courses.

3.  **Manage Course:**
    - Select a course from the list (e.g., "Pemrograman Web").
    - You will see tabs for **Schedule**, **Material**, and **Assignment**.

4.  **Create Quiz:**
    - Go to the **Assignment** tab.
    - Click the **"Add Assignment"** button (or "New Task" from Dashboard).
    - In the form:
      - **Type:** "Quiz" is selected by default (Assignment type is currently disabled).
      - **Details:** Enter Title, Description, Duration (minutes), Due Date, and Time.
      - **Questions:** Use the builder to add questions, options, and mark the correct answer.
    - Click **"Publish Assignment"** to save.

5.  **View Quiz & Results:**
    - Back in the Course Detail > Assignment tab, click the newly created quiz.
    - You will see the **Quiz Detail** page with a summary of submissions.
    - Click **"View Student Scores"** to see a list of students who have taken the quiz.

6.  **Download Reports:**
    - On the **Score List** screen:
      - Click the **Download icon** (top right).
      - Choose **PDF** or **Excel** to download the class grade sheet.
    - Click on a **Student's Name** to view their specific attempt details.
    - On the **Student Result** screen (individual view), you can also click the **Download icon** to save their specific answer sheet as a PDF.

7.  **Edit/Delete Quiz:**
    - Return to the **Quiz Detail** page.
    - You can use the **Edit** (pencil) or **Delete** (trash) icons in the header.
    - **Note on Editing:** You *cannot* update the questions of a quiz if students have already attempted it (to preserve data integrity). You will receive an error message if you try.

8.  **Profile & Logout:**
    - Navigate to the **"Profile"** tab.
    - Click **"Logout"** to exit.

## Prerequisites

Before setting up the project, ensure you have the following installed:
- **Node.js** (LTS version recommended)
- **XAMPP** or **Laragon** (for MySQL Database)
- **Git**
- **Expo Go** app on your mobile device (Android/iOS) for testing.

## Installation & Setup

Follow these steps to get the project running locally.

### 1. Clone and Extract
1. Download the project ZIP or clone the repository:
   ```bash
   git clone https://github.com/gilangnazar/kelompok3-uas.git
   ```
2. Extract the files to your desired directory.

### 2. Install Dependencies
**Frontend (Root Directory):**
Open a terminal in the project root folder and run:
```bash
npm install
```

**Backend:**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```

### 3. Database Setup
1. Open **XAMPP** or **Laragon** and start **Apache** and **MySQL**.
2. Open your browser and go to `http://localhost/phpmyadmin`.
3. Click **Import** in the top menu.
4. Click **Choose File** and select the `database/init.sql` file located in the project folder.
5. Click **Go** to execute the SQL script. This will create the database, tables, and seed it with initial data.

### 4. Configuration
You need to point the frontend application to your local backend server.

1. Open a command prompt (`cmd`) and type:
   ```bash
   ipconfig
   ```
2. Copy your **IPv4 Address** (e.g., `192.168.1.5`).
3. Open the file `config/api.ts` in your code editor.
4. Update the `API_URL` with your IP address:
   ```typescript
   export const API_URL = 'http://<YOUR_IPV4_ADDRESS>:3000';
   ```
   *Example: `export const API_URL = 'http://192.168.1.10:3000';`*

### 5. Running the Application

**Step 1: Start the Backend**
Open the terminal where you are inside the `backend` folder and run:
```bash
node index.js
```
*You should see a message indicating the server is running on port 3000.*

**Step 2: Start the Frontend**
Open a **new** terminal window, navigate to the **root** project directory, and run:
```bash
npx expo start
```
*Or `npm start`.*

**Step 3: Launch on Device**
1. Scan the QR code displayed in the terminal using the **Expo Go** app (Android) or Camera app (iOS).
2. The app will bundle and load on your phone.

## Default Accounts (Login)

You can use the following default credentials to test the application (from `init.sql`):

| Role | Email | Password |
|------|-------|----------|
| **Instructor** | `budi@lms.test` | `password123` |
| **Student** | `siti@lms.test` | `password123` |
| **Student** | `joko@lms.test` | `password123` |
| **Admin** | `admin@lms.test` | `admin123` |

*Note: New users registering via the app will default to the **Student** role.*

## Project Structure

- **app/**: Main React Native/Expo application code (Screens, Components, Navigation).
- **backend/**: Node.js Express server, API routes, and Database connection.
- **config/**: Global configuration files (API URL).
- **database/**: SQL initialization scripts.
- **assets/**: Images and static resources.

## Troubleshooting

- **Connection Error:** Ensure your phone and computer are on the **same Wi-Fi network**.
- **Database Error:** Ensure MySQL is running in XAMPP/Laragon and the `lms` database was imported correctly.
- **API Issues:** Double-check the IPv4 address in `config/api.ts`. It must match your computer's local IP.

## Demonstration Video

Watch the application walkthrough here: [Google Drive Link](https://drive.google.com/drive/folders/1rwM8FFw0FQg9pnIDaQ7b2ceLppmuSI8Q?usp=sharing)