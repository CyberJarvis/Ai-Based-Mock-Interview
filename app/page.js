import React from 'react';
import { Metadata } from 'next';
import Contect from './_components/Contect';
import AnimatedHeader from '@/components/AnimatedHeader';
import InteractiveHero from '@/components/InteractiveHero';
import InteractiveFeatures from '@/components/InteractiveFeatures';

export const metadata = {
  title: 'AI Mock Interview - Ace Your Next Interview',
  description: 'Practice with AI-powered mock interviews, get instant feedback, and build confidence for your dream job.',
  keywords: 'AI interview, mock interview, job preparation, interview practice, career development',
};

const page = () => {
  return (
    <div className="relative">
      {/* Animated Header */}
      <AnimatedHeader />

      <main className="min-h-screen">
        {/* Interactive Hero Section */}
        <InteractiveHero />

        {/* Interactive Features Section */}
        <InteractiveFeatures />

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with your AI interview practice in just three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create Your Profile",
                  description: "Tell us about your target role, experience level, and upload your resume for personalized questions."
                },
                {
                  step: "02", 
                  title: "Practice with AI",
                  description: "Engage in realistic interview conversations with our advanced AI that adapts to your responses."
                },
                {
                  step: "03",
                  title: "Get Feedback & Improve",
                  description: "Receive detailed feedback on your performance and track your progress over time."
                }
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    {index < 2 && (
                      <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -translate-x-10" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-gray-50">
          <Contect />
        </section>
      </main>

      <footer className="py-8 bg-gradient-to-r from-gray-900 to-black text-white text-center">
        <div className="container mx-auto px-6">
          <p>© 2025 AI Mock Interview. All rights reserved. Built with ❤️ for job seekers worldwide.</p>
        </div>
      </footer>
    </div>
  )
}

export default page