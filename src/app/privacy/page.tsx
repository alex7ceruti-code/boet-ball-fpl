import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Users, Globe } from 'lucide-react';
import { getSASlang } from '@/utils/slang';

export const metadata = {
  title: 'Privacy Policy - Boet Ball FPL',
  description: 'Privacy policy and data protection information for Boet Ball Fantasy Premier League companion app',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign Up
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">
              Effective Date: December 2024 | Your privacy matters to us! 🇿🇦
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-purple-600" />
                Your Privacy is Our Priority
              </h2>
              <div className="prose prose-gray max-w-none space-y-4">
                <p>
                  {getSASlang('greetings', 'howzit')}! At Boet Ball FPL, we respect your privacy and are committed to 
                  protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard 
                  your data when you use our Fantasy Premier League companion application.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">🇿🇦 POPIA Compliant</p>
                  <p className="text-green-700 text-sm">
                    This policy complies with South Africa's Protection of Personal Information Act (POPIA) 
                    and ensures your rights are protected under South African law.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                1. Information We Collect
              </h3>
              <div className="prose prose-gray max-w-none space-y-4">
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">📋 Account Information</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Full name and email address</li>
                      <li>• Encrypted password</li>
                      <li>• FPL team ID (optional)</li>
                      <li>• Favorite Premier League team</li>
                      <li>• Location (for SA cultural features)</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="font-semibold text-purple-800 mb-2">📊 Usage Information</p>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• Pages visited and features used</li>
                      <li>• Time spent on the application</li>
                      <li>• Device and browser information</li>
                      <li>• IP address and general location</li>
                      <li>• FPL API interactions (anonymous)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 mb-2">⚠️ What We DON'T Collect</p>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Your FPL account password or login credentials</li>
                    <li>• Sensitive financial information</li>
                    <li>• Personal ID numbers or government documents</li>
                    <li>• Private messages or personal communications</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                2. How We Use Your Information
              </h3>
              <div className="prose prose-gray max-w-none space-y-4">
                <p>We use your personal information for the following purposes:</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-800 mb-2">🎯 Service Delivery</p>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Provide FPL insights</li>
                      <li>• Personalize content</li>
                      <li>• Generate reports</li>
                      <li>• Sync FPL data</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="font-semibold text-orange-800 mb-2">📈 Improvement</p>
                    <ul className="text-orange-700 text-sm space-y-1">
                      <li>• Analyze app usage</li>
                      <li>• Fix bugs and issues</li>
                      <li>• Develop new features</li>
                      <li>• Enhance user experience</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">📧 Communication</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Send account updates</li>
                      <li>• Delivery FPL tips (if opted in)</li>
                      <li>• Provide customer support</li>
                      <li>• Security notifications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Basis (POPIA) */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Legal Basis for Processing (POPIA Compliance)</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>Under POPIA, we process your personal information based on the following legal grounds:</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <ul className="text-green-700 space-y-2">
                    <li><strong>Consent:</strong> When you opt-in to marketing communications or non-essential features</li>
                    <li><strong>Contract:</strong> To provide the FPL companion service you've signed up for</li>
                    <li><strong>Legitimate Interest:</strong> To improve our service and prevent fraud</li>
                    <li><strong>Legal Obligation:</strong> To comply with South African laws and regulations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                4. Information Sharing & Disclosure
              </h3>
              <div className="prose prose-gray max-w-none space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">🚫 We NEVER Sell Your Data</p>
                  <p className="text-red-700 text-sm">
                    We do not sell, trade, or rent your personal information to third parties. Your data stays with us.
                  </p>
                </div>
                
                <p>We only share your information in these limited circumstances:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate our service (hosting, email delivery)</li>
                  <li><strong>Legal Requirements:</strong> When required by South African law or legal process</li>
                  <li><strong>Safety & Security:</strong> To protect our users and prevent fraudulent activity</li>
                  <li><strong>Business Transfer:</strong> In the unlikely event of a merger or acquisition (with your consent)</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-semibold mb-2">🤝 FPL API Integration</p>
                  <p className="text-blue-700 text-sm">
                    We access the official Fantasy Premier League API using only your FPL team ID. 
                    No personal login credentials are shared with or stored by third-party services.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                5. Data Security & Protection
              </h3>
              <div className="prose prose-gray max-w-none space-y-4">
                <p>We implement robust security measures to protect your information:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="font-semibold text-purple-800 mb-2">🔒 Technical Safeguards</p>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• SSL/TLS encryption in transit</li>
                      <li>• Database encryption at rest</li>
                      <li>• Secure password hashing</li>
                      <li>• Regular security audits</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="font-semibold text-indigo-800 mb-2">🛡️ Access Controls</p>
                    <ul className="text-indigo-700 text-sm space-y-1">
                      <li>• Limited employee access</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Regular access reviews</li>
                      <li>• Secure hosting infrastructure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights (POPIA) */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights Under POPIA</h3>
              <div className="prose prose-gray max-w-none space-y-4">
                <p>As a South African resident, you have the following rights regarding your personal information:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="font-semibold text-emerald-800 mb-2">✅ Access & Portability</p>
                    <ul className="text-emerald-700 text-sm space-y-1">
                      <li>• Request a copy of your data</li>
                      <li>• Export your information</li>
                      <li>• Understand how we use your data</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="font-semibold text-amber-800 mb-2">✏️ Correction & Updates</p>
                    <ul className="text-amber-700 text-sm space-y-1">
                      <li>• Correct inaccurate information</li>
                      <li>• Update your profile details</li>
                      <li>• Modify your preferences</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800 mb-2">🗑️ Deletion & Restriction</p>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Request account deletion</li>
                      <li>• Restrict data processing</li>
                      <li>• Withdraw consent</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">⚖️ Objection & Complaints</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Object to data processing</li>
                      <li>• File complaints with us</li>
                      <li>• Contact the Information Regulator</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 font-semibold mb-2">📧 Exercise Your Rights</p>
                  <p className="text-gray-700 text-sm">
                    To exercise any of these rights, email us at <strong>privacy@boetball.co.za</strong>. 
                    We'll respond within 30 days as required by POPIA.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>We retain your personal information only as long as necessary for the purposes outlined in this policy:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Data:</strong> Until you delete your account or request removal</li>
                  <li><strong>Usage Analytics:</strong> Anonymized after 2 years</li>
                  <li><strong>Marketing Data:</strong> Until you unsubscribe or object</li>
                  <li><strong>Legal Records:</strong> As required by South African law (typically 5-7 years)</li>
                </ul>
              </div>
            </section>

            {/* Cookies & Tracking */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies & Tracking Technologies</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>We use cookies and similar technologies to enhance your experience:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-800 mb-2">🔐 Essential</p>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Login sessions</li>
                      <li>• Security features</li>
                      <li>• Basic functionality</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">📊 Analytics</p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Usage statistics</li>
                      <li>• Performance monitoring</li>
                      <li>• Feature popularity</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="font-semibold text-purple-800 mb-2">⚙️ Preferences</p>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• Theme settings</li>
                      <li>• Language choices</li>
                      <li>• Customizations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  Your data is primarily processed within South Africa. However, some service providers may 
                  process data internationally with appropriate safeguards:
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 font-semibold mb-2">🌍 International Safeguards</p>
                  <ul className="text-orange-700 text-sm space-y-1">
                    <li>• GDPR adequacy decisions where applicable</li>
                    <li>• Standard contractual clauses</li>
                    <li>• Certification schemes and codes of conduct</li>
                    <li>• Your explicit consent for specific transfers</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                10. Contact Us
              </h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>For any privacy-related questions or to exercise your rights:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-800">Boet Ball FPL - Data Protection</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">General Inquiries:</p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>Email: privacy@boetball.co.za</li>
                        <li>Website: boetball.co.za/privacy</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Data Protection Officer:</p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>Email: dpo@boetball.co.za</li>
                        <li>Response Time: Within 30 days</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-700 mb-1">Information Regulator of South Africa:</p>
                    <p className="text-gray-600 text-sm">
                      If you're not satisfied with our response, you can contact the Information Regulator at 
                      <strong> inforeg@justice.gov.za</strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-t border-purple-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                This Privacy Policy is effective as of December 2024 and was last updated on this date. 
                We'll notify you of any significant changes.
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-700">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Your privacy, our priority - always! 🇿🇦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Sign Up Button */}
        <div className="text-center mt-8">
          <Link 
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 px-6 rounded-lg font-semibold focus:ring-4 focus:ring-purple-200 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Ready to Join Safely? Back to Sign Up
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
