# WethinkVOTE - Blockchain Voting System for South African Elections

wethinkVOTE is a secure, transparent blockchain-based voting system designed for South African elections, modelled loosely on the processes run by the Independent Electoral Commission (IEC) for national, provincial, and municipal voting. The system leverages Ethereum blockchain technology to ensure tamper-proof voting, real-time results, and complete auditability. This is based of university voting systems.

> **Note:** This is a bootcamp/portfolio project. It is not affiliated with or endorsed by the IEC and is not intended for use in real elections.

## Features

- **Secure Authentication**: Wallet-based authentication with student id
- **Transparent Voting**: All votes are recorded on the blockchain for transparency
- **Real-time Results**: Live vote counting and result display
- **Admin Dashboard**: Comprehensive tools for election management
- **Mobile Responsive**: Works on all devices, with attention to low-data usage given the cost of mobile data in South Africa

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Blockchain**: Ethereum (Solidity)
- **Integration**: ethers.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Liyacommits/wethinkvote
   cd wethinkvote
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Voters

1. Verify eligibility with your (simulated) Student credentials
2. Register with your Ethereum wallet
3. Vote in active elections
4. View real-time results

### For Administrators

1. Create and manage elections
2. Add voting categories and positions
3. Manage candidates
4. Monitor voting statistics
5. View and export results

## License

This project is licensed under the MIT License - see the LICENSE file for details.# wethinkvote
