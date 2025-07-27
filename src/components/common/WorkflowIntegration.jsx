import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LocationSelector from './LocationSelector';
import UPIPayment from './UPIPayment';
import OrderTracking from './OrderTracking';
import IndianSupplierCategories from '../supplier/IndianSupplierCategories';
import SupplierRatingSystem from '../supplier/SupplierRatingSystem';
import { useAuth } from '../../contexts/AuthContext';

const WorkflowIntegration = ({ 
  step = 'location', 
  userType = 'vendor',
  onStepComplete,
  orderData = null 
}) => {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(step);
  const [workflowData, setWorkflowData] = useState({
    location: null,
    category: null,
    supplier: null,
    order: null,
    payment: null
  });

  const vendorWorkflowSteps = [
    { id: 'location', title: 'Select Location', titleHi: 'लोकेशन चुनें' },
    { id: 'category', title: 'Choose Supplier Type', titleHi: 'सप्लायर टाइप चुनें' },
    { id: 'browse', title: 'Browse Products', titleHi: 'प्रोडक्ट्स देखें' },
    { id: 'group_buy', title: 'Join Group Buy', titleHi: 'ग्रुप बाय में शामिल हों' },
    { id: 'payment', title: 'Make Payment', titleHi: 'पेमेंट करें' },
    { id: 'tracking', title: 'Track Order', titleHi: 'ऑर्डर ट्रैक करें' },
    { id: 'rating', title: 'Rate Supplier', titleHi: 'सप्लायर को रेट करें' }
  ];

  const supplierWorkflowSteps = [
    { id: 'location', title: 'Set Service Area', titleHi: 'सर्विस एरिया सेट करें' },
    { id: 'category', title: 'Set Business Type', titleHi: 'बिजनेस टाइप सेट करें' },
    { id: 'products', title: 'Add Products', titleHi: 'प्रोडक्ट्स जोड़ें' },
    { id: 'orders', title: 'Manage Orders', titleHi: 'ऑर्डर्स मैनेज करें' },
    { id: 'payment', title: 'Receive Payment', titleHi: 'पेमेंट रिसीव करें' },
    { id: 'rating', title: 'View Ratings', titleHi: 'रेटिंग्स देखें' }
  ];

  const steps = userType === 'vendor' ? vendorWorkflowSteps : supplierWorkflowSteps;

  const handleStepComplete = (stepId, data) => {
    setWorkflowData(prev => ({ ...prev, [stepId]: data }));
    
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const nextStep = steps[currentIndex + 1];
    
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
    
    if (onStepComplete) {
      onStepComplete(stepId, data);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userType === 'vendor' ? 'Select Your Location' : 'Set Your Service Area'}
              </h2>
              <p className="text-gray-600">
                {userType === 'vendor' 
                  ? 'Choose your area to find nearby suppliers'
                  : 'Set the area where you provide services'
                }
              </p>
            </div>
            <LocationSelector
              onLocationSelect={(location) => handleStepComplete('location', location)}
              selectedLocation={workflowData.location}
            />
          </div>
        );

      case 'category':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userType === 'vendor' ? 'Choose Supplier Type' : 'Set Your Business Type'}
              </h2>
              <p className="text-gray-600">
                {userType === 'vendor'
                  ? 'Select the type of supplier you need'
                  : 'Choose your business category'
                }
              </p>
            </div>
            <IndianSupplierCategories
              onCategorySelect={(category) => handleStepComplete('category', category)}
              selectedCategory={workflowData.category?.id}
            />
          </div>
        );

      case 'payment':
        return (
          <UPIPayment
            amount={orderData?.amount || 850}
            onPaymentComplete={(payment) => handleStepComplete('payment', payment)}
            onClose={() => setCurrentStep('browse')}
            orderDetails={orderData?.details || 'Rice (5kg), Dal (2kg), Oil (1L)'}
          />
        );

      case 'tracking':
        return (
          <OrderTracking
            orderId={orderData?.id || 'CM123456'}
            initialStatus="placed"
          />
        );

      case 'rating':
        return (
          <SupplierRatingSystem
            supplier={workflowData.supplier || { id: 'supplier1', name: 'Local Kirana Store' }}
            onRatingSubmit={(rating) => handleStepComplete('rating', rating)}
            userRating={0}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Step: {steps.find(s => s.id === currentStep)?.title}
            </h3>
            <p className="text-gray-600 mb-6">
              This step is handled by the main dashboard components
            </p>
            <button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                const nextStep = steps[currentIndex + 1];
                if (nextStep) setCurrentStep(nextStep.id);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue to Next Step
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {userType === 'vendor' ? 'Vendor Onboarding' : 'Supplier Setup'}
          </h1>
          <span className="text-sm text-gray-500">
            Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-orange-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((steps.findIndex(s => s.id === currentStep) + 1) / steps.length) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`text-xs ${
                steps.findIndex(s => s.id === currentStep) >= index
                  ? 'text-orange-600 font-medium'
                  : 'text-gray-400'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            const currentIndex = steps.findIndex(s => s.id === currentStep);
            if (currentIndex > 0) {
              setCurrentStep(steps[currentIndex - 1].id);
            }
          }}
          disabled={steps.findIndex(s => s.id === currentStep) === 0}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        
        <button
          onClick={() => {
            const currentIndex = steps.findIndex(s => s.id === currentStep);
            const nextStep = steps[currentIndex + 1];
            if (nextStep) {
              setCurrentStep(nextStep.id);
            }
          }}
          disabled={steps.findIndex(s => s.id === currentStep) === steps.length - 1}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default WorkflowIntegration;
