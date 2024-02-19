import 'default-passive-events';
import React, { useEffect, useState, useRef } from 'react';

const SelectImage = ({ imageUrl }) => {
  const [pieces, setPieces] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [previewPiece, setPreviewPiece] = useState(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const containerRef = useRef(null);

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

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, image.width, image.height);

      const generatedPieces = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const pieceCanvas = document.createElement('canvas');
          const pieceContext = pieceCanvas.getContext('2d');
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;
          pieceContext.drawImage(
            canvas,
            i * pieceWidth,
            j * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          const pieceSrc = pieceCanvas.toDataURL();
          generatedPieces.push({ index: i * rows + j, imageSrc: pieceSrc });
        }
      }

      generatedPieces.sort(() => Math.random() - 0.5);

      setPieces(generatedPieces);
    };

    if (imageUrl) {
      loadAndSplitImage();
    }
  }, [imageUrl]);

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

      const correctPositions = Array.from({ length: pieces.length }, (_, i) => i);
      const puzzleSolved = JSON.stringify(updatedPieces.map((piece) => piece.index)) === JSON.stringify(correctPositions);
      setIsPuzzleSolved(puzzleSolved);
    }

    setPreviewPiece(null);
    setDraggedPiece(null);
  };

  const handleTouchStart = (e, index) => {
    e.preventDefault();
    setDraggedPiece(index);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    // Puedes agregar lógica adicional aquí si es necesario
  };

  const handleTouchEnd = (e, targetIndex) => {
    e.preventDefault();

    if (draggedPiece !== null && targetIndex !== draggedPiece) {
      const updatedPieces = [...pieces];
      [updatedPieces[targetIndex], updatedPieces[draggedPiece]] = [updatedPieces[draggedPiece], updatedPieces[targetIndex]];
      setPieces(updatedPieces);

      const correctPositions = Array.from({ length: pieces.length }, (_, i) => i);
      const puzzleSolved = JSON.stringify(updatedPieces.map((piece) => piece.index)) === JSON.stringify(correctPositions);
      setIsPuzzleSolved(puzzleSolved);
    }

    setPreviewPiece(null);
    setDraggedPiece(null);
  };

  useEffect(() => {
    const handleTouchMoveWithPreventDefault = (e) => {
      e.preventDefault();
      handleTouchMove(e);
    };

    document.addEventListener('touchmove', handleTouchMoveWithPreventDefault, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMoveWithPreventDefault);
    };
  }, [handleTouchMove]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="grid grid-cols-4 gap-2 p-6 bg-gray-100 rounded-md shadow-md relative overflow-hidden max-w-3xl mx-auto" ref={containerRef}>
        {pieces.map((piece, index) => (
          <div
            key={index}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
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
          </div>
        ))}
      </div>
      {isPuzzleSolved && <p className="text-green-500 mt-4">¡Puzzle resuelto!</p>}
      <div className="mt-4">
        <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </div>
  );
};

export default SelectImage;

