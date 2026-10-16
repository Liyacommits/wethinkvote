"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Blocks, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { connectWallet, registerVoter } from "@/lib/blockchain"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    studentId: "",
    department: "",
    year: "",
    walletAddress: "",
  })

  useEffect(() => {
    // Auto-populate from verified student session if available
    try {
      const saved = sessionStorage.getItem("verified_student")
      if (saved) {
        const student = JSON.parse(saved)
        setFormData((prev) => ({
          ...prev,
          studentId: student.studentId || prev.studentId,
          department: student.department?.toLowerCase().includes("computer")
            ? "computer-science"
            : student.department?.toLowerCase().includes("eng")
            ? "engineering"
            : student.department?.toLowerCase().includes("bus")
            ? "business"
            : student.department?.toLowerCase().includes("art")
            ? "arts"
            : "science",
          year: student.level?.includes("100")
            ? "1"
            : student.level?.includes("200")
            ? "2"
            : student.level?.includes("300")
            ? "3"
            : student.level?.includes("400")
            ? "4"
            : "5",
        }))
      }
    } catch {
      // Ignore sessionStorage parse errors
    }
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    setError("")
    try {
      const address = await connectWallet()
      setFormData((prev) => ({ ...prev, walletAddress: address }))
      setStep(2)
    } catch (err: any) {
      console.error("Failed to connect wallet:", err)
      setError(err.message || "Failed to connect to MetaMask wallet. Please check your extension.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await registerVoter(formData)
      if (res && !res.success) {
        setError(res.message || "Failed to register voter on the election ledger. Please try again.")
        return
      }
      setRegistered(true)
    } catch (err: any) {
      setError(err.message || "Failed to register voter on the election ledger. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Link href="/" className="mr-auto">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
              <Blocks className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl">Voter Registration</CardTitle>
          </div>
          <CardDescription>Register to participate in wethinkvote elections</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {registered ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-bold">Registration Successful!</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Your wallet has been verified and registered on the blockchain ledger for the active election.
              </p>
              <Link href="/vote">
                <Button>Go to Voting Page</Button>
              </Link>
            </div>
          ) : step === 1 ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <p className="text-center text-muted-foreground mb-4">
                Connect your wallet to register as a voter. Your wallet will be switched to the Sepolia testnet and used
                to cast your vote securely.
              </p>
              <p className="text-sm text-center mb-2">
                Not sure if you&apos;re eligible?{" "}
                <Link href="/verify-eligibility" className="text-primary hover:underline">
                  Verify your eligibility
                </Link>{" "}
                first.
              </p>
              <Button onClick={handleConnect} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="e.g. ST12345"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  required
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="arts">Arts & Humanities</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year of Study</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                  required
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="5">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input id="walletAddress" value={formData.walletAddress} readOnly className="bg-muted font-mono text-xs" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering on Blockchain...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            By registering, you agree to the terms and conditions of the university election system.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
