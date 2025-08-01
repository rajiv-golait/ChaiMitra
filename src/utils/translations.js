const translations = {
  en: {
    common: {
      add: 'Add',
      update: 'Update',
      cancel: 'Cancel',
      remove: 'Remove',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      welcome: 'Welcome',
      getStarted: 'Get Started',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
      step: 'Step',
      of: 'of',
      loadingMore: 'Loading more...',
      retry: 'Retry',
      dismiss: 'Dismiss'
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update'
    },
    product: {
      name: 'Product Name',
      namePlaceholder: 'Enter product name',
      category: 'Category',
      selectCategory: 'Select a category',
      unit: 'Unit',
      price: 'Price',
      availableQuantity: 'Available Quantity',
      qualityCertificate: 'Quality Certificate',
      qualityCertPlaceholder: 'e.g., FSSAI, Organic',
      description: 'Description',
      descriptionPlaceholder: 'Brief description of the product',
      addNew: 'Add New Product',
      edit: 'Edit Product',
      addFirst: 'Add your first product',
      deleteConfirmTitle: 'Delete Product',
      deleteConfirmMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock',
      inStock: 'In Stock',
      inactive: 'Inactive',
      certified: 'Certified',
      totalValue: 'Total Value'
    },
    categories: {
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      grains: 'Grains & Pulses',
      dairy: 'Dairy Products',
      spices: 'Spices & Condiments',
      oils: 'Oils & Fats',
      beverages: 'Beverages',
      other: 'Other'
    },
    units: {
      kg: 'Kilogram (kg)',
      g: 'Gram (g)',
      l: 'Liter (l)',
      ml: 'Milliliter (ml)',
      piece: 'Piece',
      dozen: 'Dozen',
      packet: 'Packet'
    },
    supplier: {
      dashboard: 'Supplier Dashboard',
      welcome: 'Welcome to ChaiMitra',
      welcomeMessage: 'Welcome back, {name}!',
      firstTimeWelcome: 'Welcome to ChaiMitra, {name}!',
      onboardingTip: 'Get started by adding your first product to start receiving orders from vendors!',
      onboardingGuidance: 'Your journey begins here! Add fresh products to your catalog and connect with local vendors.',
      quickHelp: 'Quick Help',
      learnMore: 'Learn More',
      navigation: 'Navigation',
      myProducts: 'My Products',
      products: 'My Products',
      productManagement: 'Product Management',
      productManagementDesc: 'Add, edit, and manage the products you supply to vendors.',
      orders: 'Order History',
      orderManagement: 'Order Management', 
      orderManagementDesc: 'View and manage incoming group orders for your products.',
      noProducts: 'Ready to showcase your products?',
      noProductsDesc: 'Start building your product catalog! Add your first item and let vendors discover what you offer.',
      noProductsEmptyMessage: 'Your product showcase awaits! Add items to start connecting with vendors.',
      addProduct: 'Add New Product',
      addFirstProduct: 'Add First Product',
      editProduct: 'Edit Product',
      deleteProduct: 'Delete Product',
      deleteProductTitle: 'Delete Product',
      deleteProductMessage: 'Are you sure you want to permanently delete "{name}"? This action cannot be undone.',
      noOrders: 'No orders received yet',
      noOrdersFiltered: 'No orders found for selected filter',
      orderSummary: 'You have {count} active orders!',
      viewOrders: 'View Orders',
      ordersPreview: 'Recent Orders',
      profile: 'Profile',
      help: 'Help',
      account: 'Account',
      overview: 'Dashboard Overview',
      settings: 'Settings',
      wallet: 'Wallet Management',
      notifications: 'Notifications',
      reviews: 'Reviews',
      brandName: 'ChaiMitra',
      allProductsLoaded: 'All products loaded',
      dashboardReadyTitle: '✅ Supplier Dashboard Ready',
      dashboardReadyDesc: 'Your supplier account is set up and ready to go! You can manage products, view orders, and track your business performance.',
      orderFulfillmentTitle: 'Order Fulfillment',
      orderFulfillmentDesc: 'Track and manage incoming orders from street vendors',
      supplyChainTitle: 'Supply Chain',
      supplyChainDesc: 'Manage inventory and delivery logistics',
      
      
      // Onboarding translations
      welcomeToChaiMitra: 'Welcome to ChaiMitra!',
      onboardingSubtitle: 'Let\'s get you started on your journey to connect with local vendors',
      whyChaiMitra: 'Why ChaiMitra?',
      supportAvailable: 'Support Available',
      onboardingStep1Title: 'Add Your First Product',
      onboardingStep1Desc: 'Start by adding fresh products to your catalog. Include clear descriptions, competitive prices, and quality certificates to attract vendors.',
      onboardingStep2Title: 'Connect with Vendors',
      onboardingStep2Desc: 'Once your products are live, local vendors can discover and order from your catalog. Build relationships for repeat business.',
      onboardingStep3Title: 'Grow Your Business',
      onboardingStep3Desc: 'Track orders, manage inventory, and expand your product range. Use insights to optimize your offerings for better sales.',
      benefit1Title: 'Direct Orders',
      benefit1Desc: 'Receive orders directly from vendors in your area',
      benefit2Title: 'Quality Recognition',
      benefit2Desc: 'Showcase your quality certifications and build trust',
      benefit3Title: 'Business Growth',
      benefit3Desc: 'Expand your reach and increase sales volume'
    },
    vendor: {
      browseCatalog: 'Browse Catalog',
      noProductsFound: 'No products found',
      by: 'by',
      available: 'Available',
      outOfStock: 'Out of Stock'
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      addToCart: 'Add to Cart',
      inCart: 'in cart',
      itemAdded: 'Item added to cart',
      maxQuantityReached: 'Maximum available quantity reached',
      exceedsAvailable: 'Cannot exceed available quantity of {max}',
      subtotal: 'Subtotal',
      estimatedDelivery: 'Estimated Delivery',
      total: 'Total',
      placeOrder: 'Place Order',
      clearCart: 'Clear Cart'
    },
    orders: {
      orderId: 'Order ID',
      orderNumber: 'Order Number',
      vendor: 'Vendor',
      contact: 'Contact',
      phone: 'Phone',
      from: 'From',
      items: 'Items',
      total: 'Total',
      allOrders: 'All Orders',
      history: 'Order History',
      noOrders: 'No orders received yet',
      noOrdersDescription: 'Orders from vendors will appear here once they start purchasing your products.',
      updateStatus: 'Update Status',
      status: {
        pending: 'Pending',
        processing: 'Processing',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      }
    },
    search: {
      placeholder: 'Search products...',
      resultsCount: '{count} products found',
      noResults: 'No products found matching your search',
      searchResultsFor: 'Search results for "{query}"'
    },
    filters: {
      title: 'Filters',
      clear: 'Clear All',
      search: 'Search',
      searchPlaceholder: 'Search products...',
      category: 'Category',
      allCategories: 'All Categories',
      supplier: 'Supplier',
      allSuppliers: 'All Suppliers',
      minPrice: 'Min Price',
      maxPrice: 'Max Price'
    },
    network: {
      offline: 'You are offline',
      online: 'You are online',
      backOnline: 'Connection restored! Data will sync automatically.',
      connectionLost: 'Connection lost. Working offline.',
      syncing: 'Syncing data...',
      syncComplete: 'Data synced successfully',
      syncFailed: 'Sync failed. Will retry when connection improves.',
      offlineMode: 'Offline Mode',
      dataUnavailable: 'Some data may not be available offline',
      pendingChanges: 'You have {count} pending changes that will sync when online'
    },
    notifications: {
      title: 'Notifications',
      newOrder: 'New Order Received',
      orderUpdate: 'Order Status Updated',
      groupInvite: 'Group Order Invitation',
      stockAlert: 'Low Stock Alert',
      paymentConfirmed: 'Payment Confirmed',
      deliveryUpdate: 'Delivery Update',
      productApproved: 'Product Approved',
      systemUpdate: 'System Update',
      welcome: 'Welcome to ChaiMitra!',
      permissionRequest: 'Enable notifications to stay updated',
      permissionGranted: 'Notifications enabled successfully',
      permissionDenied: 'Notifications disabled',
      enableNotifications: 'Enable Notifications',
      disableNotifications: 'Disable Notifications',
      notificationSettings: 'Notification Settings',
      orderNotifications: 'Order Notifications',
      promotionalNotifications: 'Promotional Notifications',
      systemNotifications: 'System Notifications',
      view: 'View',
      dismiss: 'Dismiss',
      markAsRead: 'Mark as Read',
      markAllAsRead: 'Mark All as Read',
      noNotifications: 'No notifications yet',
      notificationHistory: 'Notification History',
      messages: {
        newOrderReceived: 'You have received a new order from {vendor}',
        orderStatusChanged: 'Order #{orderId} status changed to {status}',
        groupOrderInvite: 'You have been invited to join a group order',
        lowStockWarning: 'Low stock alert for {product} - only {quantity} left',
        paymentReceived: 'Payment of ₹{amount} received for order #{orderId}',
        orderDelivered: 'Order #{orderId} has been delivered successfully',
        productListed: 'Your product "{product}" has been approved and listed',
        systemMaintenance: 'Scheduled system maintenance from {time}'
      }
    },
    errors: {
      saveFailed: 'Failed to save. Please try again.',
      deleteFailed: 'Failed to delete. Please try again.',
      fetchFailed: 'Failed to fetch data. Please try again.',
      fetchProductsFailed: 'Failed to fetch products. Please try again.',
      fetchOrdersFailed: 'Failed to fetch orders. Please try again.',
      updateStatusFailed: 'Failed to update order status. Please try again.',
      orderFailed: 'Failed to place order. Please try again.',
      networkError: 'Network error. Please check your connection.',
      insufficientStock: 'Insufficient stock available.',
      fetchReviewsFailed: 'Failed to fetch reviews. Please try again.'
    },
    reviews: {
      supplierReviewsTitle: 'Customer Reviews',
      noReviewsYet: 'No reviews yet',
      reviewsDescription: 'Reviews from vendors will appear here'
    },
    settings: {
      title: 'Settings',
      nameLabel: 'Full Name',
      phoneLabel: 'Phone Number',
      languageLabel: 'Language',
      profileUpdatedSuccess: 'Profile updated successfully!',
      profileUpdatedError: 'Failed to update profile. Please try again.',
      cancelButton: 'Cancel',
      saveButton: 'Save Changes',
      savingButton: 'Saving...',
      personalInfo: 'Personal Information',
      preferences: 'Preferences'
    }
  },
  hi: {
    common: {
      add: 'जोड़ें',
      update: 'अपडेट करें',
      cancel: 'रद्द करें',
      remove: 'हटाएं',
      save: 'सहेजें',
      delete: 'मिटाएं',
      edit: 'संपादित करें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      welcome: 'आपका स्वागत है',
      getStarted: 'शुरू करें',
      close: 'बंद करें',
      previous: 'पिछला',
      next: 'अगला',
      step: 'चरण',
      of: 'का',
      loadingMore: 'अधिक लोड हो रहा है...'
    },
    product: {
      name: 'उत्पाद का नाम',
      namePlaceholder: 'उत्पाद का नाम दर्ज करें',
      category: 'श्रेणी',
      selectCategory: 'श्रेणी चुनें',
      unit: 'इकाई',
      price: 'मूल्य',
      availableQuantity: 'उपलब्ध मात्रा',
      qualityCertificate: 'गुणवत्ता प्रमाणपत्र',
      qualityCertPlaceholder: 'जैसे, FSSAI, जैविक',
      description: 'विवरण',
      descriptionPlaceholder: 'उत्पाद का संक्षिप्त विवरण',
      addNew: 'नया उत्पाद जोड़ें',
      edit: 'उत्पाद संपादित करें',
      addFirst: 'अपना पहला उत्पाद जोड़ें',
      deleteConfirmTitle: 'उत्पाद हटाएं',
      deleteConfirmMessage: 'क्या आप वाकई "{name}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
    },
    categories: {
      vegetables: 'सब्जियां',
      fruits: 'फल',
      grains: 'अनाज और दालें',
      dairy: 'डेयरी उत्पाद',
      spices: 'मसाले',
      oils: 'तेल',
      beverages: 'पेय पदार्थ',
      other: 'अन्य'
    },
    units: {
      kg: 'किलोग्राम (kg)',
      g: 'ग्राम (g)',
      l: 'लीटर (l)',
      ml: 'मिलीलीटर (ml)',
      piece: 'पीस',
      dozen: 'दर्जन',
      packet: 'पैकेट'
    },
    supplier: {
      dashboard: 'आपूर्तिकर्ता डैशबोर्ड',
      welcome: 'चाईमित्र में आपका स्वागत है',
      welcomeMessage: 'वापस आपका स्वागत है, {name}!',
      firstTimeWelcome: 'चाईमित्र में आपका स्वागत है, {name}!',
      onboardingTip: 'विक्रेताओं से ऑर्डर प्राप्त करने के लिए अपना पहला उत्पाद जोड़कर शुरुआत करें!',
      onboardingGuidance: 'आपकी यात्रा यहाँ से शुरू होती है! अपने कैटलॉग में ताज़े उत्पाद जोड़ें और स्थानीय विक्रेताओं से जुड़ें।',
      quickHelp: 'त्वरित सहायता',
      learnMore: 'और जानें',
      navigation: 'नेविगेशन',
      myProducts: 'मेरे उत्पाद',
      products: 'मेरे उत्पाद',
      productManagement: 'उत्पाद प्रबंधन',
      productManagementDesc: 'विक्रेताओं को आपूर्ति किए जाने वाले उत्पादों को जोड़ें, संपादित करें और प्रबंधित करें।',
      orders: 'ऑर्डर इतिहास',
      orderManagement: 'ऑर्डर प्रबंधन', 
      orderManagementDesc: 'अपने उत्पादों के लिए आने वाले समूह ऑर्डर देखें और प्रबंधित करें।',
      noProducts: 'अपने उत्पादों को प्रदर्शित करने के लिए तैयार हैं?',
      noProductsDesc: 'अपना उत्पाद कैटलॉग बनाना शुरू करें! अपना पहला आइटम जोड़ें और विक्रेताओं को आपकी पेशकश खोजने दें।',
      noProductsEmptyMessage: 'आपका उत्पाद शोकेस इंतज़ार कर रहा है! विक्रेताओं से जुड़ना शुरू करने के लिए आइटम जोड़ें।',
      addProduct: 'नया उत्पाद जोड़ें',
      addFirstProduct: 'पहला उत्पाद जोड़ें',
      editProduct: 'उत्पाद संपादित करें',
      deleteProduct: 'उत्पाद हटाएं',
      deleteProductTitle: 'उत्पाद हटाएं',
      deleteProductMessage: 'क्या आप वाकई "{name}" को स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
      noOrders: 'अभी तक कोई ऑर्डर प्राप्त नहीं हुआ',
      noOrdersFiltered: 'चयनित फ़िल्टर के लिए कोई ऑर्डर नहीं मिला',
      orderSummary: 'आपके पास {count} सक्रिय ऑर्डर हैं!',
      viewOrders: 'ऑर्डर देखें',
      ordersPreview: 'हाल के ऑर्डर',
      profile: 'प्रोफ़ाइल',
      help: 'सहायता',
      account: 'खाता',
      settings: 'सेटिंग्स',
      brandName: 'चाईमित्र',
      dashboardReadyTitle: '✅ आपूर्तिकर्ता डैशबोर्ड तैयार',
      dashboardReadyDesc: 'आपका आपूर्तिकर्ता खाता स्थापित है और जाने के लिए तैयार है! आप उत्पादों का प्रबंधन कर सकते हैं, ऑर्डर देख सकते हैं, और अपने व्यापार के प्रदर्शन को ट्रैक कर सकते हैं।',
      orderFulfillmentTitle: 'ऑर्डर पूर्ति',
      orderFulfillmentDesc: 'स्ट्रीट वेंडरों से आने वाले ऑर्डर को ट्रैक और प्रबंधित करें',
      supplyChainTitle: 'आपूर्ति श्रृंखला',
      supplyChainDesc: 'इन्वेंट्री और डिलीवरी लॉजिस्टिक्स प्रबंधित करें',
      
      // Onboarding translations
      welcomeToChaiMitra: 'चाईमित्र में आपका स्वागत है!',
      onboardingSubtitle: 'आइए स्थानीय विक्रेताओं से जुड़ने की आपकी यात्रा शुरू करते हैं',
      whyChaiMitra: 'चाईमित्र क्यों?',
      supportAvailable: 'सहायता उपलब्ध',
      onboardingStep1Title: 'अपना पहला उत्पाद जोड़ें',
      onboardingStep1Desc: 'अपने कैटलॉग में ताज़े उत्पाद जोड़कर शुरुआत करें। विक्रेताओं को आकर्षित करने के लिए स्पष्ट विवरण, प्रतिस्पर्धी मूल्य और गुणवत्ता प्रमाणपत्र शामिल करें।',
      onboardingStep2Title: 'विक्रेताओं से जुड़ें',
      onboardingStep2Desc: 'एक बार आपके उत्पाद लाइव हो जाने पर, स्थानीय विक्रेता आपके कैटलॉग से खोज और ऑर्डर कर सकते हैं। दोहराए जाने वाले व्यापार के लिए रिश्ते बनाएं।',
      onboardingStep3Title: 'अपना व्यापार बढ़ाएं',
      onboardingStep3Desc: 'ऑर्डर ट्रैक करें, इन्वेंटरी प्रबंधित करें, और अपनी उत्पाद रेंज का विस्तार करें। बेहतर बिक्री के लिए अपनी पेशकशों को अनुकूलित करने के लिए अंतर्दृष्टि का उपयोग करें।',
      benefit1Title: 'प्रत्यक्ष ऑर्डर',
      benefit1Desc: 'अपने क्षेत्र के विक्रेताओं से सीधे ऑर्डर प्राप्त करें',
      benefit2Title: 'गुणवत्ता की पहचान',
      benefit2Desc: 'अपने गुणवत्ता प्रमाणपत्रों को प्रदर्शित करें और विश्वास बनाएं',
      benefit3Title: 'व्यापार वृद्धि',
      benefit3Desc: 'अपनी पहुंच बढ़ाएं और बिक्री की मात्रा बढ़ाएं'
    },
    vendor: {
      browseCatalog: 'कैटलॉग ब्राउज़ करें',
      noProductsFound: 'कोई उत्पाद नहीं मिला',
      by: 'द्वारा',
      available: 'उपलब्ध',
      outOfStock: 'स्टॉक में नहीं'
    },
    cart: {
      title: 'शॉपिंग कार्ट',
      empty: 'आपकी कार्ट खाली है',
      continueShopping: 'खरीदारी जारी रखें',
      addToCart: 'कार्ट में जोड़ें',
      inCart: 'कार्ट में',
      itemAdded: 'आइटम कार्ट में जोड़ा गया',
      maxQuantityReached: 'अधिकतम उपलब्ध मात्रा पहुंच गई',
      exceedsAvailable: '{max} की उपलब्ध मात्रा से अधिक नहीं हो सकता',
      subtotal: 'उप-योग',
      estimatedDelivery: 'अनुमानित डिलीवरी',
      total: 'कुल',
      placeOrder: 'ऑर्डर दें',
      clearCart: 'कार्ट साफ़ करें'
    },
    orders: {
      orderId: 'ऑर्डर आईडी',
      orderNumber: 'ऑर्डर क्रमांक',
      vendor: 'विक्रेता',
      contact: 'संपर्क',
      phone: 'फोन',
      from: 'से',
      items: 'आइटम',
      total: 'कुल',
      allOrders: 'सभी ऑर्डर',
      history: 'ऑर्डर इतिहास',
      noOrders: 'अभी तक कोई ऑर्डर प्राप्त नहीं हुआ',
      noOrdersDescription: 'विक्रेताओं के ऑर्डर यहाँ दिखाई देंगे जब वे आपके उत्पाद खरीदना शुरू करेंगे।',
      updateStatus: 'स्थिति अपडेट करें',
      status: {
        pending: 'लंबित',
        processing: 'प्रसंस्करण',
        delivered: 'वितरित',
        cancelled: 'रद्द'
      }
    },
    filters: {
      title: 'फ़िल्टर',
      clear: 'सभी साफ़ करें',
      search: 'खोजें',
      searchPlaceholder: 'उत्पाद खोजें...',
      category: 'श्रेणी',
      allCategories: 'सभी श्रेणियां',
      supplier: 'आपूर्तिकर्ता',
      allSuppliers: 'सभी आपूर्तिकर्ता',
      minPrice: 'न्यूनतम मूल्य',
      maxPrice: 'अधिकतम मूल्य'
    },
    network: {
      offline: 'आप ऑफलाइन हैं',
      online: 'आप ऑनलाइन हैं',
      backOnline: 'कनेक्शन बहाल! डेटा अपने आप सिंक हो जाएगा।',
      connectionLost: 'कनेक्शन टूट गया। ऑफलाइन काम कर रहे हैं।',
      syncing: 'डेटा सिंक हो रहा है...',
      syncComplete: 'डेटा सफलतापूर्वक सिंक हुआ',
      syncFailed: 'सिंक विफल। कनेक्शन बेहतर होने पर फिर से कोशिश करेंगे।',
      offlineMode: 'ऑफलाइन मोड',
      dataUnavailable: 'कुछ डेटा ऑफलाइन उपलब्ध नहीं हो सकता',
      pendingChanges: 'आपके पास {count} लंबित परिवर्तन हैं जो ऑनलाइन होने पर सिंक होंगे'
    },
    notifications: {
      title: 'सूचनाएं',
      newOrder: 'नया ऑर्डर प्राप्त हुआ',
      orderUpdate: 'ऑर्डर स्थिति अपडेट',
      groupInvite: 'समूह ऑर्डर आमंत्रण',
      stockAlert: 'कम स्टॉक अलर्ट',
      paymentConfirmed: 'भुगतान की पुष्टि',
      deliveryUpdate: 'डिलीवरी अपडेट',
      productApproved: 'उत्पाद स्वीकृत',
      systemUpdate: 'सिस्टम अपडेट',
      welcome: 'चाईमित्र में आपका स्वागत है!',
      permissionRequest: 'अपडेट रहने के लिए सूचनाएं सक्षम करें',
      permissionGranted: 'सूचनाएं सफलतापूर्वक सक्षम की गईं',
      permissionDenied: 'सूचनाएं अक्षम',
      enableNotifications: 'सूचनाएं सक्षम करें',
      disableNotifications: 'सूचनाएं अक्षम करें',
      notificationSettings: 'सूचना सेटिंग्स',
      orderNotifications: 'ऑर्डर सूचनाएं',
      promotionalNotifications: 'प्रमोशनल सूचनाएं',
      systemNotifications: 'सिस्टम सूचनाएं',
      view: 'देखें',
      dismiss: 'खारिज करें',
      markAsRead: 'पढ़ा हुआ चिह्नित करें',
      markAllAsRead: 'सबको पढ़ा हुआ चिह्नित करें',
      noNotifications: 'अभी तक कोई सूचना नहीं',
      notificationHistory: 'सूचना इतिहास',
      messages: {
        newOrderReceived: 'आपको {vendor} से नया ऑर्डर मिला है',
        orderStatusChanged: 'ऑर्डर #{orderId} की स्थिति {status} में बदल गई',
        groupOrderInvite: 'आपको समूह ऑर्डर में शामिल होने का आमंत्रण मिला है',
        lowStockWarning: '{product} के लिए कम स्टॉक अलर्ट - केवल {quantity} बचे हैं',
        paymentReceived: 'ऑर्डर #{orderId} के लिए ₹{amount} का भुगतान प्राप्त हुआ',
        orderDelivered: 'ऑर्डर #{orderId} सफलतापूर्वक डिलीवर हो गया',
        productListed: 'आपका उत्पाद "{product}" स्वीकृत और सूचीबद्ध हो गया',
        systemMaintenance: '{time} से निर्धारित सिस्टम रखरखाव'
      }
    },
    errors: {
      saveFailed: 'सहेजने में विफल। कृपया पुनः प्रयास करें।',
      deleteFailed: 'हटाने में विफल। कृपया पुनः प्रयास करें।',
      fetchFailed: 'डेटा लाने में विफल। कृपया पुनः प्रयास करें।',
      fetchProductsFailed: 'उत्पाद लाने में विफल। कृपया पुनः प्रयास करें।',
      fetchOrdersFailed: 'ऑर्डर लाने में विफल। कृपया पुनः प्रयास करें।',
      updateStatusFailed: 'ऑर्डर स्थिति अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
      orderFailed: 'ऑर्डर देने में विफल। कृपया पुनः प्रयास करें।',
      networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
      insufficientStock: 'अपर्याप्त स्टॉक उपलब्ध।'
    }
  },
  mr: {
      common: {
        add: 'जोडा',
        update: 'अद्यतनित करा',
        cancel: 'रद्द करा',
        remove: 'काढा',
        save: 'जतन करा',
        delete: 'हटवा',
        edit: 'संपादित करा',
        search: 'शोधा',
        filter: 'फिल्टर',
        loading: 'लोड करीत आहे...',
        error: 'त्रुटी',
        success: 'यशस्वी',
        welcome: 'आपले स्वागत आहे',
        getStarted: 'सुरू करा',
        close: 'बंद करा',
        previous: 'मागील',
        next: 'पुढे',
        step: 'पाऊल',
        of: 'चा',
        loadingMore: 'अधिक लोड करीत आहे...'
      },
      product: {
        name: 'उत्पादनाचे नाव',
        namePlaceholder: 'उत्पादनाचे नाव प्रविष्ट करा',
        category: 'वर्ग',
        selectCategory: 'वर्ग निवडा',
        unit: 'युनिट',
        price: 'किंमत',
        availableQuantity: 'उपलब्ध प्रमाण',
        qualityCertificate: 'गुणवत्ता प्रमाणपत्र',
        qualityCertPlaceholder: 'उदा., FSSAI, सेंद्रिय',
        description: 'वर्णन',
        descriptionPlaceholder: 'उत्पादनाचे संक्षिप्त वर्णन',
        addNew: 'नवीन उत्पादन जोडा',
        edit: 'उत्पादन संपादित करा',
        addFirst: 'आपले पहिले उत्पादन जोडा',
        deleteConfirmTitle: 'उत्पादन हटवा',
        deleteConfirmMessage: 'आपणास खात्री आहे का की आपण "{name}" हटवू इच्छिता? ही क्रिया पूर्ववत करता येणार नाही.'
      },
      categories: {
        vegetables: 'भाज्या',
        fruits: 'फळे',
        grains: 'धान्ये आणि डाळ',
        dairy: 'दुग्धजन्य उत्पादने',
        spices: 'मसाले',
        oils: 'तेल',
        beverages: 'पेय',
        other: 'इतर'
      },
      units: {
        kg: 'किलोग्राम (kg)',
        g: 'ग्रॅम (g)',
        l: 'लिटर (l)',
        ml: 'मिलीलीटर (ml)',
        piece: 'तुकडा',
        dozen: 'डझन',
        packet: 'पॅकेट'
      },
      supplier: {
        dashboard: 'पुरवठादार डॅशबोर्ड',
        welcome: 'चाईमित्र मध्ये आपले स्वागत आहे',
        welcomeMessage: 'पुन्हा स्वागत आहे, {name}!',
        firstTimeWelcome: 'चाईमित्र मध्ये स्वागत आहे, {name}!',
        onboardingTip: 'विक्रेतांकडून ऑर्डर प्राप्त करण्यासाठी पहिले उत्पादन जोडा!',
        onboardingGuidance: 'आपला प्रवास येथे सुरू होतो! ताज्या उत्पादनांची यादी जोडा आणि स्थानिक विक्रेतांशी जोडा.',
        quickHelp: 'त्वरित मदत',
        learnMore: 'अधिक जाणून घ्या',
        navigation: 'नेव्हिगेशन',
        myProducts: 'माझी उत्पादने',
        products: 'माझी उत्पादने',
        productManagement: 'उत्पादन व्यवस्थापन',
        productManagementDesc: 'तुम्ही विक्रेत्यांना पुरवत असलेल्या उत्पादनांचे व्यवस्थापन करा.',
        orders: 'ऑर्डर इतिहास',
        orderManagement: 'ऑर्डर व्यवस्थापन',
        orderManagementDesc: 'तुमच्या उत्पादनांसाठी येणारे गट ऑर्डर पहा आणि व्यवस्थापित करा.',
        noProducts: 'तुमची उत्पादने सादर करण्यास तयार?',
        noProductsDesc: 'उत्पादन यादी तयार करा! पहिले उत्पादन जोडा आणि विक्रेत्यांना शोधू द्या.',
        noProductsEmptyMessage: 'तुमची उत्पादन शोकेस प्रतीक्षेत आहे! आयटम जोडा आणि विक्रेत्यांशी जोडा सुरू करा.',
        addProduct: 'नवीन उत्पादन जोडा',
        addFirstProduct: 'पहिले उत्पादन जोडा',
        editProduct: 'उत्पादन संपादित करा',
        deleteProduct: 'उत्पादन हटवा',
        deleteProductTitle: 'उत्पादन हटवा',
        deleteProductMessage: 'आपल्याला खात्री आहे की आपण "{name}" स्थायीपणे हटवू इच्छिता? ही क्रिया पूर्ववत करता येणार नाही.',
        noOrders: 'अजून कोणतेही ऑर्डर प्राप्त झाले नाही',
        noOrdersFiltered: 'निवडलेल्या फिल्टरसाठी कोणतेही ऑर्डर आढळले नाही',
        orderSummary: 'आपल्याकडे {count} सक्रिय ऑर्डर आहेत!',
        viewOrders: 'ऑर्डर पहा',
        ordersPreview: 'अलीकडील ऑर्डर',
        profile: 'प्रोफाइल',
        help: 'मदत',
        account: 'खाते',
      settings: 'सेटिंग्ज',
      brandName: 'चाईमित्र',
      dashboardReadyTitle: '✅ पुरवठादार डॅशबोर्ड तयार',
      dashboardReadyDesc: 'तुमचे पुरवठादार खाते सेट केले आहे आणि जाण्यासाठी तयार आहे! तुम्ही उत्पादने व्यवस्थापित करू शकता, ऑर्डर पाहू शकता आणि तुमच्या व्यवसायाच्या कामगिरीचा मागोवा घेऊ शकता.',
      orderFulfillmentTitle: 'ऑर्डर पूर्तता',
      orderFulfillmentDesc: 'रस्त्यावरील विक्रेत्यांकडून येणाऱ्या ऑर्डरचा मागोवा घ्या आणि व्यवस्थापित करा',
      supplyChainTitle: 'पुरवठा साखळी',
      supplyChainDesc: 'यादी आणि वितरण लॉजिस्टिक्स व्यवस्थापित करा',
        
        // Onboarding translations
        welcomeToChaiMitra: 'चाईमित्र मध्ये स्वागत आहे!',
        onboardingSubtitle: 'स्थानिक विक्रेत्यांशी जोडण्याच्या आपल्या प्रवासाची सुरुवात करूया',
        whyChaiMitra: 'चाईमित्र का?',
        supportAvailable: 'सहाय्य उपलब्ध',
        onboardingStep1Title: 'आपले पहिले उत्पादन जोडा',
        onboardingStep1Desc: 'आपल्या कॅटलॉगमध्ये ताजी उत्पादने जोडून सुरुवात करा. विक्रेत्यांना आकर्षित करण्यासाठी स्पष्ट वर्णन, स्पर्धात्मक किंमती आणि गुणवत्ता प्रमाणपत्रे समाविष्ट करा.',
        onboardingStep2Title: 'विक्रेत्यांशी जोडा',
        onboardingStep2Desc: 'आपली उत्पादने लाइव्ह झाल्यानंतर, स्थानिक विक्रेते आपल्या कॅटलॉगमधून शोधू आणि ऑर्डर करू शकतात. पुनरावृत्ती व्यवसायासाठी संबंध निर्माण करा.',
        onboardingStep3Title: 'आपला व्यवसाय वाढवा',
        onboardingStep3Desc: 'ऑर्डर ट्रॅक करा, इन्व्हेंटरी व्यवस्थापित करा आणि आपल्या उत्पादन श्रेणीचा विस्तार करा. चांगल्या विक्रीसाठी आपल्या ऑफरिंग्स ऑप्टिमाइझ करण्यासाठी अंतर्दृष्टी वापरा.',
        benefit1Title: 'प्रत्यक्ष ऑर्डर',
        benefit1Desc: 'आपल्या परिसरातील विक्रेत्यांकडून थेट ऑर्डर मिळवा',
        benefit2Title: 'गुणवत्ता ओळख',
        benefit2Desc: 'आपली गुणवत्ता प्रमाणपत्रे दाखवा आणि विश्वास निर्माण करा',
        benefit3Title: 'व्यवसाय वाढ',
        benefit3Desc: 'आपली पोहोच वाढवा आणि विक्री प्रमाण वाढवा'
      },
      vendor: {
        browseCatalog: 'कॅटलॉग ब्राउझ करा',
        noProductsFound: 'कोणतेही उत्पादन आढळले नाही',
        by: 'द्वारे',
        available: 'उपलब्ध',
        outOfStock: 'स्टॉकमध्ये नाही'
      },
      cart: {
        title: 'खरेदी कार्ट',
        empty: 'तुमची कार्ट रिकामी आहे',
        continueShopping: 'खरेदी सुरू ठेवा',
        addToCart: 'कार्टमध्ये जोडा',
        inCart: 'कार्टमध्ये',
        itemAdded: 'आयटम कार्टमध्ये जोडले',
        maxQuantityReached: 'कमाल उपलब्ध प्रमाण पोहोचले',
        exceedsAvailable: '{max} च्या उपलब्ध प्रमाणापेक्षा जास्त होऊ शकत नाही',
        subtotal: 'उप-मोट',
        estimatedDelivery: 'अंदाजे वितरण',
        total: 'एकूण',
        placeOrder: 'ऑर्डर द्या',
        clearCart: 'कार्ट साफ करा'
      },
      orders: {
        orderId: 'ऑर्डर आयडी',
        orderNumber: 'ऑर्डर क्रमांक',
        vendor: 'विक्रेता',
        contact: 'संपर्क',
        phone: 'फोन',
        from: 'कडून',
        items: 'आयटम',
        total: 'एकूण',
        allOrders: 'सर्व ऑर्डर',
        history: 'ऑर्डर इतिहास',
        noOrders: 'अजून कोणतेही ऑर्डर प्राप्त झाले नाही',
        noOrdersDescription: 'विक्रेतांकडून ऑर्डर येथे दिसतील जेव्हा ते तुमची उत्पादने खरेदी करू लागतील.',
        updateStatus: 'स्थिती अद्यतन करा',
        status: {
          pending: 'प्रलंबित',
          processing: 'प्रक्रिया करीत आहे',
          delivered: 'पाठविले',
          cancelled: 'रद्द केले'
        }
      },
      filters: {
        title: 'फिल्टर',
        clear: 'सर्व साफ करा',
        search: 'शोधा',
        searchPlaceholder: 'उत्पादने शोधा...',
        category: 'वर्ग',
        allCategories: 'सर्व श्रेण्या',
        supplier: 'पुरवठादार',
        allSuppliers: 'सर्व पुरवठादार',
        minPrice: 'किमान किंमत',
        maxPrice: 'कमाल किंमत'
      },
      network: {
        offline: 'तुम्ही ऑफलाइन आहात',
        online: 'तुम्ही ऑनलाइन आहात',
        backOnline: 'कनेक्शन पुनर्स्थापित! डेटा आपोआप सिंक होईल.',
        connectionLost: 'कनेक्शन तुटले. ऑफलाइन काम करत आहे.',
        syncing: 'डेटा सिंक करीत आहे...',
        syncComplete: 'डेटा यशस्वीरित्या सिंक झाला',
        syncFailed: 'सिंक अयशस्वी. कनेक्शन सुधारल्यावर पुन्हा प्रयत्न करेल.',
        offlineMode: 'ऑफलाइन मोड',
        dataUnavailable: 'काही डेटा ऑफलाइन उपलब्ध नसू शकतो',
        pendingChanges: 'तुमच्याकडे {count} प्रलंबित बदल आहेत जे ऑनलाइन होताच सिंक होतील'
      },
      notifications: {
        title: 'सूचना',
        newOrder: 'नवीन ऑर्डर प्राप्त',
        orderUpdate: 'ऑर्डर स्थिती अद्यतनित',
        groupInvite: 'गट ऑर्डर आमंत्रण',
        stockAlert: 'कमी स्टॉक अलर्ट',
        paymentConfirmed: 'पेमेंट पुष्टी',
        deliveryUpdate: 'डिलीवरी अपडेट',
        productApproved: 'उत्पादन मंजूर',
        systemUpdate: 'सिस्टम अपडेट',
        welcome: 'चाईमित्र मध्ये स्वागत आहे!',
        permissionRequest: 'अद्यतनित राहण्यासाठी सूचना सक्षम करा',
        permissionGranted: 'सूचना यशस्वीरित्या सक्षम केल्या',
        permissionDenied: 'सूचना अक्षम',
        enableNotifications: 'सूचना सक्षम करा',
        disableNotifications: 'सूचना अक्षम करा',
        notificationSettings: 'सूचना सेटिंग्ज',
        orderNotifications: 'ऑर्डर सूचना',
        promotionalNotifications: 'प्रमोशनल सूचना',
        systemNotifications: 'सिस्टम सूचना',
        view: 'पहा',
        dismiss: 'काढून टाका',
        markAsRead: 'वाचले म्हणून चिन्हांकित करा',
        markAllAsRead: 'सर्व वाचले म्हणून चिन्हांकित करा',
        noNotifications: 'अजून कोणत्या सूचना नाहीत',
        notificationHistory: 'सूचना इतिहास',
        messages: {
          newOrderReceived: 'तुम्हाला {vendor} कडून नवीन ऑर्डर मिळाली आहे',
          orderStatusChanged: 'ऑर्डर #{orderId} ची स्थिती {status} मध्ये बदलली',
          groupOrderInvite: 'तुम्हाला गट ऑर्डरमध्ये सामील होण्यासाठी आमंत्रण मिळाले आहे',
          lowStockWarning: '{product} साठी कमी स्टॉक चेतावणी - फक्त {quantity} उरले',
          paymentReceived: 'ऑर्डर #{orderId} साठी ₹{amount} चे पेमेंट मिळाले',
          orderDelivered: 'ऑर्डर #{orderId} यशस्वीरित्या डिलीवर झाली',
          productListed: 'तुमचे उत्पादन "{product}" मंजूर आणि सूचीबद्ध झाले',
          systemMaintenance: '{time} पासून नियोजित सिस्टम मेंटेनन्स'
        }
      },
      errors: {
        saveFailed: 'जतन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        deleteFailed: 'हटविण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        fetchFailed: 'डेटा मिळविण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        fetchProductsFailed: 'उत्पादाने मिळविण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        fetchOrdersFailed: 'ऑर्डर मिळविण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        updateStatusFailed: 'ऑर्डर स्थिती अद्यतनित करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        orderFailed: 'ऑर्डर देण्यात अयश्वी. कृपया पुन्हा प्रयत्न करा.',
        networkError: 'नेटवर्क त्रुटी. कृपया आपले कनेक्शन तपासा.',
        insufficientStock: 'अपुरा स्टॉक उपलब्ध.'
      }
    }
};

export default translations;
