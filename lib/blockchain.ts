"use client"

import { ethers } from "ethers"
import VotingSystemABI from "./VotingSystemABI"

// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID || "0xaa36a7" // 11155111
export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Test Network",
  nativeCurrency: { name: "Sepolia Ether", symbol: "SepoliaETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}
export const BLOCK_EXPLORER_URL = "https://sepolia.etherscan.io"

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// Helper to get connected wallet address
export const getConnectedAccount = async (): Promise<string | null> => {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    return null
  }
  try {
    const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[]
    return accounts && accounts.length > 0 ? accounts[0] : null
  } catch {
    return null
  }
}

// Connect to wallet
export const connectWallet = async () => {
  try {
    if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this application.")
    }

    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[]
    await switchToSepolia()
    if (accounts && accounts.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("connected_wallet", accounts[0])
      }
      return accounts[0]
    }
    throw new Error("No accounts found in wallet")
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    throw error
  }
}

// Switch wallet to Sepolia testnet
export const switchToSepolia = async () => {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") return

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    })
  } catch (switchError: any) {
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SEPOLIA_NETWORK],
      })
    } else {
      console.warn("Could not switch to Sepolia network automatically:", switchError)
    }
  }
}

// Get contract instance (Ethers v6 compatible)
export const getContract = async () => {
  if (typeof window === "undefined" || typeof window.ethereum === "undefined") {
    throw new Error("Ethereum wallet is not available.")
  }
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return new ethers.Contract(CONTRACT_ADDRESS, VotingSystemABI, signer)
}

// Verify student eligibility against .NET registrar database
export const verifyStudentEligibility = async (studentData: {
  studentId: string
  matricNumber: string
  department?: string
  level?: string
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/eligibility/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return {
        eligible: false,
        message: err.message || "Failed to verify eligibility. Please verify your student ID and matriculation number.",
      }
    }

    const data = await response.json()
    if (typeof window !== "undefined" && data.eligible) {
      sessionStorage.setItem("verified_student", JSON.stringify(data))
    }
    return data
  } catch (error: any) {
    console.error("Error verifying eligibility:", error)
    return {
      eligible: false,
      message: "Could not connect to the university verification server. Please check your network or try again.",
    }
  }
}

// Register voter with student credentials & wallet
export const registerVoter = async (studentData: {
  studentId: string
  department: string
  year: string
  walletAddress?: string
}) => {
  try {
    let wallet = studentData.walletAddress
    if (!wallet) {
      wallet = (await getConnectedAccount()) || (typeof window !== "undefined" ? localStorage.getItem("connected_wallet") || "" : "")
    }

    if (!wallet) {
      return { success: false, message: "Please connect your MetaMask wallet first." }
    }

    const response = await fetch(`${API_BASE_URL}/api/voters/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: studentData.studentId,
        department: studentData.department,
        year: studentData.year,
        walletAddress: wallet,
      }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, message: result.message || "Registration failed. Please check your credentials." }
    }

    return { success: true, message: result.message || "Registration successful" }
  } catch (error: any) {
    console.error("Error registering voter:", error)
    return {
      success: false,
      message: "Could not connect to the backend API server. Please ensure the .NET backend is running on port 5000.",
    }
  }
}

// Check voter status from .NET API
export const checkVoterStatus = async (walletAddress?: string) => {
  try {
    let address = walletAddress
    if (!address) {
      address = (await getConnectedAccount()) || (typeof window !== "undefined" ? localStorage.getItem("connected_wallet") || "" : "")
    }

    if (!address) {
      return { isRegistered: false, hasVoted: false }
    }

    const response = await fetch(`${API_BASE_URL}/api/voters/${encodeURIComponent(address)}/status`)
    if (!response.ok) {
      return { isRegistered: false, hasVoted: false }
    }

    const data = await response.json()
    return {
      isRegistered: !!data.isRegistered,
      hasVoted: !!data.hasVoted,
      studentId: data.studentId,
      department: data.department,
      walletAddress: data.walletAddress,
    }
  } catch (error) {
    console.error("Error checking voter status:", error)
    return { isRegistered: false, hasVoted: false }
  }
}

// Get active election data and positions
export const getElectionData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/elections/active`)
    if (!response.ok) {
      throw new Error("Failed to fetch election data from backend")
    }
    const data = await response.json()
    return {
      electionId: data.electionId,
      title: data.title,
      status: data.status,
      positions: data.positions || [],
    }
  } catch (error) {
    console.error("Error getting election data:", error)
    throw error
  }
}

// Cast vote via .NET blockchain relayer / record service
export const castVote = async (selectedCandidates: Record<string, string>) => {
  try {
    const wallet = (await getConnectedAccount()) || (typeof window !== "undefined" ? localStorage.getItem("connected_wallet") || "" : "")

    const response = await fetch(`${API_BASE_URL}/api/elections/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedCandidates,
        voterAddress: wallet,
      }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(result.message || "Failed to submit ballot")
    }

    return {
      success: true,
      transactionHash: result.transactionHash,
      message: result.message,
    }
  } catch (error) {
    console.error("Error casting vote:", error)
    throw error
  }
}

// Get election results
export const getElectionResults = async (electionId?: string) => {
  try {
    const url = electionId
      ? `${API_BASE_URL}/api/results?electionId=${encodeURIComponent(electionId)}`
      : `${API_BASE_URL}/api/results`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to fetch results from backend")
    }

    const data = await response.json()
    return {
      electionId: data.electionId,
      electionTitle: data.electionTitle,
      electionStatus: data.electionStatus,
      totalVotes: data.totalVotes,
      lastUpdated: data.lastUpdated,
      positions: data.positions || [],
    }
  } catch (error) {
    console.error("Error getting election results:", error)
    throw error
  }
}

// Get admin dashboard data
export const getAdminData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`)
    if (!response.ok) {
      throw new Error("Failed to fetch admin data from backend")
    }

    const data = await response.json()
    return {
      totalVoters: data.totalVoters ?? 0,
      registeredVoters: data.registeredVoters ?? 0,
      votesCount: data.votesCount ?? 0,
      electionStatus: data.electionStatus ?? "Not Started",
      electionTitle: data.electionTitle,
      candidates: data.candidates || [],
      voters: data.voters || [],
      recentActivity: data.recentActivity || [],
    }
  } catch (error) {
    console.error("Error getting admin data:", error)
    throw error
  }
}

// Create election
export const createElection = async (electionData: {
  title: string
  startDate: string
  endDate: string
  requireVerification?: boolean
  allowResults?: boolean
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/elections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(electionData),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to create election")
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating election:", error)
    throw error
  }
}

// Add candidate
export const addCandidate = async (candidateData: {
  name: string
  position: string
  party: string
  category?: string
  bio?: string
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidateData),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to add candidate")
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding candidate:", error)
    throw error
  }
}

// Remove candidate
export const removeCandidate = async (candidateId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/candidates/${encodeURIComponent(candidateId)}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to remove candidate")
    }

    return { success: true }
  } catch (error) {
    console.error("Error removing candidate:", error)
    throw error
  }
}

// Start election
export const startElection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/elections/start`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to start election")
    }

    return { success: true }
  } catch (error) {
    console.error("Error starting election:", error)
    throw error
  }
}

// End election
export const endElection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/elections/end`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to end election")
    }

    return { success: true }
  } catch (error) {
    console.error("Error ending election:", error)
    throw error
  }
}

// Get voting categories
export const getVotingCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`)
    if (!response.ok) {
      throw new Error("Failed to fetch voting categories")
    }

    const data = await response.json()
    return data || []
  } catch (error) {
    console.error("Error getting voting categories:", error)
    throw error
  }
}

// Add voting category
export const addVotingCategory = async (categoryData: {
  name: string
  description: string
  positions: string[]
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    })

    if (!response.ok) {
      throw new Error("Failed to add category")
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding voting category:", error)
    throw error
  }
}

// Remove voting category
export const removeVotingCategory = async (categoryId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${encodeURIComponent(categoryId)}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to remove category")
    }

    return { success: true }
  } catch (error) {
    console.error("Error removing voting category:", error)
    throw error
  }
}
