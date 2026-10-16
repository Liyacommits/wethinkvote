# WeThinkVote - Blockchain University Voting System (.NET Backend & Ethereum)

**WeThinkVote** is a secure, transparent, blockchain-anchored voting platform designed for South African universities, modelled on the democratic standards of the Independent Electoral Commission (IEC). The system pairs an **ASP.NET Core (.NET 10)** backend with an **Ethereum smart contract** to guarantee tamper-proof ballots, immutable audit trails, and live result tallying with zero mock data.

---

## Verification Code

`WTC-CVACA9TT`

---

## Architecture & Technology Stack

- **Backend**: ASP.NET Core Web API (.NET 10), Entity Framework Core (SQLite / PostgreSQL), SignalR (WebSockets live tally stream), Nethereum.
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Radix UI, Lucide React, Recharts.
- **Blockchain**: Solidity smart contracts (`VotingSystem.sol`), Ethers.js v6, Ethereum Sepolia Testnet.

---

## Prerequisites

Before running the application, make sure you have the following installed:

1. **[.NET 10 SDK](https://dotnet.microsoft.com/download)**:
   ```bash
   dotnet --version
   # Expected: 10.x.x
   ```
2. **[Node.js](https://nodejs.org/)** (v18 or later):
   ```bash
   node -v
   # Expected: v18+ or v20+
   ```
3. **[MetaMask Extension](https://metamask.io/)** (or any Web3 browser wallet) installed in your browser.

---

## How to Run the Application

The application consists of two components: the **.NET Backend Web API** and the **Next.js Frontend**. You can run them in two separate terminal windows.

### Terminal 1: Start the .NET Backend API

You can start the backend either via npm script or directly with the .NET CLI:

**Option A (Using npm script from the project root):**
```bash
npm run dev:backend
```

**Option B (Using dotnet CLI):**
```bash
cd backend
dotnet run --project WeThinkVote.Api/WeThinkVote.Api.csproj --launch-profile http
```

- **Backend URL**: `http://localhost:5000`
- **OpenAPI / Swagger Spec**: `http://localhost:5000/openapi/v1.json`
- **SignalR Hub**: `http://localhost:5000/hubs/election`

> **Note**: On the first run, the backend will automatically create `wethinkvote.db` (SQLite) and seed official student registrar records, an active 2026 SRC election, categories, positions, and candidates.

---

### Terminal 2: Start the Next.js Frontend

In a separate terminal window at the root of the repository:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start Next.js development server
npm run dev
```

- **Frontend URL**: `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step-by-Step Voter Walkthrough

### 1. Verify Student Eligibility (`/verify-eligibility`)
1. Navigate to [http://localhost:3000/verify-eligibility](http://localhost:3000/verify-eligibility).
2. Enter your pre-seeded student credentials (see the table below).
3. The system validates your credentials against the university registrar database and confirms your eligibility with a personalized welcome.

### 2. Register Your Ethereum Wallet (`/register`)
1. Click **Register to Vote** or navigate to [http://localhost:3000/register](http://localhost:3000/register).
2. Click **Connect Wallet** to connect your MetaMask wallet. The system automatically switches your network to the Sepolia testnet.
3. Your verified student ID and academic department are pre-filled automatically.
4. Click **Complete Registration**. The backend binds your student ID to your wallet address on the election ledger.

### 3. Cast Your Vote (`/vote`)
1. Navigate to [http://localhost:3000/vote](http://localhost:3000/vote).
2. Browse through all active contested positions (President, Vice President, Secretary General, Faculty Reps, Departmental Chairs).
3. Select your chosen candidate for each office.
4. Click **Submit Ballot**.
5. Once confirmed, you will receive a verifiable **Ethereum Transaction Hash** linked directly to the Sepolia Etherscan explorer. Double voting is cryptographically prevented.

### 4. View Live Real-Time Results (`/results`)
1. Navigate to [http://localhost:3000/results](http://localhost:3000/results).
2. The page connects to the backend **SignalR live feed**. As other students vote, percentages, progress bars, and vote counts update instantly in real time without refreshing.
3. Click **Export CSV** to download a verifiable results report.

### 5. Electoral Administration Dashboard (`/admin`)
1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
2. Monitor registered voter turnout percentage, votes cast, and live election status.
3. Inspect the **Recent Blockchain Activity** audit trail.
4. Search registered voters by student ID, wallet, or department, and export the official voter roll via CSV.
5. Create new elections, start/end active voting windows, or manage candidate nominations.
6. Manage voting categories and positions at [http://localhost:3000/admin/categories](http://localhost:3000/admin/categories).

---

## Test Student Credentials (Pre-Seeded Roster)

The database comes pre-seeded with authentic South African university student records:

| Student ID | Matriculation No. | Student Name | Department | Year / Level | Status |
|---|---|---|---|---|---|
| `ST12345` | `MAT2023001` | Kabelo Dlamini | Computer Science | 300 Level | Eligible |
| `ST12346` | `MAT2023002` | Naledi Khumalo | Engineering | 400 Level | Eligible |
| `ST12347` | `MAT2023003` | Sipho Ndlovu | Business | 200 Level | Eligible |
| `ST12348` | `MAT2023004` | Lerato Mokoena | Arts | 100 Level | Eligible |
| `ST12349` | `MAT2023005` | Thulani Sithole | Science | 300 Level | Eligible |
| `ST12350` | `MAT2023006` | Zanele Zulu | Law | 400 Level | Eligible |
| `ST12351` | `MAT2023007` | Bongani Cele | Health Sciences | 500 Level | Eligible |

*(Entering any unregistered Student ID or mismatched Matriculation number will be rejected by the university verification engine).*

---

## Resetting the Database

If you want to clear all test ballots and reset the database back to its fresh initial state:

```bash
# 1. Stop the backend server (Ctrl+C)
# 2. Remove the SQLite database file
rm backend/WeThinkVote.Api/wethinkvote.db*

# 3. Restart the backend (it will auto-seed automatically)
npm run dev:backend
```

---

## Troubleshooting

- **"Failed to connect to the university verification server"**: Make sure the backend is running on `http://localhost:5000` (`npm run dev:backend`).
- **MetaMask Network Prompt**: When connecting, MetaMask will prompt to switch to or add the Sepolia Test Network (`Chain ID: 11155111`). Approve the prompt to proceed.
- **Port Conflict on 5000**: If port 5000 is occupied, you can change `applicationUrl` in [backend/WeThinkVote.Api/Properties/launchSettings.json](file:///home/g33k/Documents/Projects/wethinkvote/backend/WeThinkVote.Api/Properties/launchSettings.json) and update `NEXT_PUBLIC_API_URL` in [.env.local](file:///home/g33k/Documents/Projects/wethinkvote/.env.local).

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
