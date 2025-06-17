import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Globe } from 'lucide-react'

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
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
              At StreamAX, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 24/7 YouTube streaming service. Please read this privacy policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Personal Information</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Email address and account credentials</li>
                      <li>• Payment information (processed securely)</li>
                      <li>• Profile information you provide</li>
                      <li>• Communication preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Usage Information</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Stream session data and analytics</li>
                      <li>• Video upload information and metadata</li>
                      <li>• Service usage patterns and preferences</li>
                      <li>• Error logs and performance metrics</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-800 mb-2">Technical Information</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• IP address and device information</li>
                      <li>• Browser type and version</li>
                      <li>• Operating system information</li>
                      <li>• Cookies and similar technologies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our streaming services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Monitor and improve service performance</li>
                <li>Provide customer support and technical assistance</li>
                <li>Send important service notifications and updates</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to improve our services</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Lock className="w-6 h-6 text-gray-600 mt-0.5" />
                <div className="text-gray-700">
                  <h4 className="font-medium mb-3">Security Measures</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard encryption protocols.</p>
                    <p><strong>Access Control:</strong> Strict access controls ensure only authorized personnel can access your data.</p>
                    <p><strong>Docker Isolation:</strong> Each user's streaming environment is isolated using Docker containers.</p>
                    <p><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</p>
                    <p><strong>Secure Infrastructure:</strong> Our infrastructure is hosted on secure, compliant cloud platforms.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Information Sharing and Disclosure</h2>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
              
              <h3 className="text-lg font-medium">5.1 Service Providers</h3>
              <p>We may share information with trusted third-party service providers who assist us in operating our platform, such as:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cloud hosting and infrastructure providers</li>
                <li>Payment processing services</li>
                <li>Analytics and monitoring tools</li>
                <li>Customer support platforms</li>
              </ul>

              <h3 className="text-lg font-medium">5.2 Legal Requirements</h3>
              <p>We may disclose your information when required by law or to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud or abuse of our services</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Retention</h2>
            <div className="space-y-4 text-gray-700">
              <p>We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Retained while your account is active and for 30 days after deletion</li>
                <li><strong>Stream Data:</strong> Retained for 90 days for performance monitoring and troubleshooting</li>
                <li><strong>Payment Information:</strong> Retained as required by financial regulations (typically 7 years)</li>
                <li><strong>Support Communications:</strong> Retained for 2 years for quality assurance</li>
                <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Privacy Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Access & Portability</h4>
                  <p className="text-blue-700 text-sm">Request access to your personal data and receive a copy in a portable format.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Correction</h4>
                  <p className="text-green-700 text-sm">Request correction of inaccurate or incomplete personal information.</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Deletion</h4>
                  <p className="text-yellow-700 text-sm">Request deletion of your personal information, subject to legal requirements.</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Restriction</h4>
                  <p className="text-purple-700 text-sm">Request restriction of processing in certain circumstances.</p>
                </div>
              </div>

              <p className="mt-4">To exercise these rights, please contact us using the information provided in the Contact section below.</p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies and Tracking Technologies</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies and similar tracking technologies to enhance your experience:</p>
              
              <h3 className="text-lg font-medium">8.1 Types of Cookies</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality and security</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use our service</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Provide insights into service usage and performance</li>
              </ul>

              <h3 className="text-lg font-medium">8.2 Cookie Management</h3>
              <p>You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our service.</p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. International Data Transfers</h2>
            <div className="space-y-4 text-gray-700">
              <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Adequacy decisions by relevant data protection authorities</li>
                <li>Standard contractual clauses approved by the European Commission</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Binding corporate rules for intra-group transfers</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Children's Privacy</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-red-700">
                  <h4 className="font-medium mb-2">Age Restriction</h4>
                  <p className="text-sm">
                    Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to This Privacy Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Sending you an email notification for significant changes</li>
                <li>Displaying a prominent notice on our service</li>
              </ul>
              <p>You are advised to review this Privacy Policy periodically for any changes.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Us</h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <p><strong>Email:</strong> privacy@streamax.com</p>
                  <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
                  <p><strong>Address:</strong> StreamAX Privacy Team<br />
                     Data Protection Office<br />
                     Jakarta, Indonesia</p>
                </div>
              </div>

              <p className="text-sm">
                For EU residents: You also have the right to lodge a complaint with your local data protection authority if you believe we have not addressed your concerns adequately.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>© 2024 StreamAX. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/legal/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
            <Link href="/" className="text-purple-600 hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}