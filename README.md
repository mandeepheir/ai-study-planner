# AI Study Planner 🎓

An Angular-based study planning application that helps students organize tasks, track their progress, manage deadlines, and generate structured study plans based on available study hours and task priorities.

## ✨ Features

- **Task Management:** Create, complete, and delete study tasks.
- **Progress Dashboard:** View task statistics and completion progress.
- **Deadline Tracking:** Identify upcoming study deadlines.
- **Study Plan Generator:** Generate structured study sessions based on available hours and task priorities.
- **Progress Visualization:** View study statistics through charts.
- **Firebase Integration:** Integrate Firebase and Firestore for application data management.
- **Responsive Interface:** Navigate the application's study planning features through a structured interface.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Angular | Frontend framework |
| TypeScript | Application logic |
| HTML & CSS | User interface and styling |
| Node.js | Backend runtime |
| Express.js | Backend API |
| Firebase | Application services |
| Cloud Firestore | Data storage |
| ApexCharts | Dashboard visualizations |

## 🧠 How the Study Plan Generator Works

The current study plan generator uses **JavaScript-based rules** to organize study tasks.

It considers available study hours, task priorities, deadlines, and task categories to build a structured plan. Study sessions are limited to 45 minutes, with 10-minute breaks between sessions where applicable.

The current implementation uses rule-based scheduling rather than a generative AI model.

## 📸 Application Pages

- **Home:** Main application interface.
- **Planner:** Manage study tasks.
- **Dashboard:** Review task statistics and progress.
- **Progress:** Monitor study completion.
- **AI Suggestions:** Generate structured study plans.

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm
- [Angular CLI](https://angular.dev/tools/cli)
- A Firebase project configured for the application

### 1. Clone the repository

```bash
git clone https://github.com/mandeepheir/ai-study-planner.git
cd ai-study-planner
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure Firebase

Configure your Firebase project and provide the required Firebase configuration using the setup expected by the application.

Do not commit private credentials, service-account keys, or environment files containing secrets.

### 4. Start the Angular application

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### 5. Start the backend

Open a second terminal from the project root and run:

```bash
node ai-backend/server.js
```

The backend is expected to listen on port `3000`, according to the current local API configuration.

If the backend requires environment variables, configure them before starting it.

### 6. Build for production

```bash
npm run build
```

## 📁 Project Structure

```text
ai-study-planner/
├── ai-backend/
│   └── server.js
├── src/
│   └── app/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── app.ts
│       ├── app.html
│       └── app.css
├── angular.json
├── package.json
└── README.md
```

*Note: The structure above is a simplified overview. Actual filenames and folders may differ slightly.*

## 🔒 Security Notes

- Keep private credentials out of GitHub.
- Configure Firebase Authentication and Firestore security rules appropriately.
- Restrict backend access using suitable CORS settings.
- Use environment-specific API URLs for local development and production.

## 🎯 Project Goals

This project demonstrates practical experience with:

- Angular components and application structure
- TypeScript and frontend development
- Backend API integration
- Firebase and Firestore integration
- Data visualization
- Rule-based scheduling logic
- Git and GitHub version control

## 👨‍💻 Author

**Mandeep Singh**

GitHub: [@mandeepheir](https://github.com/mandeepheir)

---

Built as a hands-on project to strengthen full-stack web development skills.
