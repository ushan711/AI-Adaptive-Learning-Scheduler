# AI Adaptive Learning Scheduler

A comprehensive full-stack application designed to help A/L students manage their study time effectively through AI-powered intelligent scheduling.

## 🚀 Features

### Frontend (React TypeScript)
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Dashboard**: Comprehensive overview of study progress and upcoming sessions
- **Schedule Management**: Interactive calendar view with drag-and-drop functionality
- **Preferences**: Customizable study preferences and time slots
- **Real-time Analytics**: Progress tracking and performance insights
- **Feedback System**: AI-powered feedback collection and adaptation
- **Responsive Design**: Mobile-first design that works on all devices

### Backend (Firebase Functions)
- **AI Schedule Generation**: TensorFlow.js-powered intelligent scheduling
- **Secure API**: RESTful endpoints with Firebase Authentication
- **Real-time Database**: Firestore for scalable data storage
- **Analytics Engine**: Advanced progress tracking and reporting
- **Feedback Processing**: AI model training based on user feedback
- **Automated Tasks**: Scheduled functions for daily optimization

### AI Features
- **Adaptive Learning**: Schedules adapt based on user performance and feedback
- **Stress Level Analysis**: Monitors and adjusts based on stress indicators
- **Optimal Time Slots**: Identifies peak productivity hours
- **Subject Prioritization**: Dynamic priority adjustment based on deadlines and difficulty
- **Break Optimization**: Intelligent break scheduling for maximum effectiveness

## 🏗️ Architecture

### Project Structure
```
/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and Firebase services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Firebase Cloud Functions
│   └── functions/
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── logic/       # Business logic (AI, analytics)
│       │   ├── types/       # TypeScript types
│       │   └── utils/       # Utility functions
│       └── package.json
├── firebase.json            # Firebase configuration
├── firestore.rules          # Security rules
└── firestore.indexes.json   # Database indexes
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Firebase SDK** for authentication and data
- **date-fns** for date manipulation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Firebase Cloud Functions** (Node.js 18)
- **Firebase Firestore** for database
- **Firebase Authentication** for user management
- **TensorFlow.js** for AI/ML capabilities
- **Express.js** for API routing
- **TypeScript** for type safety

### Infrastructure
- **Firebase Hosting** for frontend deployment
- **Firebase Functions** for backend API
- **Firestore Security Rules** for data protection
- **Firebase Emulator Suite** for local development

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-adaptive-learning-scheduler
```

### 2. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Firebase config
```

### 4. Backend Setup
```bash
cd backend/functions
npm install
```

### 5. Environment Configuration
Create `.env` file in the frontend directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 Development

### Start Local Development
```bash
# Start Firebase emulators
firebase emulators:start

# In a new terminal, start frontend
cd frontend
npm run dev
```

### Build for Production
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Firebase
firebase deploy
```

## 🔐 Security

### Authentication
- Firebase Authentication with email/password and Google OAuth
- JWT token verification for all API endpoints
- User session management with automatic token refresh

### Data Protection
- Firestore security rules ensure users can only access their own data
- All API endpoints validate user authentication
- Sensitive data is encrypted at rest and in transit

### Privacy
- No personal data is shared with third parties
- User data is stored securely in Firebase
- GDPR compliant data handling practices

## 📊 AI Features

### Schedule Optimization
- **Machine Learning Model**: TensorFlow.js neural network for schedule optimization
- **Adaptive Learning**: Adjusts based on user performance and feedback
- **Stress Analysis**: Monitors stress levels and adjusts difficulty
- **Time Optimization**: Identifies peak productivity hours

### Feedback Processing
- **Real-time Adaptation**: Immediate schedule adjustments based on feedback
- **Pattern Recognition**: Identifies learning patterns and preferences
- **Difficulty Adjustment**: Dynamic content difficulty based on performance
- **Break Optimization**: Intelligent break scheduling

## 📈 Analytics

### Progress Tracking
- Study time tracking with detailed breakdowns
- Session completion rates and trends
- Subject-wise performance analysis
- Weekly and monthly progress reports

### Performance Insights
- Stress level monitoring and trends
- Productivity pattern identification
- Goal achievement tracking
- Personalized recommendations

## 🔧 API Endpoints

### Authentication
- All endpoints require Firebase Authentication token
- Bearer token in Authorization header

### Schedule Management
- `POST /api/schedule/generate` - Generate AI-optimized schedule
- `GET /api/schedule/user/:userId` - Get user's schedule
- `PUT /api/schedule/session/:sessionId` - Update study session
- `DELETE /api/schedule/session/:sessionId` - Delete study session

### Feedback & Analytics
- `POST /api/feedback` - Submit session feedback
- `GET /api/analytics/weekly/:userId` - Weekly progress report
- `GET /api/analytics/progress/:userId` - Overall progress stats

### Subject Management
- `GET /api/subjects/user/:userId` - Get user's subjects
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:subjectId` - Update subject
- `DELETE /api/subjects/:subjectId` - Delete subject

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for providing the backend infrastructure
- TensorFlow.js for AI/ML capabilities
- React community for the excellent ecosystem
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

---

**Happy Learning! 🎓**