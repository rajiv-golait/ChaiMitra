import notificationService from '../services/notificationService';

/**
 * FCM Notification Testing Utility
 * Provides methods to test different notification scenarios
 */
class NotificationTester {
  constructor() {
    this.testResults = [];
    this.languages = ['en', 'hi', 'mr'];
  }

  // Log test results
  logResult(testName, success, message = '', data = null) {
    const result = {
      testName,
      success,
      message,
      data,
      timestamp: new Date()
    };
    this.testResults.push(result);
    
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${testName}: ${message}`);
    
    if (data) {
      console.log('Test Data:', data);
    }
    
    return result;
  }

  // Test different notification types
  testNotificationTypes() {
    console.log('\n🧪 Testing Different Notification Types...\n');
    
    const testCases = [
      {
        type: 'new_order',
        data: { vendorName: 'Test Vendor', orderId: 'ORD001' }
      },
      {
        type: 'order_status_changed',
        data: { orderId: 'ORD001', status: 'Processing' }
      },
      {
        type: 'payment_received',
        data: { amount: '1,250', orderId: 'ORD001' }
      },
      {
        type: 'order_delivered',
        data: { orderId: 'ORD001' }
      },
      {
        type: 'low_stock',
        data: { productName: 'Fresh Tomatoes', quantity: 5 }
      },
      {
        type: 'group_invite',
        data: { groupName: 'Mumbai Vendors Group' }
      },
      {
        type: 'product_approved',
        data: { productName: 'Organic Onions' }
      }
    ];

    testCases.forEach((testCase, index) => {
      setTimeout(() => {
        try {
          const notification = notificationService.createOrderNotification(
            testCase.type, 
            testCase.data
          );
          
          this.logResult(
            `Notification Type: ${testCase.type}`,
            true,
            `Successfully created ${testCase.type} notification`,
            notification
          );
        } catch (error) {
          this.logResult(
            `Notification Type: ${testCase.type}`,
            false,
            `Failed to create notification: ${error.message}`,
            { error: error.message }
          );
        }
      }, index * 1000); // Stagger notifications by 1 second
    });
  }

  // Test multilingual notifications
  testMultilingualNotifications() {
    console.log('\n🌐 Testing Multilingual Notifications...\n');
    
    this.languages.forEach((language, index) => {
      setTimeout(() => {
        try {
          // Set language
          notificationService.setLanguage(language);
          
          // Create test notification
          const notification = notificationService.createOrderNotification('new_order', {
            vendorName: `Test Vendor (${language})`,
            orderId: `ORD-${language.toUpperCase()}-001`
          });
          
          this.logResult(
            `Multilingual Test: ${language}`,
            true,
            `Successfully created notification in ${language}`,
            {
              language,
              title: notification.title,
              body: notification.body
            }
          );
        } catch (error) {
          this.logResult(
            `Multilingual Test: ${language}`,
            false,
            `Failed to create notification in ${language}: ${error.message}`,
            { language, error: error.message }
          );
        }
      }, index * 2000); // Stagger by 2 seconds for different languages
    });
  }

  // Test notification actions (Mark as Read, Dismiss)
  testNotificationActions() {
    console.log('\n⚡ Testing Notification Actions...\n');
    
    // Create a test notification
    const testNotification = notificationService.createOrderNotification('new_order', {
      vendorName: 'Action Test Vendor',
      orderId: 'ACT001'
    });

    setTimeout(() => {
      try {
        // Test mark as read
        notificationService.markAsRead(testNotification.id);
        const notifications = notificationService.getNotifications();
        const updatedNotification = notifications.find(n => n.id === testNotification.id);
        
        this.logResult(
          'Mark as Read Action',
          updatedNotification?.read === true,
          updatedNotification?.read ? 'Successfully marked notification as read' : 'Failed to mark as read',
          { notificationId: testNotification.id, read: updatedNotification?.read }
        );
      } catch (error) {
        this.logResult(
          'Mark as Read Action',
          false,
          `Failed to mark as read: ${error.message}`,
          { error: error.message }
        );
      }
    }, 1000);

    setTimeout(() => {
      try {
        // Test dismiss/remove
        const beforeCount = notificationService.getNotifications().length;
        notificationService.removeNotification(testNotification.id);
        const afterCount = notificationService.getNotifications().length;
        
        this.logResult(
          'Dismiss Action',
          afterCount === beforeCount - 1,
          `Successfully removed notification (${beforeCount} → ${afterCount})`,
          { beforeCount, afterCount, removedId: testNotification.id }
        );
      } catch (error) {
        this.logResult(
          'Dismiss Action',
          false,
          `Failed to remove notification: ${error.message}`,
          { error: error.message }
        );
      }
    }, 2000);
  }

  // Test notification badge updates
  testNotificationBadge() {
    console.log('\n🔔 Testing Notification Badge Updates...\n');
    
    // Clear all notifications first
    notificationService.clearAll();
    
    setTimeout(() => {
      const initialCount = notificationService.getUnreadCount();
      
      // Add multiple notifications
      notificationService.createOrderNotification('new_order', { vendorName: 'Badge Test 1' });
      notificationService.createOrderNotification('low_stock', { productName: 'Badge Test Product' });
      notificationService.createOrderNotification('payment_received', { amount: '500', orderId: 'BADGE001' });
      
      const afterAddingCount = notificationService.getUnreadCount();
      
      this.logResult(
        'Badge Count Update',
        afterAddingCount === 3,
        `Badge count updated correctly: ${initialCount} → ${afterAddingCount}`,
        { initialCount, afterAddingCount, expected: 3 }
      );
      
      // Test mark all as read
      setTimeout(() => {
        notificationService.markAllAsRead();
        const afterMarkAllCount = notificationService.getUnreadCount();
        
        this.logResult(
          'Mark All as Read Badge Update',
          afterMarkAllCount === 0,
          `Badge cleared after marking all as read: ${afterAddingCount} → ${afterMarkAllCount}`,
          { beforeMarkAll: afterAddingCount, afterMarkAll: afterMarkAllCount }
        );
      }, 1000);
    }, 500);
  }

  // Test Firebase permission flow
  async testPermissionFlow() {
    console.log('\n🔐 Testing Permission Flow...\n');
    
    try {
      // Check current permission status
      const currentPermission = Notification.permission;
      
      this.logResult(
        'Current Permission Status',
        true,
        `Current notification permission: ${currentPermission}`,
        { permission: currentPermission }
      );
      
      // Test if notifications are supported
      const isSupported = 'Notification' in window;
      
      this.logResult(
        'Notification Support Check',
        isSupported,
        isSupported ? 'Notifications are supported' : 'Notifications not supported',
        { supported: isSupported }
      );
      
      // Test service worker registration
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          
          this.logResult(
            'Service Worker Status',
            !!registration,
            registration ? 'Service worker is registered' : 'Service worker not found',
            { 
              registered: !!registration, 
              scope: registration?.scope,
              active: !!registration?.active 
            }
          );
        } catch (error) {
          this.logResult(
            'Service Worker Status',
            false,
            `Service worker check failed: ${error.message}`,
            { error: error.message }
          );
        }
      }
      
    } catch (error) {
      this.logResult(
        'Permission Flow Test',
        false,
        `Permission flow test failed: ${error.message}`,
        { error: error.message }
      );
    }
  }

  // Simulate background notification
  simulateBackgroundNotification() {
    console.log('\n📱 Simulating Background Notification...\n');
    
    // Create a simulated Firebase payload
    const simulatedPayload = {
      notification: {
        title: 'Background Test Notification',
        body: 'This simulates a background notification from Firebase',
        icon: '/logo192.png'
      },
      data: {
        type: 'new_order',
        vendorName: 'Background Test Vendor',
        orderId: 'BG001',
        url: '/vendor/orders/BG001'
      }
    };
    
    try {
      // Simulate the Firebase notification callback
      notificationService.handleFirebaseNotification({
        id: Date.now().toString(),
        title: simulatedPayload.notification.title,
        body: simulatedPayload.notification.body,
        icon: simulatedPayload.notification.icon,
        type: simulatedPayload.data.type,
        data: simulatedPayload.data,
        timestamp: new Date(),
        read: false
      });
      
      this.logResult(
        'Background Notification Simulation',
        true,
        'Successfully simulated background notification',
        simulatedPayload
      );
      
      // Test if it appears in notifications list
      setTimeout(() => {
        const notifications = notificationService.getNotifications();
        const bgNotification = notifications.find(n => n.data?.orderId === 'BG001');
        
        this.logResult(
          'Background Notification Storage',
          !!bgNotification,
          bgNotification ? 'Background notification stored successfully' : 'Background notification not found in storage',
          { found: !!bgNotification, notification: bgNotification }
        );
      }, 500);
      
    } catch (error) {
      this.logResult(
        'Background Notification Simulation',
        false,
        `Background notification simulation failed: ${error.message}`,
        { error: error.message }
      );
    }
  }

  // Run comprehensive test suite
  async runComprehensiveTests() {
    console.log('\n🚀 Starting Comprehensive FCM Notification Testing...\n');
    console.log('=' .repeat(60));
    
    // Test 1: Permission Flow
    await this.testPermissionFlow();
    
    // Test 2: Different notification types
    setTimeout(() => this.testNotificationTypes(), 2000);
    
    // Test 3: Multilingual support
    setTimeout(() => this.testMultilingualNotifications(), 10000);
    
    // Test 4: Notification actions
    setTimeout(() => this.testNotificationActions(), 18000);
    
    // Test 5: Badge updates
    setTimeout(() => this.testNotificationBadge(), 22000);
    
    // Test 6: Background notifications
    setTimeout(() => this.simulateBackgroundNotification(), 26000);
    
    // Generate report after all tests
    setTimeout(() => this.generateTestReport(), 30000);
  }

  // Generate comprehensive test report
  generateTestReport() {
    console.log('\n📊 Generating Test Report...\n');
    console.log('=' .repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    
    console.log('🎯 FCM Notification System Test Report');
    console.log('-' .repeat(40));
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log('-' .repeat(40));
    
    // Group results by test category
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.testName.split(':')[0] || 'General';
      if (!categories[category]) {
        categories[category] = { passed: 0, failed: 0, tests: [] };
      }
      
      if (result.success) {
        categories[category].passed++;
      } else {
        categories[category].failed++;
      }
      
      categories[category].tests.push(result);
    });
    
    // Display category results
    Object.entries(categories).forEach(([category, data]) => {
      console.log(`\n📁 ${category}`);
      console.log(`   ✅ ${data.passed} passed, ❌ ${data.failed} failed`);
      
      // Show failed tests
      if (data.failed > 0) {
        data.tests.filter(t => !t.success).forEach(test => {
          console.log(`   🔸 ${test.testName}: ${test.message}`);
        });
      }
    });
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (failedTests === 0) {
      console.log('   🎉 All tests passed! Your notification system is working correctly.');
    } else {
      console.log('   🔧 Review failed tests and fix issues before production deployment.');
      if (failedTests > totalTests * 0.3) {
        console.log('   ⚠️  High failure rate detected. Consider reviewing implementation.');
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    
    // Store results for external access
    window.fcmTestResults = {
      summary: { totalTests, passedTests, failedTests, successRate },
      categories,
      details: this.testResults,
      timestamp: new Date()
    };
    
    return {
      summary: { totalTests, passedTests, failedTests, successRate },
      categories,
      details: this.testResults
    };
  }

  // Clear test results
  clearResults() {
    this.testResults = [];
    console.log('🧹 Test results cleared');
  }

  // Get test results
  getResults() {
    return this.testResults;
  }
}

// Create singleton instance
const notificationTester = new NotificationTester();

// Make it globally available for manual testing
window.notificationTester = notificationTester;

export default notificationTester;
