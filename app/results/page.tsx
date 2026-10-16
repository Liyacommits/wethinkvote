"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Clock, Download, ExternalLink, RefreshCw, Radio } from "lucide-react"
import { getElectionResults, API_BASE_URL, BLOCK_EXPLORER_URL } from "@/lib/blockchain"
import * as signalR from "@microsoft/signalr"

interface Candidate {
  id: string
  name: string
  position: string
  party: string
  votes: number
  percentage: number
}

interface Position {
  id: string
  title: string
  candidates: Candidate[]
  totalVotes: number
}

export default function ResultsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [electionTitle, setElectionTitle] = useState("University Election 2026")
  const [positions, setPositions] = useState<Position[]>([])
  const [activePosition, setActivePosition] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isLive, setIsLive] = useState(false)

  const fetchResults = async () => {
    try {
      const results = await getElectionResults()
      if (results.electionTitle) {
        setElectionTitle(results.electionTitle)
      }
      setPositions(results.positions || [])

      if (results.positions && results.positions.length > 0) {
        setActivePosition((current) => current || results.positions[0].id)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchResults()

    // Establish real-time SignalR connection
    let connection: signalR.HubConnection | null = null

    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/election`)
        .withAutomaticReconnect()
        .build()

      connection.on("ResultsUpdated", (updatedData) => {
        if (updatedData.positions) {
          setPositions(updatedData.positions)
          setLastUpdated(new Date())
        }
      })

      connection
        .start()
        .then(() => setIsLive(true))
        .catch((err) => console.warn("SignalR connection skipped or unavailable:", err))
    } catch (err) {
      console.warn("Could not start SignalR hub:", err)
    }

    return () => {
      if (connection) {
        connection.stop()
      }
    }
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchResults()
  }

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Position,Candidate,Party,Votes,Percentage\n" +
      positions
        .flatMap((p) =>
          p.candidates.map(
            (c) => `"${p.title}","${c.name}","${c.party}",${c.votes},${c.percentage.toFixed(1)}%`
          )
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `wethinkvote_results_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold">Election Results</h1>
          </div>
          <p className="text-muted-foreground">{electionTitle}</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{electionTitle}</CardTitle>
                  {isLive && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <Radio className="h-3 w-3 animate-pulse" />
                      Live Feed
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={positions.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Loading election results from blockchain...</p>
                </div>
              </div>
            ) : positions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No contested positions or election tallies recorded yet.
              </div>
            ) : (
              <Tabs value={activePosition} onValueChange={setActivePosition} className="w-full">
                <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
                  {positions.map((position) => (
                    <TabsTrigger key={position.id} value={position.id} className="text-xs md:text-sm">
                      {position.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {positions.map((position) => (
                  <TabsContent key={position.id} value={position.id} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground">Total votes cast: {position.totalVotes}</p>
                      </div>
                      <div className="space-y-4 pt-2">
                        {position.candidates.map((candidate) => (
                          <div key={candidate.id} className="space-y-2 p-3 rounded-lg border bg-card/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{candidate.name}</p>
                                <p className="text-xs text-primary font-medium">{candidate.party}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">{candidate.votes} votes</p>
                                <p className="text-xs text-muted-foreground">{candidate.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, candidate.percentage))}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
            <div className="mt-8 pt-4 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-xs text-muted-foreground">Ballot audit records are verified on the Ethereum blockchain</p>
                <Link
                  href={BLOCK_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center"
                >
                  View on Sepolia Etherscan
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
