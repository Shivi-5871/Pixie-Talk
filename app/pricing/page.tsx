

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardHeader } from "@/components/dashboard/header";


const Pricing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize as false
  const [authChecked, setAuthChecked] = useState(false); // Track if auth check completed
  const [isYearly, setIsYearly] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  if (!authChecked) return null

  const plans = [
    {
      name: "Free",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        "Limited free generations",
        "Limited access to Pixie Talk tools",
      ],
      isCurrent: true,
      buttonText: "Current Plan",
    },
    {
      name: "Basic",
      monthlyPrice: "$12",
      yearlyPrice: "$10",
      features: [
        "~1,010 Flux images",
        "~36,000 real-time images",
        "~180 enhanced images",
        "~6 training jobs",
        "Commercial license",
      ],
      isCurrent: false,
      buttonText: "Get Started",
    },
    {
      name: "Pro",
      monthlyPrice: "$30",
      yearlyPrice: "$25",
      features: [
        "~5,048 Flux images",
        "~180,000 real-time images",
        "~900 enhanced images",
        "~30 training jobs",
        "Commercial license",
      ],
      isCurrent: false,
      buttonText: "Get Started",
    },
    {
      name: "Max",
      monthlyPrice: "$80",
      yearlyPrice: "$64",
      features: [
        "~15,142 Flux images",
        "~648,000 real-time images",
        "~3,240 enhanced images",
        "~108 training jobs",
        "Commercial license",
      ],
      isCurrent: false,
      buttonText: "Get Started",
    },
  ]

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName)
    console.log(`Selected plan: ${planName}`)
    router.push(`/subscribe?plan=${planName.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}

      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Pixie Talk Plans</h1>
          <p className="text-purple-600 dark:text-purple-400 mt-2">
            Upgrade to gain access to Pro features and generate more, faster.
          </p>
          {/* <p className="text-purple-500 dark:text-purple-300 mt-2">
            <Link href="/enterprise" className="hover:underline">Enterprise and team plans now available
          </p> */}
        </div>

        <div className="flex justify-center mb-8">
          <span className="mr-4 text-gray-500 dark:text-gray-300">Save 20%</span>
          <Button
            variant={isYearly ? "default" : "outline"}
            onClick={() => setIsYearly(true)}
            className=" bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
          >
            Yearly
          </Button>
          <Button
            variant={!isYearly ? "default" : "outline"}
            onClick={() => setIsYearly(false)}
            className=" bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
          >
            Monthly
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`bg-gray-100 dark:bg-gray-800 border-none ${selectedPlan === plan.name ? "ring-2 ring-purple-500" : ""}`}
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-purple-300">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice} / {isYearly ? "month (billed yearly)" : "month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2 text-purple-600 dark:text-purple-400">✔</span> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
              <Button
  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
  disabled={plan.isCurrent && selectedPlan === plan.name}
  // onClick={() => !plan.isCurrent && handleUpgrade(plan.name)}
>
  {plan.buttonText}
</Button>

              </CardFooter>
            </Card>
          ))}
        </div>

        {/* <div className="text-center mt-8 text-yellow-600 dark:text-yellow-400">
          Heads up: You’ve utilized over 80% of your compute time.{" "}
          <Link href="/upgrade" className="text-purple-600 dark:text-purple-400 hover:underline">
            Upgrade?
          </Link>
        </div> */}
      </div>
      <Footer />
    </div>
  )
}

export default Pricing
