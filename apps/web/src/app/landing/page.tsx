'use client';

import { useState } from 'react';
import { Code2, Users, Sparkles, Zap, Github, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to waitlist API
    console.log('Waitlist signup:', email);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
            <Sparkles size={16} />
            <span>AI-Powered Developer Collaboration</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Code Together,
            <br />
            Ship Faster
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The only platform that combines real-time collaboration, AI pair programming, and smart project matching in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition"
            >
              <Github size={20} />
              Sign in with GitHub
              <ArrowRight size={20} />
            </Link>

            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold text-lg transition"
            >
              Learn More
            </Link>
          </div>

          {/* Waitlist Form */}
          <form onSubmit={handleWaitlist} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                required
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
              >
                {submitted ? '✓ Joined!' : 'Join Waitlist'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">Join 2,000+ developers already on the waitlist</p>
          </form>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Everything you need to build together</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Code Jams</h3>
              <p className="text-gray-400">
                Collaborate in Monaco editor with instant sync. Multiple cursors, shared state, zero lag.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Pair Programmer</h3>
              <p className="text-gray-400">
                Explain code, generate tests, suggest fixes, and optimize—all with a single click during your jam.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-green-500/50 transition">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Project Matching</h3>
              <p className="text-gray-400">
                Vector-powered search finds projects and collaborators that match your skills and interests.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-orange-500/50 transition">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Github className="text-orange-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">GitHub Action Integration</h3>
              <p className="text-gray-400">
                Auto-post repo updates to your feed. Every push becomes a shareable moment.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-pink-500/50 transition">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Creator Marketplace</h3>
              <p className="text-gray-400">
                Sell templates, components, and 1:1 mentorship sessions. Turn expertise into income.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Jam Recordings</h3>
              <p className="text-gray-400">
                Record sessions, generate highlights, and share as tutorials. Build your dev brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by developers worldwide</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">2,000+</div>
              <div className="text-gray-400">Developers on waitlist</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
              <div className="text-gray-400">Code Jams created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">5,000+</div>
              <div className="text-gray-400">Projects shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to ship faster?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers building together with AI assistance
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold text-lg transition"
          >
            <Github size={20} />
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-800">
        <div className="text-center text-gray-400">
          <p>&copy; 2025 DevSocial. Built for developers, by developers.</p>
          <div className="flex gap-6 justify-center mt-4">
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
