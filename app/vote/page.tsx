"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2, Info, Loader2, Vote, AlertCircle, ExternalLink } from "lucide-react"
import { castVote, getElectionData, checkVoterStatus, BLOCK_EXPLORER_URL } from "@/lib/blockchain"

interface Candidate {
  id: string
  name: string
  position: string
  party: string
  votes: number
}

interface Position {
  id: string
  title: string
  candidates: Candidate[]
}

export default function VotePage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [electionTitle, setElectionTitle] = useState("University Election 2026")
  const [positions, setPositions] = useState<Position[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({})
  const [activePosition, setActivePosition] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user has already voted
        const voterStatus = await checkVoterStatus()
        setHasVoted(voterStatus.hasVoted)

        // Get election data
        const data = await getElectionData()
        if (data.title) {
          setElectionTitle(data.title)
        }
        setPositions(data.positions)

        if (data.positions.length > 0) {
          setActivePosition(data.positions[0].id)
        }
      } catch (err: any) {
        console.error("Error fetching election data:", err)
        setError("Failed to load active election. Please ensure the backend server is running.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleVote = async () => {
    setSubmitting(true)
    setError("")

    try {
      // Submit votes to blockchain through .NET backend
      const res = await castVote(selectedCandidates)
      setTransactionHash(res.transactionHash)
      setVoted(true)
    } catch (err: any) {
      console.error("Error casting vote:", err)
      setError(err.message || "Failed to submit ballot to blockchain.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setSelectedCandidates({
      ...selectedCandidates,
      [positionId]: candidateId,
    })
  }

  const isFormComplete = () => {
    return positions.length > 0 && positions.every((position) => selectedCandidates[position.id])
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading election data from blockchain...</p>
        </div>
      </div>
    )
  }

  if (hasVoted) {
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
            <CardTitle className="text-2xl">Already Voted</CardTitle>
            <CardDescription>You have already cast your vote in this election</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-bold">Thank You For Voting!</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Your vote has been verified and permanently recorded on the blockchain ledger and cannot be altered.
              </p>
              <Link href="/results">
                <Button>View Live Results</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (voted) {
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
            <CardTitle className="text-2xl">Vote Successful</CardTitle>
            <CardDescription>Your ballot has been securely recorded on the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-bold">Thank You For Voting!</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Your vote has been cryptographically confirmed and registered on the blockchain network.
              </p>
              <Link href="/results">
                <Button>View Live Results</Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center border-t pt-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Transaction Hash:</p>
            <a
              href={`${BLOCK_EXPLORER_URL}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-primary flex items-center gap-1 hover:underline break-all"
            >
              <span>{transactionHash}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col items-center max-w-4xl mx-auto">
        <div className="w-full mb-8">
          <Link href="/" className="inline-block mb-4">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
              <Vote className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold">Cast Your Vote</h1>
          </div>
          <p className="text-muted-foreground">{electionTitle}</p>
        </div>

        {error && (
          <div className="w-full mb-6 flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Independent Electoral Commission (IEC) Guidelines</AlertTitle>
          <AlertDescription>
            Your vote is encrypted and will be permanently sealed on the blockchain. Once submitted, votes cannot be
            retracted or modified. Please review all positions carefully.
          </AlertDescription>
        </Alert>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{electionTitle}</CardTitle>
            <CardDescription>
              Complete your selection for each category and position below. ({Object.keys(selectedCandidates).length}/
              {positions.length} selected)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No contested positions found in active election.</p>
            ) : (
              <Tabs value={activePosition} onValueChange={setActivePosition} className="w-full">
                <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
                  {positions.map((position) => (
                    <TabsTrigger key={position.id} value={position.id} className="text-xs md:text-sm">
                      {position.title}
                      {selectedCandidates[position.id] && " ✓"}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {positions.map((position) => (
                  <TabsContent key={position.id} value={position.id} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {selectedCandidates[position.id] ? "Selection made" : "Awaiting selection"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Select your candidate for this office:</p>
                      <RadioGroup
                        value={selectedCandidates[position.id] || ""}
                        onValueChange={(value) => handleSelectCandidate(position.id, value)}
                      >
                        {position.candidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                              selectedCandidates[position.id] === candidate.id
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={candidate.id} id={candidate.id} />
                            <Label htmlFor={candidate.id} className="flex flex-col cursor-pointer w-full">
                              <span className="font-semibold">{candidate.name}</span>
                              <span className="text-xs text-primary font-medium">{candidate.party}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-6">
            <Button
              onClick={handleVote}
              disabled={!isFormComplete() || submitting}
              className="w-full mb-4"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording on Blockchain Ledger...
                </>
              ) : (
                "Submit Ballot"
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By submitting your vote, you confirm your legal student eligibility and cast your ballot of your own free
              will under democratic electoral oversight.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
