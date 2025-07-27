import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const ImageUploader = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        setError(null);
        const storage = getStorage();
        // Assume a naming convention for the file, e.g., using timestamp to avoid collisions
        const storageRef = ref(storage, `product_images/${new Date().getTime()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setError("Upload failed. Please try again.");
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setUploading(false);
                    onUploadComplete(downloadURL);
                    setFile(null); // Reset file input
                });
            }
        );
    };

    return (
        <div className="image-uploader">
            <input type="file" onChange={handleFileChange} disabled={uploading} />
            <button onClick={handleUpload} disabled={uploading || !file}>
                {uploading ? `Uploading... ${progress.toFixed(0)}%` : "Upload Image"}
            </button>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default ImageUploader;

