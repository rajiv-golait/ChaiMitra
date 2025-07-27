import React, { useState, useRef } from 'react';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Store, Package, ChevronDown, User, Camera, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Utility Components ---
const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-charcoal-black"></div>
);

const ProfilePictureUpload = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Pass file to parent
      onFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const triggerFileSelect = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={clsx(
          "relative w-32 h-32 rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden",
          dragActive
            ? "border-[#FFA500] bg-[#FFA500]/10"
            : "border-gray-300 hover:border-[#FFA500] hover:bg-[#FFA500]/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={triggerFileSelect}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
              disabled={disabled}
            >
              ×
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <User className="h-8 w-8 mb-2" />
            <span className="text-xs font-medium">Add Photo</span>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Click to upload or drag & drop<br />
        PNG, JPG up to 5MB
      </p>
    </div>
  );
};

// --- Main ProfileSetup Component ---
const ProfileSetup = ({ user, onComplete }) => {
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    language: 'en'
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' }
  ];

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.role) {
      setError('Please select whether you are a Vendor or a Supplier.');
      return;
    }

    setLoading(true);
    setError('');

    try {
        let avatarUrl = '';
        if (avatar) {
            const avatarRef = ref(storage, `user_avatars/${user.uid}/avatar.jpg`);
            await uploadBytes(avatarRef, avatar);
            avatarUrl = await getDownloadURL(avatarRef);
        }

      const onboardingTasks = {
        profileCompleted: false,
        ...(formData.role === 'supplier' && { firstProductAdded: false }),
        ...(formData.role === 'vendor' && { firstOrderPlaced: false }),
      };

      const userProfile = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        name: formData.name.trim(),
        role: formData.role,
        language: formData.language,
        createdAt: serverTimestamp(),
        isProfileComplete: true,
        onboardingStatus: onboardingTasks,
        isRisingStar: false,
        avatarUrl,
      };

      // Debug logging
      console.log('Creating profile with data:', {
        ...userProfile,
        createdAt: '[serverTimestamp()]'
      });
      console.log('User UID:', user.uid);
      console.log('User phoneNumber:', user.phoneNumber);
      console.log('User is authenticated:', !!user);

await setDoc(doc(db, 'users', user.uid), userProfile);
      // -- NEW: Update onboarding status --
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        'onboardingStatus.profileCompleted': true
      });
      updateUserProfile(userProfile);
      onComplete(userProfile);
    } catch (err) {
      console.error('Error creating profile:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      setError(`Failed to create your profile: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col justify-center items-center p-4 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="font-poppins font-bold text-3xl mb-2">
              One Last Step...
            </h1>
            <p className="text-[#6B7280]">
              Let's set up your ChaiMitra profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Profile Picture
              </label>
              <ProfilePictureUpload onFileSelect={setAvatar} disabled={loading} />
            </div>
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Your Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ramesh Kumar"
                className="w-full px-4 py-3 bg-[#FFF8E7] border-2 border-gray-200 rounded-xl text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                disabled={loading}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">I am a...</label>
              <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoleCard 
                  role="vendor"
                  icon={<Store size={32} />}
                  title="Vendor"
                  subtitle="I sell street food"
                  currentRole={formData.role}
                  setRole={(role) => setFormData({ ...formData, role })}
                  disabled={loading}
                />
                <RoleCard 
                  role="supplier"
                  icon={<Package size={32} />}
                  title="Supplier"
                  subtitle="I supply materials"
                  currentRole={formData.role}
                  setRole={(role) => setFormData({ ...formData, role })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Preferred Language
              </label>
              <div className="relative">
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full appearance-none px-4 py-3 bg-[#FFF8E7] border-2 border-gray-200 rounded-xl text-[#1A1A1A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                  disabled={loading}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 animate-fade-in">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.role}
              className="w-full flex items-center justify-center text-[#1A1A1A] font-semibold py-3 sm:py-4 px-6 rounded-xl shadow-md transition-all duration-300 transform
                         bg-gradient-to-br from-[#FFA500] to-[#FFC107]
                         hover:shadow-lg hover:shadow-[#FFA500]/40 hover:-translate-y-1
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500]
                         disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {loading ? <LoadingSpinner /> : 'Create My Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component for Role Cards ---
const RoleCard = ({ role, icon, title, subtitle, currentRole, setRole, disabled }) => {
  const isSelected = currentRole === role;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => setRole(role)}
      disabled={disabled}
      className={clsx(
        "p-6 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 transform",
        isSelected 
          ? "bg-yellow-500/10 border-[#FFA500] ring-2 ring-[#FFA500] scale-105" 
          : "bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-500/5"
      )}
    >
      <div className={clsx("mx-auto mb-3", isSelected ? 'text-[#FFA500]' : 'text-gray-500')}>{icon}</div>
      <p className="font-poppins font-semibold text-[#1A1A1A]">{title}</p>
      <p className="text-xs text-[#6B7280]">{subtitle}</p>
    </button>
  );
};

export default ProfileSetup;