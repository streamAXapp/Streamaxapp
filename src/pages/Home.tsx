import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Zap, Shield, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StreamAX
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-purple-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Stream to YouTube{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                24/7
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Professional streaming service with Docker-based isolation. Start streaming your content 
              to YouTube around the clock with enterprise-grade reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Streaming
              </Link>
              <Link
                to="/packages"
                className="inline-flex items-center px-8 py-4 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all"
              >
                View Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose StreamAX?</h2>
            <p className="text-xl text-slate-600">
              Professional streaming infrastructure designed for content creators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">24/7 Streaming</h3>
              <p className="text-slate-600">
                Keep your content live around the clock with our automated streaming technology.
                Never miss an audience again.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Docker Isolation</h3>
              <p className="text-slate-600">
                Each user gets their own isolated Docker container for maximum security 
                and performance isolation.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Easy Setup</h3>
              <p className="text-slate-600">
                Get started in minutes. Upload your content, add your RTMP URL, 
                and start streaming instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">
              Choose the plan that fits your streaming needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Rp 29.000',
                period: '/month',
                streams: 1,
                features: ['1 concurrent stream', '24/7 streaming', 'Basic support'],
                gradient: 'from-green-500 to-emerald-600',
              },
              {
                name: 'Creator',
                price: 'Rp 75.000',
                period: '/month',
                streams: 3,
                features: ['3 concurrent streams', '24/7 streaming', 'Priority support', 'Analytics'],
                gradient: 'from-purple-500 to-blue-600',
                popular: true,
              },
              {
                name: 'Pro',
                price: 'Rp 199.000',
                period: '/month',
                streams: 10,
                features: ['10 concurrent streams', '24/7 streaming', 'Premium support', 'API access'],
                gradient: 'from-pink-500 to-purple-600',
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.popular ? 'border-purple-500 scale-105' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} items-center justify-center mb-4`}>
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-4">{plan.streams}</div>
                  <div className="text-sm text-slate-600 mb-6">Concurrent Streams</div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all inline-block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">StreamAX</span>
            </div>
            <p className="text-slate-400 text-center md:text-right">
              © 2024 StreamAX. Professional 24/7 YouTube streaming service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}