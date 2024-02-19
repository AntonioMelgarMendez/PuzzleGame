import React, { useState } from 'react';
import Image from 'next/image';

const ImageUploader = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      onImageSelected(imageUrl); // Pasar la URL de la imagen al componente padre
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="max-w-md w-full p-6 bg-gray-100 rounded-md shadow-md text-center mt-10">
        <div className="mb-4 flex items-center justify-center">
          <Image src="/icon.png" width={60} height={60} />
        </div>
        <label className="block text-xl mb-4">Create your puzzle </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-4 mb-4 hidden" // Ocultar el input nativo
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="p-2 rounded-md cursor-pointer hover:underline hover:text-blue-500"
        >
          Upload Image
        </label>
        {selectedImage && (
          <div className="flex items-center justify-center mt-4">
            <img
              src={selectedImage}
              alt="Imagen seleccionada"
              className="w-full h-auto max-h-64"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
