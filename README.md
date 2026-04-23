# ESG Dashboard - Complete Setup Guide

A full-stack ESG (Environmental, Social, and Governance) reporting dashboard with emission calculations, data visualization, and KPI management.

## 🚀 Features

- **User Authentication** (JWT-based)
- **File Management** (CSV upload, folders, CRUD)
- **Widget Dashboard** (Drag & drop, customizable)
- **KPI Calculator** (Excel-like formulas)
- **Emission Calculations** (Scope 1, 2, 3)
- **Data Visualization** (Charts: Bar, Line, Pie, Sankey)
- **Material Calculator** (Emission factors)

## 📁 Project Structure
--- RBAC is used to manage user permissions for different actions (admin, HQ, BU). There are 3 portals 
for each. Admins approves/ rejects user and selects a role (HQ / BU). HQ users can create BU users 
and manage their data. BU users can only manage their own data.

```
esg-dashboard/
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom Hooks
│   │   ├── pages/          # Page Components
│   │   ├── services/       # API Services
│   │   ├── utils/          # Utilities
│   │   ├── App.js
|   |   ├── config.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .env
|   ├── tailwind.config.js
|   ├── postcss.config.js
|   ├── package-lock.json
│   └── package.json
│
└── server/                  # Node.js Backend
|    ├── src/
|    │   ├── config/         # Configuration
|    │   ├── controllers/    # Business Logic
|    │   ├── middleware/     # Middleware
|    │   ├── models/         # Database Models
|    │   ├── routes/         # API Routes
|    |   ├── tests/          # energy.test.js
|    │   ├── utils/          # Utilities
|    │   └── server.js       # Entry Point
|    |   ├── uploads/  
|    ├── .env
|    ├── .gitignore
|    ├── package-lock.json
|    └── package.json
|    └── test.db.js
|
└── shared/  
|      ├── constants.js
|      └── types.js
└── .gitignore
└── README.md
## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Axios
- Recharts (Charts)
- React Grid Layout
- Papaparse (CSV parsing)
- Lucide React (Icons)
- React Hot Toast (Notifications)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt
- Multer (File upload)
- Express Validator

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd esg-dashboard
```

### 2. Setup Backend

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGO_URI=mongodb://localhost:27017/esg-dashboard
# JWT_SECRET=your-secret-key

# Start MongoDB (if local)
mongod

# Run server
npm run dev
```

Server will run on: `http://localhost:5000`

### 3. Setup Frontend

```bash
cd client
npm install

# Create .env file (optional)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Run client
npm start
```

Client will run on: `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/esg-dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Files
- `GET /api/files` - Get all files
- `POST /api/files` - Create file
- `POST /api/files/folder` - Create folder
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `POST /api/upload` - Upload CSV

### Widgets
- `GET /api/widgets` - Get all widgets
- `POST /api/widgets` - Create widget
- `PUT /api/widgets/:id` - Update widget
- `DELETE /api/widgets/:id` - Delete widget
- `PUT /api/widgets/layout` - Update layout

### KPIs
- `GET /api/kpi` - Get all KPIs
- `POST /api/kpi` - Create KPI
- `POST /api/kpi/calculate` - Calculate KPI
- `PUT /api/kpi/:id` - Update KPI
- `DELETE /api/kpi/:id` - Delete KPI

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🚢 Deployment

### Backend (Heroku/Railway/Render)

```bash
# Build
npm install --production

# Start
npm start
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy build folder
```

## 📊 CSV File Format

Upload CSV files with emission data:

```csv
Month,Diesel (L),Electricity (MWh),Waste (kg)
January,1000,500,200
February,1200,550,180
```

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env
- For Atlas: Whitelist your IP

### CORS Error
- Check CLIENT_URL in backend .env
- Verify API_URL in frontend .env

### File Upload Issues
- Check MAX_FILE_SIZE
- Ensure uploads folder exists
- Verify file permissions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

Your Name - your.email@example.com

## 🙏 Acknowledgments

- GRI Standards for ESG reporting
- Emission Factor databases
- Open source community