# Guidewire Event Replay & Audit Engine

A comprehensive event-driven audit and replay system for Guidewire PolicyCenter and ClaimCenter, built as a proof-of-concept with external API integration.

## 🚀 Features

### Core Functionality
- **Event Replay Engine**: Reconstruct policy/claim state at any historical timestamp
- **Audit Timeline**: Chronological event visualization with filtering
- **Validation Engine**: Compare reconstructed vs. expected state
- **Demo Scenarios**: Interactive demonstrations of real insurance workflows

### External Integration
- **REST API Endpoints**: Receive events from Guidewire systems
- **Real-time Monitoring**: Live dashboard for event streaming
- **API Documentation**: Complete integration guide for Guidewire developers

### Testing & Quality
- **Integration Tests**: Comprehensive API testing suite
- **Test Runner**: Automated validation of all components
- **Monitoring Dashboard**: Real-time system health and statistics

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:runner
```

Visit [http://localhost:3000](http://localhost:3000) to explore the application.

## 📊 Available Pages

- **/demo** - Interactive demo scenarios
- **/monitoring** - External event monitoring dashboard
- **/docs** - API documentation and integration guide

## 🔌 API Endpoints

### External Event Streaming
```
POST /api/external/events
```
Receive events from Guidewire systems for external processing and monitoring.

### Monitoring & Statistics
```
GET /api/external/events
```
Retrieve events and statistics for monitoring.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with custom test runner
npm run test:runner
```

## 📚 Documentation

Complete API documentation and Guidewire integration guide available at `/docs`.

## 🎯 Demo Scenarios

Five pre-built scenarios demonstrating real insurance workflows:
1. Policy Pricing Change
2. Claim Impact on Policy  
3. Policy Endorsement
4. Audit Investigation
5. System Recovery
