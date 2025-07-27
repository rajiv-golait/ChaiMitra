import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingStorefrontIcon,
  TruckIcon,
  HomeIcon,
  GlobeAsiaAustraliaIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const IndianSupplierCategories = ({ onCategorySelect, selectedCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const supplierCategories = [
    {
      id: 'kirana',
      name: 'Kirana Store',
      nameHi: 'किराना स्टोर',
      icon: BuildingStorefrontIcon,
      emoji: '🏪',
      description: 'Local grocery stores with daily essentials',
      descriptionHi: 'दैनिक आवश्यकताओं के साथ स्थानीय किराना दुकानें',
      items: ['Rice', 'Dal', 'Oil', 'Spices', 'Flour', 'Sugar'],
      itemsHi: ['चावल', 'दाल', 'तेल', 'मसाले', 'आटा', 'चीनी'],
      avgDelivery: '30 mins',
      minOrder: '₹200',
      rating: 4.2,
      suppliers: 156,
      color: 'blue'
    },
    {
      id: 'sabzi_mandi',
      name: 'Sabzi Mandi',
      nameHi: 'सब्जी मंडी',
      icon: TruckIcon,
      emoji: '🥬',
      description: 'Fresh vegetables and fruits wholesale market',
      descriptionHi: 'ताजी सब्जियां और फल होलसेल मार्केट',
      items: ['Onions', 'Tomatoes', 'Potatoes', 'Leafy Greens', 'Fruits'],
      itemsHi: ['प्याज', 'टमाटर', 'आलू', 'हरी पत्तेदार सब्जी', 'फल'],
      avgDelivery: '4-6 AM',
      minOrder: '₹500',
      rating: 4.5,
      suppliers: 89,
      color: 'green'
    },
    {
      id: 'dairy',
      name: 'Dairy Vendor',
      nameHi: 'डेयरी विक्रेता',
      icon: HomeIcon,
      emoji: '🥛',
      description: 'Fresh milk, curd, paneer and dairy products',
      descriptionHi: 'ताजा दूध, दही, पनीर और डेयरी उत्पाद',
      items: ['Milk', 'Curd', 'Paneer', 'Butter', 'Ghee'],
      itemsHi: ['दूध', 'दही', 'पनीर', 'मक्खन', 'घी'],
      avgDelivery: '5-7 AM',
      minOrder: '₹300',
      rating: 4.7,
      suppliers: 67,
      color: 'yellow'
    },
    {
      id: 'meat_fish',
      name: 'Meat & Fish',
      nameHi: 'मांस और मछली',
      icon: GlobeAsiaAustraliaIcon,
      emoji: '🐟',
      description: 'Fresh meat, chicken, fish and seafood',
      descriptionHi: 'ताजा मांस, चिकन, मछली और समुद्री भोजन',
      items: ['Chicken', 'Mutton', 'Fish', 'Prawns', 'Eggs'],
      itemsHi: ['चिकन', 'मटन', 'मछली', 'झींगा', 'अंडे'],
      avgDelivery: '5-8 AM',
      minOrder: '₹400',
      rating: 4.3,
      suppliers: 43,
      color: 'red'
    },
    {
      id: 'wholesale',
      name: 'Wholesale Market',
      nameHi: 'होलसेल मार्केट',
      icon: TruckIcon,
      emoji: '📦',
      description: 'Bulk quantities at wholesale prices',
      descriptionHi: 'होलसेल दरों पर बल्क मात्रा',
      items: ['Bulk Rice', 'Bulk Dal', 'Bulk Spices', 'Bulk Oil'],
      itemsHi: ['बल्क चावल', 'बल्क दाल', 'बल्क मसाले', 'बल्क तेल'],
      avgDelivery: '6-8 AM',
      minOrder: '₹1000',
      rating: 4.4,
      suppliers: 34,
      color: 'purple'
    },
    {
      id: 'specialty',
      name: 'Specialty Items',
      nameHi: 'विशेष वस्तुएं',
      icon: StarIcon,
      emoji: '⭐',
      description: 'Regional specialties and unique ingredients',
      descriptionHi: 'क्षेत्रीय विशेषताएं और अनोखी सामग्री',
      items: ['Regional Spices', 'Organic Items', 'Imported Goods'],
      itemsHi: ['क्षेत्रीय मसाले', 'ऑर्गेनिक आइटम', 'आयातित सामान'],
      avgDelivery: '1-2 hours',
      minOrder: '₹300',
      rating: 4.6,
      suppliers: 28,
      color: 'indigo'
    }
  ];

  const getColorClasses = (color, isSelected = false, isHovered = false) => {
    const colors = {
      blue: {
        bg: isSelected ? 'bg-blue-50' : isHovered ? 'bg-blue-25' : 'bg-white',
        border: isSelected ? 'border-blue-500' : 'border-gray-200',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      },
      green: {
        bg: isSelected ? 'bg-green-50' : isHovered ? 'bg-green-25' : 'bg-white',
        border: isSelected ? 'border-green-500' : 'border-gray-200',
        text: 'text-green-600',
        badge: 'bg-green-100 text-green-800'
      },
      yellow: {
        bg: isSelected ? 'bg-yellow-50' : isHovered ? 'bg-yellow-25' : 'bg-white',
        border: isSelected ? 'border-yellow-500' : 'border-gray-200',
        text: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800'
      },
      red: {
        bg: isSelected ? 'bg-red-50' : isHovered ? 'bg-red-25' : 'bg-white',
        border: isSelected ? 'border-red-500' : 'border-gray-200',
        text: 'text-red-600',
        badge: 'bg-red-100 text-red-800'
      },
      purple: {
        bg: isSelected ? 'bg-purple-50' : isHovered ? 'bg-purple-25' : 'bg-white',
        border: isSelected ? 'border-purple-500' : 'border-gray-200',
        text: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      },
      indigo: {
        bg: isSelected ? 'bg-indigo-50' : isHovered ? 'bg-indigo-25' : 'bg-white',
        border: isSelected ? 'border-indigo-500' : 'border-gray-200',
        text: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-800'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {supplierCategories.map((category, index) => {
        const isSelected = selectedCategory === category.id;
        const isHovered = hoveredCategory === category.id;
        const colorClasses = getColorClasses(category.color, isSelected, isHovered);

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg`}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
            onClick={() => onCategorySelect(category)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{category.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.nameHi}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">{category.rating}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3">{category.description}</p>
            <p className="text-gray-500 text-xs mb-4">{category.descriptionHi}</p>

            {/* Items */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {category.items.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className={`${colorClasses.badge} text-xs px-2 py-1 rounded-full`}
                  >
                    {item}
                  </span>
                ))}
                {category.items.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{category.items.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{category.avgDelivery}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{category.suppliers} suppliers</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Min Order:</span>
                <span className="font-medium text-gray-900">{category.minOrder}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default IndianSupplierCategories;
