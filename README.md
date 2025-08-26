# Bybit Triangular Arbitrage Bot

A proof-of-concept Node.js implementation of an automated triangular arbitrage bot for the Bybit cryptocurrency exchange. This project demonstrates real-time arbitrage detection and execution capabilities between USDT and USDC stablecoins through intermediate cryptocurrency pairs.

## 📋 Brief Description

This bot continuously monitors the Bybit exchange for triangular arbitrage opportunities, automatically executing trades when profitable paths are detected. It serves as a foundation for understanding and implementing automated trading strategies in cryptocurrency markets.

### Key Features
- **Real-Time Monitoring**: WebSocket-based live market data processing
- **Arbitrage Detection**: Automatically identifies profitable 3-currency trading paths
- **Smart Execution**: Strategic use of limit and market orders for optimal trade execution
- **Risk Management**: Concurrency protection, error recovery, and precision handling
- **USDT/USDC Focus**: Specifically targets stablecoin arbitrage opportunities

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

**Disclaimer**: This software is for educational purposes only. Cryptocurrency trading involves substantial risk. Always conduct thorough testing and risk assessment before using automated trading systems.

## 🚀 Installation & Running

### Prerequisites
- Node.js (v14 or higher)
- Bybit API credentials (API key and secret)
- Sufficient trading balance on Bybit

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd bybit-arbitrage-bot

# Install dependencies
npm install
```

### Configuration
Before running, update the API credentials in the following files:
- `order.js` - Line 8-9
- `wallet.js` - Line 5-6  
- `payment.js` - Line 10-11

### Running the Bot
```bash
npm start
# or
node index.js
```
