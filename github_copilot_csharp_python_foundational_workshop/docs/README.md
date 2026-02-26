# Road Trip Planner

## 🚀 Project Overview
A modern web application for planning multi-stop road trips, specifically designed for RVs and trucks with vehicle-aware routing and AI-powered discovery.

## 📚 Documentation

**📋 Development Roadmap:** See [ROADMAP.md](./ROADMAP.md) for:
- All 20 planned issues across 4 milestones
- Task priorities, estimates, and dependencies
- AI agent workflow recommendations
- GitHub Project setup instructions

**🏗️ Architecture Diagrams:** See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for:
- System architecture diagram (frontend, backend, Azure services)
- Component hierarchy and relationships
- Data flow diagrams (API proxy pattern)
- Authentication flow (OAuth → JWT)
- Deployment pipeline (GitHub Actions → Azure)
- Database schema (ERD)

**Complete Project Instructions:** See [PROJECT_INSTRUCTIONS.md](./PROJECT_INSTRUCTIONS.md) for comprehensive documentation covering:
- Development setup and local configuration
- Architecture and design patterns (with embedded diagrams)
- Coding standards (TypeScript, Python, testing)
- Azure deployment (step-by-step guides)
- Feature reference and troubleshooting

**Archived Documentation:** Original markdown files are preserved in `docs_archive/` folder.

## Setup

### Prerequisites
- Node.js
- Python 3.10+
- Mapbox API Token

### Installation

1. **Frontend**
   ```bash
   cd frontend
   npm install
   ```

2. **Backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### Running the App

1. **Start Backend**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

### Configuration
- Create a `.env` file in `backend/` with `MAPBOX_TOKEN=your_token`.
- Update `frontend/src/components/MapComponent.tsx` with your public token.

## ☁️ Azure Deployment

This project is ready for deployment to Azure using native App Service (non-containerized).

**Complete Deployment Guide:** See [PROJECT_INSTRUCTIONS.md](./PROJECT_INSTRUCTIONS.md#azure-deployment) for:
- Architecture overview and resource details
- Step-by-step deployment instructions
- CI/CD setup (GitHub Actions & Azure DevOps)
- Environment configuration
- Monitoring and troubleshooting
- Cost optimization strategies

## Run the Mobile app
npx expo start --ios