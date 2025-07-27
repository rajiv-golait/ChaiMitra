import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const LocationSelector = ({ onLocationSelect, selectedLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(selectedLocation?.city || '');
  const [selectedArea, setSelectedArea] = useState(selectedLocation?.area || '');

  const indianCities = {
    'Mumbai': [
      'Andheri East', 'Andheri West', 'Bandra', 'Borivali', 'Dadar', 'Ghatkopar',
      'Juhu', 'Kandivali', 'Malad', 'Powai', 'Santacruz', 'Vile Parle'
    ],
    'Delhi': [
      'Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Chandni Chowk', 'Saket',
      'Dwarka', 'Rohini', 'Janakpuri', 'Pitampura', 'Vasant Kunj'
    ],
    'Bangalore': [
      'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Marathahalli',
      'BTM Layout', 'Jayanagar', 'Rajajinagar', 'Yelahanka', 'HSR Layout'
    ],
    'Hyderabad': [
      'Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Gachibowli', 'Hitech City',
      'Kondapur', 'Madhapur', 'Kukatpally', 'Dilsukhnagar', 'Ameerpet'
    ],
    'Chennai': [
      'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Chrompet',
      'Mylapore', 'Nungambakkam', 'Porur', 'OMR'
    ],
    'Kolkata': [
      'Park Street', 'Salt Lake', 'Ballygunge', 'Howrah', 'Alipore', 'Gariahat',
      'Esplanade', 'Shyambazar', 'Tollygunge', 'New Town'
    ],
    'Pune': [
      'Koregaon Park', 'Hinjewadi', 'Baner', 'Wakad', 'Kothrud', 'Deccan',
      'Camp', 'Hadapsar', 'Magarpatta', 'Aundh'
    ],
    'Ahmedabad': [
      'Satellite', 'Vastrapur', 'Navrangpura', 'Maninagar', 'Bopal', 'Gota',
      'Chandkheda', 'Thaltej', 'Prahlad Nagar', 'SG Highway'
    ]
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedArea('');
    if (onLocationSelect) {
      onLocationSelect({ city, area: '' });
    }
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    if (onLocationSelect) {
      onLocationSelect({ city: selectedCity, area });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:border-orange-500 transition-colors w-full text-left"
      >
        <MapPinIcon className="w-5 h-5 text-orange-600" />
        <div className="flex-1">
          {selectedCity && selectedArea ? (
            <span className="text-gray-900">
              {selectedArea}, {selectedCity}
            </span>
          ) : selectedCity ? (
            <span className="text-gray-600">
              {selectedCity} - Select Area
            </span>
          ) : (
            <span className="text-gray-500">Select Location</span>
          )}
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {!selectedCity ? (
            // City Selection
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b">
                Select City
              </div>
              {Object.keys(indianCities).map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-3 py-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded"
                >
                  {city}
                </button>
              ))}
            </div>
          ) : (
            // Area Selection
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium text-gray-700">
                  Areas in {selectedCity}
                </span>
                <button
                  onClick={() => setSelectedCity('')}
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  Change City
                </button>
              </div>
              {indianCities[selectedCity].map((area) => (
                <button
                  key={area}
                  onClick={() => handleAreaSelect(area)}
                  className={`w-full text-left px-3 py-2 hover:bg-orange-50 hover:text-orange-600 transition-colors rounded ${
                    selectedArea === area ? 'bg-orange-100 text-orange-700' : ''
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LocationSelector;
