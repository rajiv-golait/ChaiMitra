import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  X,
  ArrowRight,
  Sparkles,
  Star,
  ShoppingCart,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const OnboardingGuidance = ({ onDismiss, onAddFirstProduct, hasProducts = false }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Package,
      title: t('supplier.onboardingStep1Title', 'Add Your First Product'),
      description: t('supplier.onboardingStep1Desc', 'Start by adding fresh products to your catalog. Include clear descriptions, competitive prices, and quality certificates to attract vendors.'),
      action: t('supplier.addFirstProduct', 'Add First Product'),
      actionType: 'primary',
      tip: t('supplier.tip1', '💡 Pro tip: Products with photos sell 3x faster!')
    },
    {
      icon: Users,
      title: t('supplier.onboardingStep2Title', 'Connect with Vendors'),
      description: t('supplier.onboardingStep2Desc', 'Once your products are live, local vendors can discover and order from your catalog. Build relationships for repeat business.'),
      completed: hasProducts,
      tip: t('supplier.tip2', '🤝 Respond quickly to build trust with vendors')
    },
    {
      icon: TrendingUp,
      title: t('supplier.onboardingStep3Title', 'Grow Your Business'),
      description: t('supplier.onboardingStep3Desc', 'Track orders, manage inventory, and expand your product range. Use insights to optimize your offerings for better sales.'),
      completed: hasProducts,
      tip: t('supplier.tip3', '📈 Check analytics weekly to spot trends')
    }
  ];

  const benefits = [
    {
      icon: ShoppingCart,
      title: t('supplier.benefit1Title', 'Direct Orders'),
      description: t('supplier.benefit1Desc', 'Receive orders directly from vendors in your area')
    },
    {
      icon: Star,
      title: t('supplier.benefit2Title', 'Quality Recognition'),
      description: t('supplier.benefit2Desc', 'Showcase your quality certifications and build trust')
    },
    {
      icon: TrendingUp,
      title: t('supplier.benefit3Title', 'Business Growth'),
      description: t('supplier.benefit3Desc', 'Expand your reach and increase sales volume')
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleActionClick = () => {
    if (steps[currentStep].actionType === 'primary') {
      onAddFirstProduct();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#FFA500] to-[#FFC107] px-6 py-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full" />
              <div className="absolute bottom-0 left-8 w-16 h-16 bg-white rounded-full" />
            </div>
            
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-4 relative">
              <motion.div 
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              >
                <Sparkles className="text-white" size={28} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-poppins font-bold text-white">
                  {t('supplier.welcomeToHawkerHub', 'Namaste! Welcome to HawkerHub 🙏')}
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  {t('supplier.onboardingSubtitle', 'Your journey to connect with thousands of local vendors starts here')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {steps.map((step, index) => (
                      <React.Fragment key={index}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative ${
                            index === currentStep ? 'scale-110' : ''
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                              index === currentStep
                                ? 'bg-[#FFA500] text-white shadow-lg'
                                : index < currentStep || step.completed
                                ? 'bg-[#28A745] text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {index < currentStep || step.completed ? (
                              <CheckCircle size={20} />
                            ) : (
                              index + 1
                            )}
                          </div>
                        </motion.div>
                        {index < steps.length - 1 && (
                          <div
                            className={`h-0.5 w-12 transition-all duration-300 ${
                              index < currentStep || steps[index + 1].completed
                                ? 'bg-[#28A745]'
                                : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentStep + 1}/{steps.length}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-4">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                        steps[currentStep].completed 
                          ? 'bg-gradient-to-br from-[#28A745] to-[#1C7C54] text-white' 
                          : 'bg-gradient-to-br from-[#FFA500] to-[#FFC107] text-white'
                      }`}
                    >
                      {React.createElement(steps[currentStep].icon, { size: 36 })}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-poppins font-bold text-[#1A1A1A] mb-3">
                        {steps[currentStep].title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {steps[currentStep].description}
                      </p>
                      
                      {steps[currentStep].tip && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-4 p-4 bg-[#FFF8E7] rounded-xl border border-[#FFA500]/20"
                        >
                          <p className="text-sm text-gray-700">
                            {steps[currentStep].tip}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {steps[currentStep].action && !steps[currentStep].completed && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-4"
                    >
                      <button
                        onClick={handleActionClick}
                        className="group inline-flex items-center gap-3 bg-gradient-to-br from-[#FFA500] to-[#FFC107] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {steps[currentStep].action}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="group flex items-center gap-2 px-6 py-3 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-[#1A1A1A] transition-all duration-200"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  {t('common.previous', 'Previous')}
                </button>
                
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentStep
                          ? 'w-8 bg-[#FFA500]'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className="group flex items-center gap-2 px-6 py-3 text-[#FFA500] disabled:text-gray-400 disabled:cursor-not-allowed hover:text-[#FF8C00] transition-all duration-200 font-medium"
                >
                  {t('common.next', 'Next')}
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Benefits Sidebar */}
            <div className="lg:w-96 bg-gradient-to-b from-[#FFF8E7] to-white p-8 border-l border-gray-200">
              <h4 className="font-poppins font-bold text-[#1A1A1A] text-lg mb-6">
                {t('supplier.whyHawkerHub', 'Why Choose HawkerHub?')}
              </h4>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FFA500]/20 to-[#FFC107]/20 rounded-xl flex items-center justify-center text-[#FFA500] flex-shrink-0">
                      {React.createElement(benefit.icon, { size: 24 })}
                    </div>
                    <div>
                      <h5 className="font-semibold text-[#1A1A1A] mb-1">
                        {benefit.title}
                      </h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-6 bg-gradient-to-br from-[#1C7C54] to-[#28A745] rounded-2xl text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Phone size={24} />
                  </div>
                  <div>
                                        <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-white/90">
                      {t('supplier.supportAvailable', 'Support Available')}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/80 mt-3">
                  {t('supplier.supportText', 'Our team is here to help you succeed')}
                </p>
              </motion.div>

              {/* Success Stories */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="text-[#FFA500]" size={20} fill="currentColor" />
                  <Star className="text-[#FFA500]" size={20} fill="currentColor" />
                  <Star className="text-[#FFA500]" size={20} fill="currentColor" />
                  <Star className="text-[#FFA500]" size={20} fill="currentColor" />
                  <Star className="text-[#FFA500]" size={20} fill="currentColor" />
                </div>
                <p className="text-sm text-gray-700 italic">
                  "{t('supplier.testimonial', 'HawkerHub helped me double my customer base in just 3 months!')}"
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  - {t('supplier.testimonialAuthor', 'Rajesh Kumar, Fresh Produce Supplier')}
                </p>
              </motion.div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white p-4 rounded-xl text-center border border-gray-200"
                >
                  <div className="text-2xl font-bold text-[#FFA500]">5000+</div>
                  <div className="text-xs text-gray-600">
                    {t('supplier.activeVendors', 'Active Vendors')}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white p-4 rounded-xl text-center border border-gray-200"
                >
                  <div className="text-2xl font-bold text-[#1C7C54]">₹2L+</div>
                  <div className="text-xs text-gray-600">
                    {t('supplier.avgMonthlyEarnings', 'Avg Monthly')}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Skip Tour Option */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {t('supplier.canRevisitTour', 'You can revisit this tour anytime from your dashboard')}
            </p>
            <button
              onClick={onDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              {t('supplier.skipTour', 'Skip tour for now')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuidance;