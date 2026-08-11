import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Blocks, Check, ChevronRight, Link2, Lock, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
              <Blocks className="h-5 w-5" />
            </div>
            <span className="tracking-tight">
              wethink<span className="text-primary">vote</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/vote" className="text-sm font-medium transition-colors hover:text-primary">
              Vote
            </Link>
            <Link href="/results" className="text-sm font-medium transition-colors hover:text-primary">
              Results
            </Link>
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Sepolia Testnet
            </span>
            <Link href="/register">
              <Button variant="outline" size="sm">
                Register
              </Button>
            </Link>
            <Link href="/vote">
              <Button size="sm">Vote Now</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full overflow-hidden py-12 md:py-24 lg:py-32">
          <div className="absolute inset-0 blockchain-grid" aria-hidden="true" />
          <div className="absolute inset-0 blockchain-glow" aria-hidden="true" />
          <div className="container relative px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5 text-primary" />
                    On-chain, tamper-proof voting
                  </span>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-balance">
                    wethink<span className="text-primary">vote</span>: Secure Elections on the Blockchain
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl text-pretty">
                    Transparent, tamper-proof voting powered by smart contracts. Every ballot is recorded on the Sepolia
                    testnet with real-time results and complete auditability.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="px-8">
                      Register to Vote
                    </Button>
                  </Link>
                  <Link href="/results">
                    <Button size="lg" variant="outline">
                      View Live Results
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 flex items-center justify-center">
                <div className="rounded-xl bg-gradient-to-br from-primary/60 via-accent/40 to-primary/20 p-px shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]">
                  <div className="rounded-[11px] bg-card p-6 text-card-foreground">
                    <div className="flex flex-col space-y-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Blocks className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-xl">Current Election</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Presidential Election 2025</p>
                      <div className="mt-4 flex justify-center">
                        <div className="w-full max-w-sm rounded-lg border border-border bg-secondary/40 p-4 text-card-foreground">
                          <div className="flex flex-col space-y-3">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Status: Active</p>
                              <div className="h-2 w-full rounded-full bg-muted">
                                <div className="h-full w-[75%] rounded-full bg-primary"></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Started: Apr 20</span>
                                <span>Ends: Apr 25</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">Total Votes Cast</p>
                              <p className="text-2xl font-bold text-primary">1,245</p>
                            </div>
                            <p className="font-mono text-[10px] text-muted-foreground truncate">
                              block #0x7f9e4b5c · Sepolia
                            </p>
                            <Link href="/vote">
                              <Button className="w-full">
                                Vote Now <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Blockchain Voting?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  wethinkvote runs on Ethereum smart contracts deployed to the Sepolia testnet, providing a secure,
                  transparent, and tamper-proof voting system.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    Cryptographic security ensures votes cannot be tampered with once cast. Each vote is securely
                    recorded on the blockchain.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Lock className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    All votes are publicly verifiable while maintaining voter privacy. The entire election process is
                    transparent and auditable.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Check className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Fairness</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    Decentralized system prevents any single entity from controlling the election. Real-time results are
                    available to all participants.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} wethinkvote. Running on the Sepolia testnet.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
