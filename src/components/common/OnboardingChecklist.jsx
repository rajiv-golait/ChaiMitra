// Location: src/components/common/OnboardingChecklist.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext provides userProfile
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const taskDescriptions = {
  profileCompleted: 'Complete your profile information',
  firstProductAdded: 'Add your first product to sell',
  firstOrderPlaced: 'Place your first order for supplies',
};

const OnboardingChecklist = () => {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (userProfile?.onboardingStatus) {
      const taskList = Object.entries(userProfile.onboardingStatus);
      setTasks(taskList);

      const completedTasks = taskList.filter(([_, completed]) => completed).length;
      setProgress((completedTasks / taskList.length) * 100);
    }
  }, [userProfile]);

  if (!userProfile || progress === 100) {
    return null; // Don't show the checklist if user is not loaded or it's complete
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-2">Getting Started Guide</h3>
      <p className="text-sm text-gray-600 mb-4">Complete these steps to get the most out of HawkerHub!</p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Task List */}
      <ul className="space-y-2">
        {tasks.map(([taskKey, isCompleted]) => (
          <li key={taskKey} className="flex items-center">
            {isCompleted ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-gray-300 mr-2" />
            )}
            <span className={isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}>
              {taskDescriptions[taskKey]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingChecklist;

