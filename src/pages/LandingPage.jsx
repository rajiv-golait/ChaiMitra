import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  TruckIcon,
  PlayIcon,
  CodeBracketIcon,
  FireIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
const navigate = useNavigate();

  const features = [
    {
      icon: MapPinIcon,
      title: "Hyperlocal Sourcing",
      description: "Connect with nearby kirana stores, sabzi mandis, and dairy vendors within 2km radius",
      titleHi: "स्थानीय सोर्सिंग",
      descriptionHi: "2 किमी के दायरे में किराना स्टोर, सब्जी मंडी और डेयरी विक्रेताओं से जुड़ें"
    },
    {
      icon: ClockIcon,
      title: "4-6 AM Delivery",
      description: "Get fresh ingredients delivered before your stall opens, when wholesale markets are closed",
      titleHi: "सुबह 4-6 बजे डिलीवरी",
      descriptionHi: "होलसेल मार्केट बंद होने पर भी अपनी दुकान खोलने से पहले ताजा सामान पाएं"
    },
    {
      icon: UsersIcon,
      title: "Group Buying Power",
      description: "Join with other vendors to buy in bulk and get wholesale prices",
      titleHi: "समूहिक खरीदारी",
      descriptionHi: "अन्य विक्रेताओं के साथ मिलकर थोक में खरीदें और होलसेल रेट पाएं"
    },
    {
      icon: TruckIcon,
      title: "Same-Day Delivery",
      description: "Order today, get delivered tomorrow morning before market rush",
      titleHi: "उसी दिन डिलीवरी",
      descriptionHi: "आज ऑर्डर करें, कल सुबह मार्केट की भीड़ से पहले डिलीवरी पाएं"
    }
  ];

  const problemPoints = [
    "Wholesale markets open late (8-9 AM) but vendors need ingredients by 5 AM",
    "No reliable suppliers for small quantities",
    "Price fluctuations and quality issues",
    "Long travel time to wholesale markets",
    "No credit or payment flexibility"
  ];

  const solutionPoints = [
    "Hyperlocal supplier network within 2km",
    "Group buying for better prices",
    "Quality guarantee and ratings",
    "Early morning delivery (4-6 AM)",
    "UPI payments and credit options"
  ];

  const techStack = [
    {
      name: "React",
      icon: "⚛️",
      description: "Modern UI framework"
    },
    {
      name: "Firebase",
      icon: "🔥",
      description: "Real-time database & auth"
    },
    {
      name: "Tailwind CSS",
      icon: "🎨",
      description: "Responsive design"
    },
    {
      name: "Framer Motion",
      icon: "✨",
      description: "Smooth animations"
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🏆 Tutedude Hackathon 1.0 Solution
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-orange-600">ChaiMitra</span>
            <br />
            <span className="text-2xl md:text-3xl text-gray-600">Street Food Vendor's Best Friend</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Solving the <strong>4-6 AM sourcing crisis</strong> for Indian street food vendors through 
            hyperlocal supplier network and group buying power.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate('/login')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Start as Vendor (विक्रेता)
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Join as Supplier (आपूर्तिकर्ता)
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Demo Video Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              <PlayIcon className="w-10 h-10 inline-block mr-3 text-blue-600" />
              See ChaiMitra in Action
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Watch how we solve the 4-6 AM sourcing crisis for street food vendors
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
                <div className="text-center">
                  <PlayIcon className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Demo Video</h3>
                  <p className="text-gray-600 mb-4">5-minute walkthrough of ChaiMitra features</p>
                  <button 
                    onClick={() => window.open('https://drive.google.com/drive/folders/1SlKGKNQrUhZCwewe6mwCv_VkLODGVhGq?usp=sharing', '_blank')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-red-600 mb-6">🚨 The Problem</h2>
              <div className="space-y-4">
                {problemPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-green-600 mb-6">✅ Our Solution</h2>
              <div className="space-y-4">
                {solutionPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">Built specifically for Indian street food ecosystem</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-3">{feature.description}</p>
                <div className="border-t pt-3">
                  <h4 className="font-medium text-orange-600 mb-1">{feature.titleHi}</h4>
                  <p className="text-sm text-gray-500">{feature.descriptionHi}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              <CodeBracketIcon className="w-10 h-10 inline-block mr-3 text-purple-600" />
              Built with Modern Tech
            </h2>
            <p className="text-xl text-gray-600">Scalable, reliable, and fast technology stack</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-3">{tech.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tech.name}</h3>
                <p className="text-gray-600">{tech.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              <FireIcon className="w-4 h-4 mr-2" />
              Production-ready architecture with real-time capabilities
            </div>
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of vendors already using ChaiMitra for hassle-free sourcing
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started Now - अभी शुरू करें
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">
            Built for Tutedude Hackathon 1.0 • Solving real problems for Indian street food vendors
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <DevicePhoneMobileIcon className="w-4 h-4 mr-1" />
              Mobile Responsive
            </span>
            <span>•</span>
            <span className="flex items-center">
              <FireIcon className="w-4 h-4 mr-1" />
              Real-time Features
            </span>
            <span>•</span>
            <span>Hindi Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
