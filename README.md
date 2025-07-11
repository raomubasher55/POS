# POS System - Point of Sale Management

A comprehensive Point of Sale system with web dashboard and mobile app support, featuring multi-tenant architecture and subscription billing.

## Features

- 📱 **Android POS App** - Offline-capable point of sale application
- 💻 **Web Dashboard** - Complete business management interface
- 🏪 **Multi-Shop Support** - Manage multiple locations
- 👥 **Staff Management** - Role-based permissions and tracking
- 📊 **Analytics & Reporting** - Comprehensive business insights
- 💳 **Subscription Billing** - Automated monthly billing with Stripe
- 🔒 **Secure & Scalable** - JWT authentication and MongoDB

## Technology Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe for payments
- Nodemailer for emails

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for forms

### Mobile
- Native Android (Kotlin/Java)
- SQLite for offline storage
- Retrofit for networking
- Material Design

## Project Structure

```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── store/          # State management
│   └── public/             # Static assets
├── mobile/                 # Android application
├── phases/                 # Development phases documentation
├── database/               # Database schemas and migrations
└── docs/                   # Project documentation
```

## Development Phases

1. **Phase 1**: Project Setup & Planning (2-3 weeks)
2. **Phase 2**: Web Dashboard Development (6-8 weeks)
3. **Phase 3**: Admin Panel & Multi-tenant Features (4-5 weeks)
4. **Phase 4**: POS Android App Development (8-10 weeks)
5. **Phase 5**: Testing, Deployment & Launch (4-6 weeks)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB 5+
- Git

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## API Documentation

Complete API documentation is available at `/docs/API_Documentation.md`

### Key Endpoints

- `POST /api/auth/register` - Register new business
- `POST /api/auth/login` - User login
- `GET /api/products` - Get products
- `POST /api/sales` - Create sale
- `GET /api/reports/sales` - Sales reports

## Database Schema

The system uses MongoDB with the following main collections:

- **Users** - Authentication and user management
- **Businesses** - Business information and settings
- **Products** - Product catalog and inventory
- **Sales** - Transaction records
- **Shops** - Multi-location support
- **Subscriptions** - Billing and subscription management

See `/database/schemas.md` for detailed schema documentation.

## Development Scripts

### Backend
```bash
npm run dev         # Start development server
npm test           # Run tests
npm run lint       # Lint code
npm start          # Start production server
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Lint code
```

## Features by User Role

### Business Owner
- Complete dashboard access
- Staff management
- Financial reports
- Subscription management
- Multi-shop control

### Staff/Cashier
- POS operations
- Sales processing
- Inventory viewing
- Basic reporting

### Admin (System)
- All business oversight
- Subscription management
- Platform analytics
- Account activation/suspension

## Security Features

- JWT with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## Deployment

### Production Environment
- Docker containers
- MongoDB Atlas
- Stripe for payments
- SendGrid for emails
- CDN for static assets

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Staged deployments
- Zero-downtime updates

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@pos-system.com
- Documentation: `/docs/`
- Issues: GitHub Issues page