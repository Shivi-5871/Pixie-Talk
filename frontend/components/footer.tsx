import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
                Pixie Talk
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered content creation platform for text, speech, images, and videos.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="text-sm text-muted-foreground hover:text-primary">
                  AI Tools
                </Link>
              </li>
              {/* <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">
                  Pricing
                </Link>
              </li> */}
              <li>
                <Link href="/example" className="text-sm text-muted-foreground hover:text-primary">
                  Examples
                </Link>
              </li>
              {/* <li>
                <Link href="/updates" className="text-sm text-muted-foreground hover:text-primary">
                  Updates
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            {/* <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2"> */}
              {/* <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary">
                  Documentation
                </Link>
              </li> */}
              {/* <li>
                <Link href="/Tutorials" className="text-sm text-muted-foreground hover:text-primary">
                  Tutorials
                </Link>
              </li> */}
              {/* <li>
                <Link href="/api" className="text-sm text-muted-foreground hover:text-primary">
                  API
                </Link>
              </li> */}
              {/* <li>
                <Link href="/community" className="text-sm text-muted-foreground hover:text-primary">
                  Community
                </Link>
              </li> */}
            {/* </ul> */}
          </div>

          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
              {/* <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">
                  Careers
                </Link>
              </li> */}
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Pixie Talk. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

