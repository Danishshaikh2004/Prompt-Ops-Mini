# Prompt Evaluation Platform

A comprehensive web application for evaluating and comparing AI model performance against custom prompts using configurable rubrics.


## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompt-ops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

## 🏗️ Architecture & Tradeoffs

### Architecture Decisions

#### **File-based Data Storage**
- **Decision**: Used JSON files instead of a database for simplicity
- **Pros**: No database setup required, easy deployment, works with Vercel
- **Cons**: Not suitable for high concurrency, limited scalability
- **Tradeoff**: Chose simplicity over performance for this demo application

#### **Client-side Polling**
- **Decision**: Implemented polling every 3 seconds for status updates
- **Pros**: Simple implementation, works with serverless functions
- **Cons**: Not real-time, potential unnecessary API calls
- **Tradeoff**: Chose simplicity over WebSocket complexity for demo purposes

#### **Mock Scoring System**
- **Decision**: Used randomized scoring instead of actual AI API calls
- **Pros**: No API keys required, fast response times, cost-effective
- **Cons**: Not reflective of real model performance
- **Tradeoff**: Chose development speed over accuracy for demonstration

### Technical Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Inline styles (for simplicity)
- **Data Storage**: JSON files
- **Deployment**: Vercel (recommended)

## 🚀 What I'd Do With More Time

1. **Real AI Model Integration** - Replace mock scoring with actual API calls to OpenAI/Anthropic for authentic evaluation results
2. **Database Backend** - Migrate from JSON files to PostgreSQL for better data persistence and concurrent access
3. **WebSocket Real-time Updates** - Implement live status updates instead of polling for better user experience
4. **Comprehensive Testing Suite** - Add unit, integration, and E2E tests with CI/CD pipeline for reliability
5. **Advanced Analytics Dashboard** - Build charts and graphs showing model performance trends over time


## 📈 Estimated Time Spent

- **Approx**: 12 - 14 hour

