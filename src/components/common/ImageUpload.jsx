import React, { useState, useRef } from 'react';
import { uploadBytesResumable, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { useTranslation } from '../../hooks/useTranslation';
import { X } from 'lucide-react';

const ImageUpload = ({ onUpload, initialImageUrl = '' }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = (file) => {
    if (!file) return;

    const fileRef = storageRef(storage, `product_images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    setUploading(true);
    setError(null);

    uploadTask.on('state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed:", error);
        setError(t('errors.imageUploadFailed'));
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          onUpload(downloadURL);
          setUploading(false);
        });
      }
    );
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onUpload('');
  };

  return (
    <div className="image-upload">
      <label className="block text-sm font-medium mb-1">
        {t('product.image')}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {imageUrl ? (
            <div className="relative group">
              <img src={imageUrl} alt="Product" className="mx-auto h-24 w-24 object-cover rounded-md" />
              <div className="absolute top-0 right-0">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1 bg-red-500 text-white rounded-full opacity-75 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}

          <div className="flex text-sm text-gray-600">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
              <span>{t('product.uploadImage')}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
            </label>
            <p className="pl-1">{t('product.dragDrop')}</p>
          </div>
          <p className="text-xs text-gray-500">
            {t('product.imageHint')}
          </p>
        </div>
      </div>
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default ImageUpload;

