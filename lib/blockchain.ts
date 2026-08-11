"use client"

import { ethers } from "ethers"
import VotingSystemABI from "./VotingSystemABI"

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = "0xaa36a7" // 11155111
export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Test Network",
  nativeCurrency: { name: "Sepolia Ether", symbol: "SepoliaETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}
export const BLOCK_EXPLORER_URL = "https://sepolia.etherscan.io"

// Contract address would be set after deployment to Sepolia
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// Mock data for development
const mockData = {
  positions: [
    {
      id: "president",
      title: "President",
      candidates: [
        { id: "1", name: "Liya", position: "President", party: "Progress Party", votes: 145, percentage: 42.5 },
        { id: "2", name: "Nyakallo", position: "President", party: "Student Voice", votes: 120, percentage: 35.2 },
        { id: "3", name: "Letlotlo", position: "President", party: "Independent", votes: 76, percentage: 22.3 },
      ],
      totalVotes: 341,
    },
  ],
  voters: [
    {
      id: "1",
      studentId: "ST12345",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      department: "Computer Science",
      registrationDate: "2025-04-15",
      hasVoted: true,
    },
    {
      id: "2",
      studentId: "ST12346",
      walletAddress: "0x2345678901abcdef2345678901abcdef23456789",
      department: "Engineering",
      registrationDate: "2025-04-16",
      hasVoted: true,
    },
    {
      id: "3",
      studentId: "ST12347",
      walletAddress: "0x3456789012abcdef3456789012abcdef34567890",
      department: "Business",
      registrationDate: "2025-04-16",
      hasVoted: false,
    },
    {
      id: "4",
      studentId: "ST12348",
      walletAddress: "0x4567890123abcdef4567890123abcdef45678901",
      department: "Arts",
      registrationDate: "2025-04-17",
      hasVoted: true,
    },
    {
      id: "5",
      studentId: "ST12349",
      walletAddress: "0x5678901234abcdef5678901234abcdef56789012",
      department: "Science",
      registrationDate: "2025-04-18",
      hasVoted: false,
    },
  ],
  candidates: [
    { id: "1", name: "Liya", position: "President", party: "Progress Party" },
    { id: "2", name: "Nyakallo", position: "President", party: "Student Voice" },
    { id: "3", name: "Letlotlo", position: "President", party: "Independent" },
  ],
}

// Connect to wallet
export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this application.")
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

    // Ensure the wallet is connected to the Sepolia testnet
    await switchToSepolia()

    return accounts[0]
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    throw error
  }
}

// Switch the connected wallet to the Sepolia testnet (adds it if missing)
export const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    })
  } catch (switchError: any) {
    // 4902 = chain not added to the wallet yet
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SEPOLIA_NETWORK],
      })
    } else {
      console.error("Error switching to Sepolia:", switchError)
    }
  }
}

// Get contract instance
const getContract = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, VotingSystemABI, signer)
  } catch (error) {
    console.error("Error getting contract:", error)
    throw error
  }
}

// Register voter
export const registerVoter = async (studentData: any) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Registering voter:", studentData)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Error registering voter:", error)
    throw error
  }
}

// Check voter status
export const checkVoterStatus = async () => {
  try {
    // In a real implementation, this would check the blockchain
    console.log("Checking voter status")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For demo purposes, return false to allow voting
    return { hasVoted: false }
  } catch (error) {
    console.error("Error checking voter status:", error)
    throw error
  }
}

// Get election data
export const getElectionData = async () => {
  try {
    // In a real implementation, this would fetch from the blockchain
    console.log("Getting election data")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return { positions: mockData.positions }
  } catch (error) {
    console.error("Error getting election data:", error)
    throw error
  }
}

// Cast vote
export const castVote = async (selectedCandidates: Record<string, string>) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Casting votes:", selectedCandidates)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return { success: true, transactionHash: "0x7f9e4b5c3d2a1b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6" }
  } catch (error) {
    console.error("Error casting vote:", error)
    throw error
  }
}

// Get election results
export const getElectionResults = async () => {
  try {
    // In a real implementation, this would fetch from the blockchain
    console.log("Getting election results")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { positions: mockData.positions }
  } catch (error) {
    console.error("Error getting election results:", error)
    throw error
  }
}

// Get admin data
export const getAdminData = async () => {
  try {
    // In a real implementation, this would fetch from the blockchain
    console.log("Getting admin data")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    return {
      totalVoters: 500,
      registeredVoters: 341,
      votesCount: 245,
      electionStatus: "Active",
      candidates: mockData.candidates,
      voters: mockData.voters,
    }
  } catch (error) {
    console.error("Error getting admin data:", error)
    throw error
  }
}

// Create election
export const createElection = async (electionData: any) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Creating election:", electionData)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return { success: true }
  } catch (error) {
    console.error("Error creating election:", error)
    throw error
  }
}

// Add candidate
export const addCandidate = async (candidateData: any) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Adding candidate:", candidateData)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Error adding candidate:", error)
    throw error
  }
}

// Remove candidate
export const removeCandidate = async (candidateId: string) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Removing candidate:", candidateId)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return { success: true }
  } catch (error) {
    console.error("Error removing candidate:", error)
    throw error
  }
}

// Start election
export const startElection = async () => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Starting election")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    return { success: true }
  } catch (error) {
    console.error("Error starting election:", error)
    throw error
  }
}

// End election
export const endElection = async () => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Ending election")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    return { success: true }
  } catch (error) {
    console.error("Error ending election:", error)
    throw error
  }
}

// Verify student eligibility
export const verifyStudentEligibility = async (studentData: any) => {
  try {
    // In a real implementation, this would check against a university database
    console.log("Verifying student eligibility:", studentData)

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo purposes, we'll approve most students
    // In production, this would check against actual university records
    if (!studentData.studentId || !studentData.matricNumber) {
      return {
        eligible: false,
        message: "Invalid student ID or matriculation number.",
      }
    }

    return {
      eligible: true,
      studentId: studentData.studentId,
      department: studentData.department,
      level: studentData.level,
    }
  } catch (error) {
    console.error("Error verifying eligibility:", error)
    throw error
  }
}

// Get voting categories
export const getVotingCategories = async () => {
  try {
    // In a real implementation, this would fetch from the blockchain
    console.log("Getting voting categories")

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock data for demonstration
    return [
      {
        id: "sug",
        name: "Student Union Government",
        description: "Main student representative body",
        positions: ["President", "Vice President", "Secretary", "Treasurer", "PRO"],
      },
      {
        id: "faculty",
        name: "Faculty Representatives",
        description: "Representatives for each faculty",
        positions: ["Faculty Rep", "Assistant Faculty Rep"],
      },
      {
        id: "department",
        name: "Departmental Executives",
        description: "Leadership for individual departments",
        positions: ["President", "Vice President", "Secretary", "Treasurer"],
      },
    ]
  } catch (error) {
    console.error("Error getting voting categories:", error)
    throw error
  }
}

// Add voting category
export const addVotingCategory = async (categoryData: any) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Adding voting category:", categoryData)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    return { success: true }
  } catch (error) {
    console.error("Error adding voting category:", error)
    throw error
  }
}

// Remove voting category
export const removeVotingCategory = async (categoryId: string) => {
  try {
    // In a real implementation, this would interact with the blockchain
    console.log("Removing voting category:", categoryId)

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return { success: true }
  } catch (error) {
    console.error("Error removing voting category:", error)
    throw error
  }
}
