import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const OrderTracking = ({ orderId, initialStatus = 'placed' }) => {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [estimatedDelivery, setEstimatedDelivery] = useState('Tomorrow 5:30 AM');

  const orderStatuses = [
    {
      id: 'placed',
      title: 'Order Placed',
      titleHi: 'ऑर्डर दिया गया',
      description: 'Your order has been received and is being processed',
      descriptionHi: 'आपका ऑर्डर मिल गया है और प्रोसेस हो रहा है',
      time: '2:30 PM',
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      titleHi: 'ऑर्डर कन्फर्म',
      description: 'Supplier has confirmed your order and started preparation',
      descriptionHi: 'सप्लायर ने आपका ऑर्डर कन्फर्म कर दिया है और तैयारी शुरू कर दी है',
      time: '3:15 PM',
      icon: CheckCircleIcon,
      color: 'blue'
    },
    {
      id: 'preparing',
      title: 'Being Prepared',
      titleHi: 'तैयार हो रहा है',
      description: 'Your items are being prepared and packed',
      descriptionHi: 'आपका सामान तैयार और पैक किया जा रहा है',
      time: '4:00 PM',
      icon: ClockIcon,
      color: 'yellow'
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      titleHi: 'डिलीवरी के लिए निकला',
      description: 'Your order is on the way to your location',
      descriptionHi: 'आपका ऑर्डर आपकी लोकेशन पर आ रहा है',
      time: '5:00 AM',
      icon: TruckIcon,
      color: 'orange'
    },
    {
      id: 'delivered',
      title: 'Delivered',
      titleHi: 'डिलीवर हो गया',
      description: 'Order delivered successfully',
      descriptionHi: 'ऑर्डर सफलतापूर्वक डिलीवर हो गया',
      time: '5:30 AM',
      icon: CheckCircleIcon,
      color: 'green'
    }
  ];

  const getCurrentStatusIndex = () => {
    return orderStatuses.findIndex(status => status.id === currentStatus);
  };

  const getStatusColor = (status, isActive, isCompleted) => {
    if (isCompleted) return 'text-green-600 bg-green-100';
    if (isActive) {
      const colors = {
        green: 'text-green-600 bg-green-100',
        blue: 'text-blue-600 bg-blue-100',
        yellow: 'text-yellow-600 bg-yellow-100',
        orange: 'text-orange-600 bg-orange-100'
      };
      return colors[status.color] || 'text-gray-600 bg-gray-100';
    }
    return 'text-gray-400 bg-gray-100';
  };

  const deliveryInfo = {
    driverName: 'राहुल शर्मा',
    driverPhone: '+91 98765 43210',
    vehicleNumber: 'MH 12 AB 3456',
    estimatedTime: 'Tomorrow 5:30 AM'
  };

  // Simulate status progression for demo
  useEffect(() => {
    const statusProgression = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusProgression.indexOf(currentStatus);
    
    if (currentIndex < statusProgression.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStatus(statusProgression[currentIndex + 1]);
      }, 5000); // Change status every 5 seconds for demo
      
      return () => clearTimeout(timer);
    }
  }, [currentStatus]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
          <p className="text-gray-600">Order ID: #{orderId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Estimated Delivery</p>
          <p className="text-lg font-semibold text-orange-600">{estimatedDelivery}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="relative">
        {orderStatuses.map((status, index) => {
          const currentIndex = getCurrentStatusIndex();
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start pb-8 last:pb-0"
            >
              {/* Timeline Line */}
              {index < orderStatuses.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200">
                  {(isCompleted || isActive) && (
                    <motion.div
                      className="w-full bg-orange-500"
                      initial={{ height: 0 }}
                      animate={{ height: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              )}

              {/* Status Icon */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                isCompleted ? 'border-green-500 bg-green-500' : 
                isActive ? 'border-orange-500 bg-orange-500' : 
                'border-gray-300 bg-white'
              }`}>
                {isCompleted ? (
                  <CheckCircleIconSolid className="w-6 h-6 text-white" />
                ) : isActive ? (
                  <status.icon className="w-6 h-6 text-white" />
                ) : (
                  <status.icon className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Status Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${
                      isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {status.title}
                    </h3>
                    <p className="text-sm text-gray-500">{status.titleHi}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    isCompleted || isActive ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {status.time}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {status.description}
                </p>
                <p className={`text-xs mt-1 ${
                  isCompleted || isActive ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {status.descriptionHi}
                </p>

                {/* Active Status Animation */}
                {isActive && (
                  <motion.div
                    className="mt-2 flex items-center space-x-2"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-600 font-medium">In Progress</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Delivery Details */}
      {currentStatus === 'out_for_delivery' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TruckIcon className="w-5 h-5 mr-2 text-orange-600" />
            Delivery Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Driver Name</p>
              <p className="font-medium text-gray-900">{deliveryInfo.driverName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle Number</p>
              <p className="font-medium text-gray-900">{deliveryInfo.vehicleNumber}</p>
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <PhoneIcon className="w-4 h-4" />
              <span>Call Driver</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Chat</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Order Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Items</span>
            <span className="text-gray-900">Rice (5kg), Dal (2kg), Oil (1L)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-medium text-gray-900">₹850</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Address</span>
            <span className="text-gray-900">Andheri East, Mumbai</span>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Need help with your order?</p>
        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;
