# OSINT Intelligence Dashboard

A full-stack OSINT (Open Source Intelligence) dashboard for searching and analyzing leaked data with Redis caching for performance.

## 🚀 Features

- **Search leaked data** by name, phone, email, address
- **Redis caching** for instant repeated searches
- **User authentication** with password management
- **Search history** with cache status indicators
- **Export capabilities** (JSON, CSV, PDF)
- **Real-time statistics** and visualizations
- **Dark mode** support

## 📋 Prerequisites

### Backend
- Java 17 or higher
- Maven 3.6+
- MongoDB 5.0+
- Redis (optional, for caching)

### Frontend
- Node.js 16+ and npm

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/osint-dashboard.git
cd osint-dashboard
```

### 2. Setup MongoDB

Follow instructions in `DATABASE_SETUP.md` to:
- Create MongoDB user
- Import database
- Verify data

### 3. Setup Redis (Optional but Recommended)

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Install `Redis-x64-3.0.504.msi`
- Redis runs automatically as service

**Linux:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

### 4. Configure Backend

Edit `src/main/resources/application.properties`:
```properties
# Update MongoDB credentials if needed
spring.mongodb.uri=mongodb://kenji:Rolosha%40123@127.0.0.1:27017/leaks_db?authSource=admin

# Redis configuration (if using)
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

### 5. Build & Run Backend
```bash
# Install dependencies and build
mvn clean install -DskipTests

# Run application
mvn spring-boot:run -DskipTests
```

Backend will start on `http://localhost:8080`

### 6. Setup Frontend
```bash
# Navigate to frontend directory
cd frontend  # or wherever your React app is

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will start on `http://localhost:3000`

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:8080/search/health
```

### Redis Cache Check
```bash
curl http://localhost:8080/api/cache/health
```

### MongoDB Check
```bash
mongosh "mongodb://kenji:Rolosha%40123@127.0.0.1:27017/leaks_db?authSource=admin"
db.leakeddata.countDocuments()
```

## 📁 Project Structure
```
osint-dashboard/
├── src/
│   ├── main/
│   │   ├── java/com/cirt/osint_dashboard/
│   │   │   ├── config/          # Redis, CORS, Web config
│   │   │   ├── controller/      # REST endpoints
│   │   │   ├── model/           # Data models
│   │   │   ├── repository/      # MongoDB repositories
│   │   │   ├── service/         # Business logic
│   │   │   └── dto/             # Data transfer objects
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── public/
├── database-backup/            # MongoDB dump
├── pom.xml                     # Maven configuration
└── README.md
```

## 🔑 Default Login Credentials

**Username:** `admin`  
**Password:** `admin123`

⚠️ **Change default password after first login!**

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change password
- `POST /auth/logout` - Logout

### Search
- `GET /search/name?value={query}&size={limit}` - Search by name
- `GET /search/phone?value={query}&size={limit}` - Search by phone
- `GET /search/email?value={query}&size={limit}` - Search by email
- `GET /search/address?value={query}&size={limit}` - Search by address

### Cache Management
- `GET /api/cache/stats` - Get cache statistics
- `GET /api/cache/health` - Check Redis connection
- `POST /api/cache/clear` - Clear all caches
- `POST /api/cache/clear/{type}` - Clear specific cache (name/phone/email/address)

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
1. Check MongoDB is running: `mongosh`
2. Verify credentials in `application.properties`
3. Check MongoDB logs

### "Redis connection failed"
1. Check Redis is running: `redis-cli ping`
2. Windows: Check Services → Redis is started
3. Linux: `sudo systemctl status redis`

### "Port 8080 already in use"
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux
lsof -i :8080
kill -9 <PID>
```

### Build Errors
```bash
# Clean and rebuild
mvn clean
mvn install -DskipTests
```

## 📝 Environment Variables

For production deployment, use environment variables instead of hardcoded values:
```bash
export MONGODB_URI="mongodb://user:pass@host:port/db"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes.

## 👥 Authors

- **kenji ** - ANTIC OSINT Tool

## 🙏 Acknowledgments

- Agence Nationale des Technologies de l'Information et de la Communication (ANTIC)
