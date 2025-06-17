import React from 'react'
import { Check, Crown, Users, Zap } from 'lucide-react'
import { Button } from './ui/button'

interface Package {
  id: string
  name: string
  price: string
  period: string
  description: string
  streams: number
  features: string[]
  popular?: boolean
  gradient: string
}

interface PackageCardProps {
  package: Package
  isCurrentPackage?: boolean
  onPurchase: (packageName: string) => void
}

export function PackageCard({ package: pkg, isCurrentPackage, onPurchase }: PackageCardProps) {
  const getIcon = () => {
    switch (pkg.id) {
      case 'starter':
        return Zap
      case 'creator':
        return Users
      case 'pro':
        return Crown
      default:
        return Zap
    }
  }

  const IconComponent = getIcon()

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
        pkg.popular
          ? 'border-purple-500 scale-105 ring-4 ring-purple-100'
          : 'border-gray-200 hover:border-purple-300'
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-r ${pkg.gradient} items-center justify-center mb-4`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{pkg.name}</h3>
          <p className="text-gray-600 mt-2">{pkg.description}</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-800">{pkg.price}</span>
            <span className="text-gray-600">{pkg.period}</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{pkg.streams}</div>
            <div className="text-sm text-gray-600">Concurrent Streams</div>
          </div>
          
          <ul className="space-y-3">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={() => onPurchase(pkg.name)}
          disabled={isCurrentPackage}
          className={`w-full ${
            isCurrentPackage
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : pkg.popular
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              : 'bg-gray-800 text-white hover:bg-gray-900'
          }`}
        >
          {isCurrentPackage ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Current Plan
            </>
          ) : (
            'Get Started'
          )}
        </Button>
      </div>
    </div>
  )
}