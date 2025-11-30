# 🏥 MediFlow - Hospital Management System

## 🌟 Features

### 🔐 Multi-Tenant Architecture
- Complete data isolation for each hospital
- Dedicated workspaces with unique tenant IDs
- Secure authentication and authorization

### 👥 Role-Based Access Control (RBAC)
- **Hospital Admin**: Full system access and configuration
- **Doctor**: Patient consultations, prescriptions, appointment management
- **Nurse**: Patient care, vitals monitoring, appointment assistance
- **Pharmacist**: Prescription dispensing and inventory management
- **Receptionist**: Patient registration, appointment scheduling

### 📋 Patient Management
- **Registration**: Complete patient lifecycle from admission to discharge
- **OPD/IPD Support**: Outpatient and inpatient department management
- **Medical Records**: Comprehensive health history tracking
- **Patient Types**: Support for different patient categories

### 🔄 Cross-Hospital Record Sharing
- **Interoperability**: Share medical records across hospitals using PAN/Aadhaar
- **Privacy-First**: Consent-based record sharing
- **Complete History**: Access patient's medical history from previous hospitals
- **Seamless Transfer**: Import patient records during registration

### 📅 Appointment Scheduling
- **Smart Calendar**: Week/day/month view with color-coded status
- **Real-time Updates**: Live appointment status tracking
- **Doctor Workflow**: Start consultation, complete, and prescribe in one flow
- **Status Management**: SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED
- **No-Show Tracking**: Mark and track patient no-shows

### 💊 Digital Prescriptions
- **E-Prescriptions**: Fully digital prescription management
- **Medicine Database**: Comprehensive medicine details with dosage and frequency
- **Auto-Sharing**: Automatic medical record creation for cross-hospital access
- **Prescription History**: Complete prescription tracking
- **Print Support**: Generate printable prescription documents

### 👨‍⚕️ Staff Management
- **Multi-role Support**: Manage doctors, nurses, pharmacists, and administrative staff
- **Department Assignment**: Organize staff by departments
- **Status Tracking**: Active/inactive staff management
- **Specialization**: Track doctor specializations and qualifications

### 📊 Analytics Dashboard
- **Real-time Metrics**: Live hospital statistics and KPIs
- **Department Overview**: Patient distribution across departments
- **Appointment Analytics**: Today's schedule with completion rates
- **Patient Trends**: Active patients, admissions, and discharge tracking

### ⚙️ Hospital Configuration
- **Department Management**: Customizable hospital departments
- **Profile Settings**: Hospital information and branding
- **System Configuration**: Tenant-specific settings

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautifully designed components
- **React Router** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **date-fns** - Modern JavaScript date utility library
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### Deployment
- **Vercel** - Frontend hosting  'https://medi-flow-seven.vercel.app'
- **MongoDB Atlas** - Cloud database
- **Git** - Version control
- **Render** - Web Service 'https://mediflow-1-c153.onrender.com'

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup
```bash
cd server
npm install

# Create .env file
cat > .env << EOL
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/mediflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
EOL

# Start the server
npm run dev
```

### Frontend Setup
```bash
cd client
npm install

# Create .env file
cat > .env << EOL
VITE_API_URL=http://localhost:5000
EOL

# Start the development server
npm run dev
```

Visit `https://mediflow-1-c153.onrender.com` to see the application.

## 🌐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mediflow
JWT_SECRET=your-secret-key-min-32-characters
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📖 Usage

### 1. Register a Hospital
1. Navigate to `/hospital-registration`
2. Fill in hospital details (4-step process):
   - Hospital Information
   - Address Details
   - Admin Details
   - Department Selection
3. Complete registration

### 2. Login
- Use the admin email provided during registration
- Default password: `Welcome@123` (change immediately)

### 3. Key Workflows

#### Patient Registration
```
Patients → Register Patient → Fill Details → Save
```

#### Book Appointment
```
Appointments → New Appointment → Select Patient/Doctor/Time → Save
```

#### Doctor Consultation Flow
```
Appointments → Start Consultation → Complete & Prescribe → Add Medicines → Save
```

#### Cross-Hospital Record Transfer
```
Patients → Transfer Records → Enter PAN/Aadhaar → Search → Import Records
```

## 🏗️ Project Structure

```
mediflow/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── Pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # Base UI components
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   ├── patients/
│   │   │   └── prescriptions/
│   │   ├── api/          # API client
│   │   ├── lib/          # Utilities
│   │   └── App.jsx       # Root component
│   ├── public/           # Static assets
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── controllers/      # Route controllers
│   ├── utils/            # Helper functions
│   ├── config/           # Configuration files
│   └── server.js         # Entry point
│
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Authorization**: Protected routes based on user roles
- **Data Isolation**: Complete tenant data separation
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Server-side data validation
- **SQL Injection Prevention**: MongoDB parameterized queries


- 📱 Mobile (320px - 768px)
  
