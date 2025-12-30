import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, BarChart3, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="bg-cyan-300 dark:bg-cyan-400 border-4 border-black dark:border-white px-6 py-2 rotate-[-1deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <span className="font-bold text-lg text-black dark:text-black">🚀 Track Your Backlinks</span>
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-7xl md:text-8xl font-black mb-6 leading-none text-black dark:text-white">
            Monitor Your
            <span className="block bg-pink-400 dark:bg-pink-500 border-4 border-black dark:border-white px-4 py-2 inline-block mt-4 rotate-[1deg] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white">
              Backlinks
            </span>
            <span className="block mt-4">Indexing Status</span>
          </h1>

          <p className="text-2xl mb-12 max-w-2xl leading-relaxed text-gray-800 dark:text-gray-200">
            Stop wondering if your backlinks are indexed. Get real-time monitoring, 
            instant alerts, and actionable insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6">
            <Link href="/projects">
              <Button
                size="lg"
                className="bg-green-400 hover:bg-green-500 text-black border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-xl px-8 py-6 font-black"
              >
                Start Tracking Free
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-xl px-8 py-6 font-black text-black dark:text-white"
              >
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl">
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              <div className="text-4xl font-black mb-2 text-black dark:text-white">10K+</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">URLs Tracked</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              <div className="text-4xl font-black mb-2 text-black dark:text-white">500+</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Active Users</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
              <div className="text-4xl font-black mb-2 text-black dark:text-white">99.9%</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-900 border-t-4 border-b-4 border-black dark:border-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black mb-16 text-center text-black dark:text-white">
              Why Choose Us?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="bg-purple-300 dark:bg-purple-600 border-4 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 flex items-center justify-center mb-6 border-4 border-black dark:border-white">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Lightning Fast</h3>
                <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                  Check thousands of backlinks in minutes. Our powerful engine processes 
                  your URLs at blazing speeds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-cyan-300 dark:bg-cyan-600 border-4 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 flex items-center justify-center mb-6 border-4 border-black dark:border-white">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Detailed Analytics</h3>
                <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                  Get comprehensive reports on your backlink portfolio. Track trends, 
                  identify issues, and optimize your SEO strategy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-pink-300 dark:bg-pink-600 border-4 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 flex items-center justify-center mb-6 border-4 border-black dark:border-white">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Real-Time Updates</h3>
                <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                  Never miss a change. Get instant notifications when your backlinks 
                  are indexed or de-indexed.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-yellow-300 dark:bg-yellow-600 border-4 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 flex items-center justify-center mb-6 border-4 border-black dark:border-white">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Secure & Private</h3>
                <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                  Your data is encrypted and stored securely. We never share your 
                  information with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-yellow-50 dark:bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black mb-16 text-center text-black dark:text-white">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <div className="bg-green-400 dark:bg-green-500 border-4 border-black dark:border-white w-16 h-16 flex items-center justify-center mb-6 font-black text-3xl text-black dark:text-white">
                    1
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Import URLs</h3>
                  <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                    Upload your backlink list via CSV or paste them manually. 
                    We support bulk imports.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <div className="bg-cyan-400 dark:bg-cyan-500 border-4 border-black dark:border-white w-16 h-16 flex items-center justify-center mb-6 font-black text-3xl text-black dark:text-white">
                    2
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Monitor Status</h3>
                  <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                    Our system checks each URL's indexing status across major 
                    search engines automatically.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <div className="bg-pink-400 dark:bg-pink-500 border-4 border-black dark:border-white w-16 h-16 flex items-center justify-center mb-6 font-black text-3xl text-black dark:text-white">
                    3
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-black dark:text-white">Get Insights</h3>
                  <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                    View detailed reports, track changes over time, and optimize 
                    your backlink strategy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black dark:bg-white text-white dark:text-black py-20 border-t-4 border-black dark:border-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-2xl mb-12 opacity-90">
              Join hundreds of SEO professionals already using our platform.
            </p>
            <Link href="/projects">
              <Button
                size="lg"
                className="bg-green-400 hover:bg-green-500 text-black border-4 border-white dark:border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-2xl px-12 py-8 font-black"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t-4 border-black dark:border-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-lg font-bold text-black dark:text-white">
              © 2025 Backlink Indexer. Built for SEO professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
