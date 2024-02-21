import React, { useEffect, useState, useRef } from 'react';

const SelectImage = ({ imageUrl }) => {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
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
    return pieces.every((piece, index) => (
      piece.row === Math.floor(index / 4) &&
      piece.col === index % 4
    ));
  };

  const handleTouchStart = (index) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else {
      const updatedPieces = [...pieces];

      // Intercambia las posiciones de las piezas seleccionadas
      const tempPiece = { ...updatedPieces[index] };
      updatedPieces[index] = { ...updatedPieces[selectedPiece] };
      updatedPieces[selectedPiece] = tempPiece;

      // Actualiza las coordenadas actuales después del intercambio
      updatedPieces.forEach((piece, idx) => {
        piece.row = Math.floor(idx / 4);
        piece.col = idx % 4;
      });

      setPieces(updatedPieces);
      setSelectedPiece(null);

      // Muestra las coordenadas actuales por consola después de la interacción
      const currentCoordinates = updatedPieces.map(piece => ({ row: piece.row, col: piece.col }));
      console.log("Coordenadas actuales después de la interacción:", currentCoordinates);
    }
  };

  const handleSetButton = () => {
    // Obtener coordenadas actuales de las piezas
    const currentCoordinates = pieces.map(piece => ({ row: piece.row + 1, col: piece.col + 1 }));

    // Obtener coordenadas correctas de las piezas
    const correctCoordinates = pieces.map(piece => piece.originalPosition);

    // Mostrar coordenadas por consola
    console.log("Coordenadas actuales:", currentCoordinates);
    console.log("Coordenadas correctas:", correctCoordinates);

    // Verificar si el rompecabezas está resuelto
    setIsPuzzleSolved(checkPuzzleSolved());
  };

  useEffect(() => {
    const loadAndSplitImage = async () => {
      const image = new Image();
      image.src = imageUrl;

      await image.decode();

      const numPieces = 12;
      const cols = 4;
      const rows = 3;
      const pieceWidth = image.width / cols;
      const pieceHeight = image.height / rows;

      const generatedPieces = [];

      // Guarda la imagen original sin recortar
      originalImageRef.current = createPieceSrc(image, 0, 0, image.width, image.height);

      // Corta la imagen en piezas de forma completamente ordenada
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const pieceSrc = createPieceSrc(image, j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight);
          generatedPieces.push({
            index: i * cols + j,
            imageSrc: pieceSrc,
            originalPosition: { row: i, col: j },
            row: i, // Agregar las coordenadas iniciales aquí
            col: j, // Agregar las coordenadas iniciales aquí
          });
        }
      }

      // Mezcla las piezas
      generatedPieces.sort(() => Math.random() - 0.5);

      // Establece las piezas en su orden mezclado
      setPieces(generatedPieces);
    };

    if (imageUrl) {
      loadAndSplitImage();
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="grid grid-cols-4 gap-2 p-6 bg-gray-100 rounded-md shadow-md relative overflow-hidden max-w-3xl mx-auto cursor-pointer">
        {pieces.map((piece, index) => (
          <div
            className={`hover:scale-120 ${selectedPiece === index ? 'border-4 border-blue-500' : ''}`}
            key={index}
            onClick={() => handleTouchStart(index)}
          >
            <img
              src={piece.imageSrc}
              alt={`Puzzle Piece ${index}`}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-row items-center mt-4">
        <div className={`${
          isPuzzleSolved ? 'text-green-500' : 'bg-blue-500 text-white'
        } py-4 px-6 rounded cursor-pointer hover:scale-120 font-bold ml-2 mr-2`} onClick={handleSetButton}>
          {isPuzzleSolved ? '¡Puzzle resuelto!' : 'Set'}
        </div>
        <div className="bg-blue-500 text-white py-4 px-4 rounded cursor-pointer ml-2 mr-2  hover:scale-120 font-bold" onClick={() => window.location.reload()}>
          Refresh
        </div>
      </div>
    </div>
  );
};

export default SelectImage;
