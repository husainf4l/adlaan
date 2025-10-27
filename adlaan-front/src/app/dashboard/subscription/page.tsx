"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Calendar, Users, FileText, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function SubscriptionPage() {
  const currentPlan = {
    name: "Professional",
    price: "$29",
    period: "month",
    status: "active",
    nextBilling: "November 15, 2025",
    features: [
      "Unlimited document generation",
      "Advanced AI analysis",
      "Cloud storage (100GB)",
      "Team collaboration (up to 10 members)",
      "Priority support",
      "API access"
    ]
  };

  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 50 documents/month",
        "Basic AI analysis",
        "Cloud storage (5GB)",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "month",
      description: "Ideal for growing teams",
      features: [
        "Unlimited document generation",
        "Advanced AI analysis",
        "Cloud storage (100GB)",
        "Team collaboration (up to 10 members)",
        "Priority support",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Cloud storage (1TB)",
        "Advanced analytics",
        "Dedicated support manager",
        "Custom integrations",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription plan and billing
          </p>
        </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                {currentPlan.price}/{currentPlan.period}
              </p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {currentPlan.status}
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing date: {currentPlan.nextBilling}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Plan Features:</h4>
            <ul className="space-y-1">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-center">{plan.name}</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.name === currentPlan.name ? "outline" : "default"}
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Oct 15, 2025", amount: "$29.00", status: "Paid", invoice: "INV-2025-001" },
              { date: "Sep 15, 2025", amount: "$29.00", status: "Paid", invoice: "INV-2025-002" },
              { date: "Aug 15, 2025", amount: "$29.00", status: "Paid", invoice: "INV-2025-003" }
            ].map((bill, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{bill.invoice}</p>
                  <p className="text-sm text-muted-foreground">{bill.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{bill.amount}</p>
                  <Badge variant="secondary" className="text-xs">
                    {bill.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4">
            View All Invoices
          </Button>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.4 GB</div>
            <p className="text-xs text-muted-foreground">
              23% of 100GB limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              3 seats remaining
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}