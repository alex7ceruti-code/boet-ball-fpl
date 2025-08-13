import Link from 'next/link';
import { ArrowLeft, Shield, Scale, Users, Globe } from 'lucide-react';
import { getSASlang } from '@/utils/slang';

export const metadata = {
  title: 'Terms of Service - Boet Ball FPL',
  description: 'Terms and conditions for using Boet Ball Fantasy Premier League companion app',
};

export default function TermsOfService() {
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
              <div className="p-3 rounded-full bg-gradient-to-r from-green-600 to-yellow-500 shadow-lg">
                <Scale className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">
              Effective Date: December 2024 | {getSASlang('greetings', 'welcome')} to the legal stuff! 🇿🇦
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Welcome to Boet Ball FPL
              </h2>
              <div className="prose prose-gray max-w-none space-y-4">
                <p>
                  {getSASlang('greetings', 'howzit')}! These Terms of Service ("Terms") govern your use of the Boet Ball FPL 
                  companion application ("Service") operated by Boet Ball FPL ("us", "we", or "our").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part 
                  of these terms, then you may not access the Service.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Service Description</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  Boet Ball FPL is a South African-themed Fantasy Premier League companion application that provides:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Live FPL data analysis and insights</li>
                  <li>Team optimization suggestions</li>
                  <li>Fixture difficulty ratings and planning tools</li>
                  <li>Mini league tracking and comparison</li>
                  <li>FPL news and community content</li>
                  <li>Cultural South African features and localized experience</li>
                </ul>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Account Registration & Security</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, 
                  and current at all times. You are responsible for safeguarding your password and for all 
                  activities under your account.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold mb-2">🔐 Account Security</p>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Keep your password secure and don't share it with others</li>
                    <li>• Notify us immediately of any unauthorized account use</li>
                    <li>• You're responsible for all activities under your account</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Data Usage & FPL API</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  Our Service integrates with the official Fantasy Premier League API to provide live data and insights. 
                  By using our Service, you acknowledge that:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We access publicly available FPL data through official APIs</li>
                  <li>We do not store sensitive personal FPL account information</li>
                  <li>Data accuracy depends on the official FPL API availability</li>
                  <li>We are not affiliated with the Premier League or Fantasy Premier League</li>
                </ul>
              </div>
            </section>

            {/* Subscription Terms */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Subscription & Payment Terms</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  We offer both free and premium subscription tiers:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-800 mb-2">🆓 Free Tier</p>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Basic FPL dashboard</li>
                      <li>• Fixture planning tools</li>
                      <li>• Community features</li>
                      <li>• Limited data history</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800 mb-2">👑 Premium Tier</p>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Advanced analytics</li>
                      <li>• Extended data history</li>
                      <li>• Priority support</li>
                      <li>• Exclusive content</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 font-semibold">💰 Payment & Refunds (Premium Features - Coming Soon)</p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Subscriptions renew automatically unless cancelled</li>
                    <li>• Refunds available within 14 days of purchase</li>
                    <li>• Prices listed in South African Rand (ZAR)</li>
                    <li>• All prices include applicable VAT</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Prohibited Uses</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>You may not use our Service:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To attempt to gain unauthorized access to our systems or other users' accounts</li>
                </ul>
              </div>
            </section>

            {/* South African Law */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Governing Law & Jurisdiction</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the Republic of South Africa, 
                  without regard to its conflict of law provisions.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">🇿🇦 South African Legal Compliance</p>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• We comply with the Protection of Personal Information Act (POPIA)</li>
                    <li>• Consumer Protection Act rights apply to SA users</li>
                    <li>• Electronic Communications and Transactions Act compliance</li>
                    <li>• Disputes subject to South African jurisdiction</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy & Data Protection */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy & Data Protection</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our 
                  Privacy Policy, which forms part of these Terms.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-purple-800 font-semibold mb-2">🔒 Data Protection Promise</p>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• We never sell your personal data</li>
                    <li>• All data is securely encrypted</li>
                    <li>• You can request data deletion at any time</li>
                    <li>• Marketing emails only with your consent</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimer</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, 
                  we exclude all representations, warranties, and conditions relating to our Service and the use of this Service.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 font-semibold mb-2">⚠️ Fantasy Football Disclaimer</p>
                  <p className="text-orange-700 text-sm">
                    FPL predictions and suggestions are for entertainment purposes only. Past performance does not guarantee 
                    future results. Always make your own informed decisions regarding team selection and transfers.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Information</h3>
              <div className="prose prose-gray max-w-none space-y-3">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-800">Boet Ball FPL Support</span>
                  </div>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>Email: support@boetball.co.za</li>
                    <li>Website: boetball.co.za</li>
                    <li>Address: Cape Town, South Africa</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 px-8 py-6 border-t border-green-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                By clicking "I Accept" during registration, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">Welcome to the Boet Ball family!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Sign Up Button */}
        <div className="text-center mt-8">
          <Link 
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white py-3 px-6 rounded-lg font-semibold focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Ready to Join? Back to Sign Up
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
