import React, { useEffect, useState, useRef } from 'react';

const SelectImage = ({ imageUrl }) => {
  const [pieces, setPieces] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [previewPiece, setPreviewPiece] = useState(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const containerRef = useRef(null);
  const originalImageRef = useRef(null);

  const createPieceSrc = (image, x, y, pieceWidth, pieceHeight) => {
    const pieceCanvas = document.createElement('canvas');
    const pieceContext = pieceCanvas.getContext('2d');
    pieceCanvas.width = pieceWidth;
    pieceCanvas.height = pieceHeight;
    pieceContext.drawImage(image, x, y, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);
    return pieceCanvas.toDataURL();
  };

  const checkPuzzleSolved = () => {
    return pieces.every((piece) => piece.index === piece.originalIndex);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', '');
    setDraggedPiece(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();

    if (draggedPiece !== null && targetIndex !== draggedPiece) {
      const updatedPieces = [...pieces];
      [updatedPieces[targetIndex], updatedPieces[draggedPiece]] = [updatedPieces[draggedPiece], updatedPieces[targetIndex]];
      setPieces(updatedPieces);

      setIsPuzzleSolved(checkPuzzleSolved());
    }

    setPreviewPiece(null);
    setDraggedPiece(null);
  };

  const handleTouchStart = (e, index) => {
    e.preventDefault();
    setDraggedPiece(index);
    console.log(`Touch start: Piece ${index}`);
    // Agrega el manejador de eventos táctiles directamente al elemento de la pieza
    e.target.addEventListener('touchmove', handleTouchMove, { passive: false });
  };

  const handleTouchMove = (e) => {
    if (draggedPiece !== null) {
      e.preventDefault();
      // Resto de la lógica de manejo táctil...
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      console.log('Touch move:', touchX, touchY);
    }
  };

  const handleTouchEnd = (e, targetIndex) => {
    e.preventDefault();
    // Resto de la lógica de manejo táctil...
    // Elimina el manejador de eventos táctiles del elemento de la pieza
    e.target.removeEventListener('touchmove', handleTouchMove);
  };

  const downloadImage = (dataURL, filename) => {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSetButton = () => {
    // Generar la imagen completa uniendo las piezas
    const reconstructedImage = reconstructImage();

    // Comparar la imagen completa con la imagen original sin recortar
    const originalImage = originalImageRef.current;

    const isMatch = reconstructedImage === originalImage;

    // Actualizar el estado según el resultado de la comparación
    setIsPuzzleSolved(isMatch);

    // Descargar la imagen generada
    // downloadImage(reconstructedImage, 'reconstructed_image.png');

    // Descargar la imagen original sin recortar
    // downloadImage(originalImage, 'original_image.png');
  };

  const reconstructImage = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = originalImageRef.current.width;
    canvas.height = originalImageRef.current.height;

    // Asegurémonos de que todas las imágenes se han cargado antes de dibujarlas
    const promises = pieces.map((piece) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = piece.imageSrc;
        img.onload = () => {
          console.log('Image Loaded:', img.src);
          resolve(img);
        };
      });
    });

    Promise.all(promises).then((images) => {
      images.forEach((img) => {
        console.log('Image:', img); // Añadir un log para cada imagen
      });

      pieces.forEach((piece, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const pieceWidth = originalImageRef.current.width / 4;
        const pieceHeight = originalImageRef.current.height / 3;

        const img = images.find(img => img.src === piece.imageSrc);
        console.log('Drawing Image:', img.src);

        context.drawImage(img, col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);
      });
      // Devolver la URL de la imagen en formato base64
      const reconstructedDataURL = canvas.toDataURL('image/png');

      console.log('Reconstructed Image URL:', reconstructedDataURL); // Añadir un log para la URL de la imagen reconstruida

      // Descargar la imagen generada
      // downloadImage(reconstructedDataURL, 'reconstructed_image.png');
    });
  };

  useEffect(() => {
    return () => {
      // Limpia el manejador de eventos táctiles al desmontar el componente
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const loadAndSplitImage = async () => {
      const image = new Image();
      image.src = imageUrl;

      await image.decode();

      const numPieces = 12;
      const cols = 4;
      const rows = numPieces / cols;
      const pieceWidth = image.width / cols;
      const pieceHeight = image.height / rows;

      const generatedPieces = [];

      // Guardar la imagen original sin recortar
      originalImageRef.current = createPieceSrc(image, 0, 0, image.width, image.height);

      // Cortar la imagen en piezas de forma ordenada
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const pieceSrc = createPieceSrc(image, i * pieceWidth, j * pieceHeight, pieceWidth, pieceHeight);
          generatedPieces.push({ index: i * rows + j, imageSrc: pieceSrc });
        }
      }

      // Mezclar las piezas
      generatedPieces.sort(() => Math.random() - 0.5);

      setPieces(generatedPieces);
    };

    if (imageUrl) {
      loadAndSplitImage();
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="grid grid-cols-4 gap-2 p-6 bg-gray-100 rounded-md shadow-md relative overflow-hidden max-w-3xl mx-auto" ref={containerRef}>
        {pieces.map((piece, index) => (
          <div
            key={index}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
            style={{ touchAction: 'none' }} // Evitar desplazamiento táctil predeterminado
          >
            <img
              src={index === draggedPiece ? previewPiece || piece.imageSrc : piece.imageSrc}
              alt={`Puzzle Piece ${index}`}
              draggable
              onDragStart={(e) => {
                handleDragStart(e, index);
                setPreviewPiece(piece.imageSrc);
              }}
              onDragEnd={() => setPreviewPiece(null)}
            />
            {isPuzzleSolved && (
              <p className="text-xs mt-1">
                {`Posición: (${index % 4 + 1}, ${Math.floor(index / 4) + 1})`}
              </p>
            )}
          </div>
        ))}
      </div>
      {isPuzzleSolved ? (
        <p className="text-green-500 mt-4">¡Puzzle resuelto!</p>
      ) : (
        <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleSetButton}>Set</button>
      )}
      <div className="mt-4">
        <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </div>
  );
};

export default SelectImage;
