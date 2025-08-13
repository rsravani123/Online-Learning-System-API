# 🎓 Online Learning System - Setup Instructions

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/online-learning-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB:**
   ```bash
   # Windows (if MongoDB is installed as service)
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   # OR
   brew services start mongodb-community
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will start on http://localhost:5000

### 2. Frontend Setup

1. **Navigate to the project root:**
   ```bash
   cd ..
   ```

2. **Install frontend dependencies:**
   ```bash
   # You may need to run PowerShell as Administrator or change execution policy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend:**
   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

## 🔧 Development Workflow

### Running Both Services

1. **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   npm start
   ```

## 🎯 Demo Accounts

The system comes with demo credentials for testing:

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@demo.com | Password123 |
| **Instructor** | instructor@demo.com | Password123 |
| **Admin** | admin@demo.com | Password123 |

## 🛠️ Development Commands

### Backend Commands
```bash
cd server
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

### Frontend Commands
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (not recommended)
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Courses
- `GET /api/courses` - Get all courses (with search/pagination)
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `POST /api/courses/:id/enroll` - Enroll in course (student)
- `POST /api/courses/:id/unenroll` - Unenroll from course (student)
- `POST /api/courses/:id/reviews` - Add review (student)
- `GET /api/courses/instructor/my-courses` - Get instructor's courses
- `GET /api/courses/student/enrolled` - Get enrolled courses

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/courses` - Get all courses (admin view)
- `GET /api/admin/stats` - Get dashboard statistics

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 12 rounds
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Sanitizes all inputs
- **CORS Protection** - Configurable origins
- **Security Headers** - Helmet.js integration
- **Role-Based Access** - Proper authorization

## 🎨 Frontend Features

- **Responsive Design** - Works on all devices
- **Error Boundaries** - Graceful error handling
- **Loading States** - User feedback for async operations
- **Toast Notifications** - Success/error messages
- **Search & Pagination** - Efficient data browsing
- **Form Validation** - Client-side validation
- **Context API** - Global state management

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check the connection string in .env

2. **Port Already in Use:**
   - Change the PORT in server/.env
   - Kill existing processes: `npx kill-port 5000`

3. **PowerShell Execution Policy:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **CORS Errors:**
   - Ensure CLIENT_URL in server/.env matches frontend URL

### Database Reset

To reset the database:
```bash
# Connect to MongoDB
mongo
# Switch to your database
use online-learning-system
# Drop the database
db.dropDatabase()
```

## 🚀 Production Deployment

### Environment Variables for Production

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-very-secure-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Deployment Options

1. **Heroku** - Easy deployment for both frontend and backend
2. **Vercel** - Great for React frontend
3. **DigitalOcean** - Full control VPS
4. **AWS** - Scalable cloud solution
5. **Netlify** - Static site hosting for frontend

## 📚 Technology Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Bootstrap** - CSS framework
- **Context API** - State management
- **Axios** - HTTP client

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy Learning! 🎓**
