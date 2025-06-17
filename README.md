# StreamAX - 24/7 YouTube Streaming Service

Professional 24/7 YouTube streaming service with Docker-based isolation and multi-user support.

## 🚀 Features

- **24/7 Streaming**: Continuous YouTube streaming with FFmpeg
- **Docker Isolation**: Each user gets isolated containers for security
- **Multi-Source Support**: Upload files, YouTube links, or direct URLs
- **Real-time Monitoring**: Live stream status and analytics
- **Package Management**: Tiered subscription system
- **Admin Dashboard**: Complete user and stream management
- **Responsive Design**: Works on all devices

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Streaming**: FFmpeg via Docker containers
- **Deployment**: Docker, VPS ready

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │────│   Supabase      │────│   Docker        │
│   (Frontend)    │    │   (Backend)     │    │   (Streaming)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd streamax
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Setup Docker network**
   ```bash
   ./scripts/deploy/setup-network.sh
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 📋 Package Plans

| Package | Price | Streams | Features |
|---------|-------|---------|----------|
| Starter | Rp 29,000/month | 1 | Basic support, 24/7 streaming |
| Creator | Rp 75,000/month | 3 | Priority support, Analytics |
| Pro | Rp 199,000/month | 10 | Premium support, API access |

## 🐳 Docker Deployment

### Setup Docker Environment

```bash
# Create Docker network
docker network create streamax_network

# Build FFmpeg image
docker build -t streamax-ffmpeg -f scripts/docker/ffmpeg.Dockerfile scripts/docker/
```

### Container Management

```bash
# Start a stream container
./scripts/deploy/start-container.sh <container_name> <video_source> <rtmp_url> <source_type>

# Stop a stream container
./scripts/deploy/stop-container.sh <container_name>

# Monitor containers
./scripts/deploy/monitor.sh
```

## 📊 Database Schema

### Core Tables

- **users**: User profiles and package information
- **stream_sessions**: Active streaming sessions
- **stream_requests**: Stream approval workflow
- **user_activities**: Activity logging
- **error_logs**: Error tracking
- **performance_metrics**: Performance monitoring

### Key Features

- Row Level Security (RLS) enabled
- Real-time subscriptions
- Automated cleanup functions
- Performance indexing

## 🔐 Security

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access (User/Admin)
- **Container Isolation**: Each user gets isolated Docker containers
- **Data Protection**: Row Level Security on all tables
- **Input Validation**: File type and size validation
- **Rate Limiting**: API endpoint protection

## 🛠️ Admin Features

- User management and package activation
- Stream monitoring and control
- System analytics and reporting
- Error tracking and debugging
- Performance monitoring
- Database backup management

## 📱 User Features

- Easy stream setup with multiple video sources
- Real-time stream status monitoring
- Package management and billing
- Stream history and analytics
- Mobile-responsive interface

## 🔧 Development

### Project Structure

```
streamax/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and configurations
├── scripts/                # Deployment and management scripts
├── supabase/              # Database migrations and functions
└── public/                # Static assets
```

### Key Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Docker Scripts

- `./scripts/deploy/setup-network.sh` - Setup Docker network
- `./scripts/deploy/build-image.sh` - Build streaming image
- `./scripts/deploy/monitor.sh` - Monitor containers

## 🚀 Production Deployment

### VPS Requirements

- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2+ cores
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection

### Deployment Steps

1. **Setup VPS with Docker**
2. **Clone repository and install dependencies**
3. **Configure environment variables**
4. **Setup Supabase database**
5. **Build and deploy containers**
6. **Configure reverse proxy (nginx)**

## 📈 Monitoring

- Real-time stream status
- Container health checks
- Performance metrics
- Error logging
- User activity tracking
- System resource monitoring

## 🔄 Backup & Recovery

- Automated database backups
- Container state management
- Error recovery procedures
- Data export capabilities

## 📞 Support

For technical support or questions:
- WhatsApp: +62 812-3456-7890
- Email: support@streamax.com

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Contact the development team for contribution guidelines.

---

**StreamAX** - Professional 24/7 YouTube Streaming Service