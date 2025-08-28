'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Calendar, Percent, TrendingUp, Check, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const financingOptions = [
  {
    title: 'Traditional Bank Loan',
    rate: '5.5% - 8.5%',
    term: '3-7 years',
    downPayment: '10-20%',
    description: 'Competitive rates from our partner banks with flexible terms.',
    features: ['Fixed interest rates', 'No prepayment penalties', 'Quick approval process'],
    icon: DollarSign
  },
  {
    title: 'Equipment Financing',
    rate: '4.5% - 7.5%',
    term: '2-5 years',
    downPayment: '0-15%',
    description: 'Specialized financing where the vehicle serves as collateral.',
    features: ['Lower down payments', 'Tax advantages', 'Preserve working capital'],
    icon: TrendingUp
  },
  {
    title: 'Lease to Own',
    rate: '6.0% - 9.0%',
    term: '2-4 years',
    downPayment: '5-10%',
    description: 'Lease with option to purchase at the end of the term.',
    features: ['Lower monthly payments', 'Ownership option', 'Maintenance packages available'],
    icon: Calendar
  }
]

const benefits = [
  'Competitive interest rates starting at 4.5%',
  'Flexible down payment options',
  'Quick approval process (24-48 hours)',
  'Multiple financing partners',
  'Bad credit financing available',
  'Business and personal financing',
  'Online application process',
  'Dedicated financing specialists'
]

export default function FinancingPage() {
  const [calculatorData, setCalculatorData] = useState({
    vehiclePrice: '',
    downPayment: '',
    interestRate: '6.5',
    loanTerm: '5'
  })

  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  const calculatePayment = () => {
    const price = parseFloat(calculatorData.vehiclePrice) || 0
    const down = parseFloat(calculatorData.downPayment) || 0
    const rate = parseFloat(calculatorData.interestRate) / 100 / 12
    const term = parseFloat(calculatorData.loanTerm) * 12

    if (price <= 0 || rate <= 0 || term <= 0) {
      setMonthlyPayment(0)
      setTotalInterest(0)
      setTotalPayment(0)
      return
    }

    const loanAmount = price - down
    
    if (loanAmount <= 0) {
      setMonthlyPayment(0)
      setTotalInterest(0)
      setTotalPayment(down)
      return
    }

    const monthlyPaymentAmount = (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
    const totalPaymentAmount = monthlyPaymentAmount * term + down
    const totalInterestAmount = totalPaymentAmount - price

    setMonthlyPayment(monthlyPaymentAmount)
    setTotalInterest(totalInterestAmount)
    setTotalPayment(totalPaymentAmount)
  }

  useEffect(() => {
    calculatePayment()
  }, [calculatorData])

  const handleInputChange = (field: string, value: string) => {
    setCalculatorData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Vehicle Financing Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the commercial vehicle you need with flexible financing options tailored to your business. 
            Calculate your payments and explore our competitive rates.
          </p>
        </div>

        {/* Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Calculator Form */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 flex items-center">
                <Calculator className="h-6 w-6 mr-3 text-gray-600" />
                Payment Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="number"
                    placeholder="75,000"
                    value={calculatorData.vehiclePrice}
                    onChange={(e) => handleInputChange('vehiclePrice', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Down Payment
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="number"
                    placeholder="15,000"
                    value={calculatorData.downPayment}
                    onChange={(e) => handleInputChange('downPayment', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (APR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Percent className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    value={calculatorData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term (Years)
                </label>
                <select 
                  className="input w-full"
                  value={calculatorData.loanTerm}
                  onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                >
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="4">4 Years</option>
                  <option value="5">5 Years</option>
                  <option value="6">6 Years</option>
                  <option value="7">7 Years</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-gray-50 border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600">Monthly Payment</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(monthlyPayment)}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600">Total Interest</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(totalInterest)}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600">Total Payment</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(totalPayment)}
                  </div>
                </div>
              </div>

              {calculatorData.vehiclePrice && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-3">Loan Details</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vehicle Price:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(calculatorData.vehiclePrice) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(calculatorData.downPayment) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span className="font-medium">{formatCurrency((parseFloat(calculatorData.vehiclePrice) || 0) - (parseFloat(calculatorData.downPayment) || 0))}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg">
                Apply for Financing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Financing Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Financing Options
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from multiple financing solutions designed to meet your business needs and budget requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {financingOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">{option.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Interest Rate:</span>
                          <span className="text-sm font-medium text-gray-900">{option.rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loan Term:</span>
                          <span className="text-sm font-medium text-gray-900">{option.term}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Down Payment:</span>
                          <span className="text-sm font-medium text-gray-900">{option.downPayment}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                          {option.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button variant="secondary" className="w-full">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Financing?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-gray-50 border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Our financing specialists are here to help you find the perfect solution for your commercial vehicle needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Call Us</div>
                    <div className="text-sm text-gray-600">+1 (555) 123-FINANCE</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email Us</div>
                    <div className="text-sm text-gray-600">financing@elitefleet.com</div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <Button className="w-full">
                  Apply Online Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gray-100 border border-gray-300 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Get Pre-Approved Today
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Complete our simple online application and receive a financing decision within 24 hours. 
              No obligation and won't affect your credit score.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Start Application
              </Button>
              <Button variant="secondary" size="lg">
                Talk to Specialist
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}