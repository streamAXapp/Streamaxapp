import Link from 'next/link'
import { ArrowLeft, FileText, Shield, AlertTriangle } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to StreamAX ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our 24/7 YouTube streaming service platform. By accessing or using StreamAX, you agree to be bound by these Terms.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Service Description</h2>
            <div className="space-y-4 text-gray-700">
              <p>StreamAX provides:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>24/7 YouTube streaming services using Docker containerization</li>
                <li>Video upload and streaming management tools</li>
                <li>Multi-tier subscription packages</li>
                <li>Real-time stream monitoring and analytics</li>
                <li>Technical support for streaming operations</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">3.1 Account Creation</h3>
              <p>To use our services, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
              
              <h3 className="text-lg font-medium">3.2 Account Security</h3>
              <p>You must immediately notify us of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized account access.</p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Acceptable Use Policy</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-yellow-700 text-sm">Violation of these policies may result in immediate account suspension.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">4.1 Prohibited Content</h3>
              <p>You may not stream or upload content that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violates any applicable laws or regulations</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains hate speech, harassment, or discriminatory content</li>
                <li>Includes adult content or material harmful to minors</li>
                <li>Promotes violence, illegal activities, or dangerous behavior</li>
                <li>Contains malware, viruses, or malicious code</li>
              </ul>

              <h3 className="text-lg font-medium">4.2 Technical Restrictions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Do not attempt to circumvent rate limits or security measures</li>
                <li>Do not use automated tools to abuse our services</li>
                <li>Do not interfere with other users' streaming operations</li>
                <li>Respect the concurrent stream limits of your subscription plan</li>
              </ul>
            </div>
          </section>

          {/* Subscription and Billing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Subscription and Billing</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">5.1 Subscription Plans</h3>
              <p>We offer multiple subscription tiers with different features and stream limits. Plan details and pricing are available on our website.</p>
              
              <h3 className="text-lg font-medium">5.2 Payment Terms</h3>
              <p>Subscriptions are billed in advance on a monthly basis. Payment is currently processed through WhatsApp contact with our admin team.</p>
              
              <h3 className="text-lg font-medium">5.3 Refund Policy</h3>
              <p>Refunds are considered on a case-by-case basis for service outages exceeding 24 hours due to our technical issues.</p>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Service Availability</h2>
            <div className="space-y-4 text-gray-700">
              <p>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Planned maintenance will be announced in advance when possible.</p>
              
              <h3 className="text-lg font-medium">6.1 Service Limitations</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Stream quality depends on your source material and internet connection</li>
                <li>YouTube's terms of service and policies apply to all streams</li>
                <li>We reserve the right to suspend streams that violate platform policies</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Privacy and Data Protection</h2>
            <div className="space-y-4 text-gray-700">
              <p>Your privacy is important to us. Please review our <Link href="/legal/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link> for details on how we collect, use, and protect your data.</p>
              
              <h3 className="text-lg font-medium">7.1 Data Security</h3>
              <p>We implement industry-standard security measures to protect your data, including encryption and secure Docker containerization.</p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p>You retain ownership of your content. By using our service, you grant us a limited license to process and stream your content as necessary to provide our services.</p>
              
              <h3 className="text-lg font-medium">8.1 Copyright Compliance</h3>
              <p>You are responsible for ensuring you have the right to stream all content. We will respond to valid DMCA takedown notices.</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitation of Liability</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="text-gray-700">
                  <p className="font-medium mb-2">Liability Limitations</p>
                  <p className="text-sm">
                    To the maximum extent permitted by law, StreamAX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>Either party may terminate the service agreement at any time. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
              
              <h3 className="text-lg font-medium">10.1 Effect of Termination</h3>
              <p>Upon termination, your access to the service will cease, and we may delete your account data after a reasonable notice period.</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may update these Terms from time to time. We will notify users of significant changes via email or platform notifications.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>For questions about these Terms, please contact us:</p>
              <ul className="space-y-2">
                <li><strong>WhatsApp:</strong> +62 812-3456-7890</li>
                <li><strong>Email:</strong> legal@streamax.com</li>
                <li><strong>Address:</strong> StreamAX Legal Department</li>
              </ul>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Governing Law</h2>
            <div className="space-y-4 text-gray-700">
              <p>These Terms are governed by the laws of Indonesia. Any disputes will be resolved through binding arbitration in Jakarta, Indonesia.</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>© 2024 StreamAX. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/legal/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
            <Link href="/" className="text-purple-600 hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}