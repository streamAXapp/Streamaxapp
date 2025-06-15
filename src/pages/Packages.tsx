import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { 
  Check, 
  MessageCircle, 
  Zap, 
  Users, 
  Crown, 
  Star 
} from 'lucide-react';

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Rp 29.000',
    period: '/month',
    description: 'Perfect for beginners',
    streams: 1,
    features: [
      '1 concurrent stream',
      '24/7 streaming',
      'Basic support',
      'Video upload',
      'RTMP streaming',
    ],
    icon: Zap,
    gradient: 'from-green-500 to-emerald-600',
    popular: false,
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 'Rp 75.000',
    period: '/month',
    description: 'Great for content creators',
    streams: 3,
    features: [
      '3 concurrent streams',
      '24/7 streaming',
      'Priority support',
      'Video upload & links',
      'RTMP streaming',
      'Stream analytics',
    ],
    icon: Users,
    gradient: 'from-blue-500 to-purple-600',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Rp 199.000',
    period: '/month',
    description: 'For professional streamers',
    streams: 10,
    features: [
      '10 concurrent streams',
      '24/7 streaming',
      'Premium support',
      'All video sources',
      'RTMP streaming',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
    icon: Crown,
    gradient: 'from-purple-600 to-pink-600',
    popular: false,
  },
];

export function Packages() {
  const { user } = useAuth();

  const handlePurchase = (packageName: string) => {
    const message = encodeURIComponent(
      `Halo Admin, saya ingin membeli Paket ${packageName}.\nEmail saya: ${user?.email}\n\nTerima kasih!`
    );
    const whatsappUrl = `https://wa.me/6281234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Choose Your Plan</h1>
          <p className="mt-2 text-slate-600">
            Start streaming 24/7 to YouTube with our professional service
          </p>
        </div>

        {/* Current Package */}
        {user.package_type && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Current Plan</h3>
                <p className="text-sm text-slate-600">
                  You're currently on the{' '}
                  <span className="font-medium capitalize">{user.package_type}</span> plan
                  {user.package_expires_at && (
                    <span>
                      {' '}
                      (expires{' '}
                      {new Date(user.package_expires_at).toLocaleDateString()})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const IconComponent = pkg.icon;
            const isCurrentPackage = user.package_type === pkg.id;
            
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  pkg.popular
                    ? 'border-purple-500 scale-105'
                    : 'border-slate-200 hover:border-purple-300'
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
                    <h3 className="text-2xl font-bold text-slate-800">{pkg.name}</h3>
                    <p className="text-slate-600 mt-2">{pkg.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-slate-800">{pkg.price}</span>
                      <span className="text-slate-600">{pkg.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{pkg.streams}</div>
                      <div className="text-sm text-slate-600">Concurrent Streams</div>
                    </div>
                    
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.name)}
                    disabled={isCurrentPackage}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                      isCurrentPackage
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                        : pkg.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    {isCurrentPackage ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Current Plan</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>Buy via WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">How to Purchase</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Choose Package</h4>
              <p className="text-sm text-slate-600">
                Select the package that fits your streaming needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Contact Admin</h4>
              <p className="text-sm text-slate-600">
                Click "Buy via WhatsApp" to contact our admin
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Get Activated</h4>
              <p className="text-sm text-slate-600">
                Admin will activate your package after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}