'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890')

// Stripe Card Form Component
function StripeCardForm({ paymentForm, handleInputChange, onPayment, isProcessing, totalAmount, currency }) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    await onPayment(stripe, cardElement)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          value={paymentForm.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
          required
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Information *
        </label>
        <div className="p-3 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={paymentForm.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country/Region *
        </label>
        <select
          value={paymentForm.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select country</option>
          <option value="RW">Rwanda</option>
          <option value="KE">Kenya</option>
          <option value="UG">Uganda</option>
          <option value="TZ">Tanzania</option>
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
        </select>
      </div>

      {/* Optional Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={paymentForm.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="+250 781 234 567"
        />
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </>
        ) : (
          `Pay ${totalAmount} ${currency}`
        )}
      </button>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [application, setApplication] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [paymentForm, setPaymentForm] = useState({
    email: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    country: '',
    phoneNumber: ''
  })

  // Currency exchange rates (USD as base)
  const exchangeRates = {
    USD: 1,       // 1 USD = 1 USD
    EUR: 0.92,    // 1 USD = 0.92 EUR
    RWF: 1320     // 1 USD = 1320 RWF (current exchange rate)
  }

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' }
  ]

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    } else {
      router.push('/login')
    }

    // Get application details from URL params or localStorage
    const applicationId = searchParams.get('applicationId')
    const licenseType = searchParams.get('licenseType')
    const fees = searchParams.get('fees')

    if (applicationId && licenseType && fees) {
      setApplication({
        id: applicationId,
        licenseType: licenseType,
        fees: JSON.parse(fees)
      })
    } else {
      // Fallback: try to get from localStorage (set during application submission)
      const pendingPayment = localStorage.getItem('pendingPayment')
      if (pendingPayment) {
        setApplication(JSON.parse(pendingPayment))
        localStorage.removeItem('pendingPayment') // Clean up
      }
    }

    // Pre-fill email if user is logged in
    if (user?.email) {
      setPaymentForm(prev => ({ ...prev, email: user.email }))
    }
  }, [searchParams, router, user])

  // Convert amount from USD to selected currency
  const convertAmount = (amountInUSD: number) => {
    return amountInUSD * exchangeRates[selectedCurrency]
  }

  // Format currency display
  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode)
    return `${currency?.symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: currencyCode === 'RWF' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'RWF' ? 0 : 2
    })}`
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (paymentMethod === 'card') {
      return paymentForm.email && paymentForm.cardNumber && paymentForm.expiryMonth && 
             paymentForm.expiryYear && paymentForm.cvc && paymentForm.cardholderName && paymentForm.country
    } else {
      return paymentForm.email && paymentForm.phoneNumber
    }
  }

  const handleStripePayment = async (stripe, cardElement) => {
    if (!stripe || !cardElement) {
      setMessage('❌ Payment system unavailable. Please try again.')
      return
    }

    setIsProcessing(true)
    setMessage('')

    try {
      const totalAmountUSD = application.fees.application + application.fees.license
      
      // Create payment intent on the backend
      const response = await fetch('http://127.0.0.1:5002/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmountUSD * 100), // Stripe expects amount in cents
          currency: selectedCurrency.toLowerCase(),
          applicationId: application.id,
          userId: user.id || user.email,
          licenseType: application.licenseType,
          paymentDetails: paymentForm
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Confirm payment with Stripe Elements
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentForm.cardholderName,
            email: paymentForm.email,
            phone: paymentForm.phoneNumber,
            address: {
              country: paymentForm.country,
            },
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent.status === 'succeeded') {
        setMessage('✅ Payment processed successfully! Redirecting to dashboard...')
        
        setTimeout(() => {
          router.push('/client-dashboard?tab=applications&status=paid')
        }, 2000)
      }

    } catch (error) {
      console.error('Payment error:', error)
      setMessage(`❌ Payment failed: ${error.message || 'Please try again.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMobileMoneyPayment = async () => {
    setIsProcessing(true)
    setMessage('')

    try {
      const totalAmountUSD = application.fees.application + application.fees.license
      
      const response = await fetch('http://127.0.0.1:5002/process-mobile-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmountUSD,
          currency: selectedCurrency,
          phoneNumber: paymentForm.phoneNumber,
          applicationId: application.id,
          userId: user.id || user.email,
          licenseType: application.licenseType,
          email: paymentForm.email
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Mobile payment failed')
      }

      setMessage('✅ Payment request sent to your phone. Please check your mobile money app and confirm the payment.')
      
      // Poll for payment status
      setTimeout(() => {
        router.push('/client-dashboard?tab=applications&status=pending-payment')
      }, 3000)

    } catch (error) {
      console.error('Mobile payment error:', error)
      setMessage(`❌ Payment failed: ${error.message || 'Please try again.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async (stripe, cardElement) => {
    if (!application || !user) {
      setMessage('Missing payment information. Please try again.')
      return
    }

    if (paymentMethod === 'card') {
      await handleStripePayment(stripe, cardElement)
    } else {
      await handleMobileMoneyPayment()
    }
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Payment Details...</h1>
          <p className="text-gray-600">Please wait while we prepare your payment information.</p>
        </div>
      </div>
    )
  }

  const totalAmountUSD = application.fees.application + application.fees.license
  const totalAmountSelected = convertAmount(totalAmountUSD)
  const totalAmountRWF = totalAmountUSD * exchangeRates.RWF // Always show RWF equivalent

  return (
    <Elements stripe={stripePromise}>
      <PaymentPageContent 
        application={application}
        user={user}
        message={message}
        setMessage={setMessage}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentForm={paymentForm}
        handleInputChange={handleInputChange}
        isProcessing={isProcessing}
        handlePayment={handlePayment}
        handleMobileMoneyPayment={handleMobileMoneyPayment}
        totalAmountUSD={totalAmountUSD}
        totalAmountSelected={totalAmountSelected}
        totalAmountRWF={totalAmountRWF}
        currencies={currencies}
        formatCurrency={formatCurrency}
        convertAmount={convertAmount}
        router={router}
      />
    </Elements>
  )
}

function PaymentPageContent({ 
  application, user, message, setMessage, selectedCurrency, setSelectedCurrency,
  paymentMethod, setPaymentMethod, paymentForm, handleInputChange, isProcessing,
  handlePayment, handleMobileMoneyPayment, totalAmountUSD, totalAmountSelected, 
  totalAmountRWF, currencies, formatCurrency, convertAmount, router 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/client-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Secure payment for your license application</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Order Summary & Currency */}
          <div className="space-y-6">
            {/* Application Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-gray-600">License Type:</span>
                  <p className="font-medium text-gray-900">{application.licenseType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Application ID:</span>
                  <p className="font-medium text-gray-900">#{application.id}</p>
                </div>
              </div>

              {/* Currency Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Fee:</span>
                    <span className="font-medium">{formatCurrency(convertAmount(application.fees.application), selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License Fee:</span>
                    <span className="font-medium">{formatCurrency(convertAmount(application.fees.license), selectedCurrency)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">{formatCurrency(totalAmountSelected, selectedCurrency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RWF Conversion Box */}
              {selectedCurrency !== 'RWF' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-1">Equivalent in Rwandan Francs:</p>
                  <p className="text-lg font-semibold text-blue-900">{formatCurrency(totalAmountRWF, 'RWF')}</p>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Secure Payment</p>
                  <p className="text-sm text-gray-600">
                    Your payment information is encrypted and secure. We do not store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded-lg flex flex-col items-center ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-sm font-medium">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('mobile')}
                  className={`p-4 border rounded-lg flex flex-col items-center ${
                    paymentMethod === 'mobile' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Mobile Money</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'card' ? (
              <StripeCardForm
                paymentForm={paymentForm}
                handleInputChange={handleInputChange}
                onPayment={handlePayment}
                isProcessing={isProcessing}
                totalAmount={formatCurrency(totalAmountSelected, selectedCurrency)}
                currency={selectedCurrency}
              />
            ) : (
              <form className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={paymentForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {/* Mobile Money Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <select className="absolute left-0 top-0 h-full w-20 border-r border-gray-300 bg-gray-50 rounded-l-lg text-sm">
                      <option value="+250">+250</option>
                      <option value="+254">+254</option>
                      <option value="+256">+256</option>
                    </select>
                    <input
                      type="tel"
                      value={paymentForm.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full pl-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="781234567"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll send a payment request to your mobile money account
                  </p>
                </div>

                {/* Pay Button */}
                <button
                  type="button"
                  onClick={handleMobileMoneyPayment}
                  disabled={isProcessing || !paymentForm.email || !paymentForm.phoneNumber}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ${formatCurrency(totalAmountSelected, selectedCurrency)} with Mobile Money`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
