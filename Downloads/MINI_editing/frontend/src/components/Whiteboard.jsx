import { useState, useRef, useEffect } from 'react';
import { sendMessage, recieveMessage } from '../config/socket';
import { useUser } from '../context/user.context';
import 'remixicon/fonts/remixicon.css';

const Whiteboard = ({ projectId, isVisible, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen'); // pen, eraser
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const { user } = useUser();
  const socketSetupRef = useRef(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  const brushSizes = [
    { size: 1, label: 'Small' },
    { size: 2, label: 'Medium' },
    { size: 4, label: 'Large' },
    { size: 8, label: 'XLarge' }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup socket listeners only once
    if (!socketSetupRef.current) {
      console.log('Setting up whiteboard socket listeners');
      socketSetupRef.current = true;

      recieveMessage('whiteboard:draw', (data) => {
        console.log('Received whiteboard:draw', data);
        handleRemoteDraw(data);
      });

      recieveMessage('whiteboard:clear', () => {
        console.log('Received whiteboard:clear');
        handleRemoteClear();
      });

      recieveMessage('whiteboard:undo', () => {
        console.log('Received whiteboard:undo');
        handleRemoteUndo();
      });

      recieveMessage('whiteboard:cursor', (data) => {
        handleRemoteCursor(data);
      });

      recieveMessage('whiteboard:init', (data) => {
        console.log('Received whiteboard:init', data);
        handleWhiteboardInit(data);
      });
    }

    // Request initial state
    console.log('Requesting whiteboard init for project:', projectId);
    sendMessage('whiteboard:request-init', { projectId });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isVisible, projectId]);

  const handleWhiteboardInit = (data) => {
    console.log('Initializing whiteboard with history:', data.history?.length || 0, 'items');
    if (data.history && data.history.length > 0) {
      setDrawingHistory(data.history);
      setTimeout(() => {
        redrawCanvas(data.history);
      }, 100);
    }
  };

  const handleRemoteDraw = (data) => {
    console.log('Handling remote draw from user:', data.userId, 'current user:', user?._id);
    if (data.userId === user?._id) {
      console.log('Skipping own drawing');
      return; // Skip own drawings
    }

    console.log('Drawing remote path with', data.points?.length, 'points');
    setDrawingHistory(prev => {
      const newHistory = [...prev, data];
      return newHistory;
    });
    drawPath(data);
  };

  const handleRemoteClear = () => {
    console.log('Clearing whiteboard remotely');
    setDrawingHistory([]);
    clearCanvas();
  };

  const handleRemoteUndo = () => {
    console.log('Undo action received');
    setDrawingHistory(prev => {
      const newHistory = prev.slice(0, -1);
      setTimeout(() => {
        redrawCanvas(newHistory);
      }, 0);
      return newHistory;
    });
  };

  const handleRemoteCursor = (data) => {
    if (data.userId === user?._id) return;

    setRemoteCursors(prev => ({
      ...prev,
      [data.userId]: {
        x: data.x,
        y: data.y,
        userName: data.userName,
        color: data.color || '#000000',
        timestamp: Date.now()
      }
    }));

    // Remove cursor after 2 seconds of inactivity
    setTimeout(() => {
      setRemoteCursors(prev => {
        const updated = { ...prev };
        if (updated[data.userId]?.timestamp === data.timestamp) {
          delete updated[data.userId];
        }
        return updated;
      });
    }, 2000);
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setCurrentPath([point]);
  };

  const draw = (e) => {
    if (!isDrawing) {
      // Send cursor position even when not drawing
      const point = getCanvasPoint(e);
      sendMessage('whiteboard:cursor', {
        projectId,
        userId: user?._id,
        userName: user?.email || 'Anonymous',
        x: point.x,
        y: point.y,
        color: currentColor,
        timestamp: Date.now()
      });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const point = getCanvasPoint(e);

    const newPath = [...currentPath, point];
    setCurrentPath(newPath);

    // Draw locally
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentTool === 'pen') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 4;
    }

    if (currentPath.length > 0) {
      const prevPoint = currentPath[currentPath.length - 1];
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) {
      setIsDrawing(false);
      return;
    }

    const drawData = {
      projectId,
      userId: user?._id,
      userName: user?.email || 'Anonymous',
      tool: currentTool,
      color: currentColor,
      brushSize: currentTool === 'pen' ? brushSize : brushSize * 4,
      points: currentPath,
      timestamp: Date.now()
    };

    console.log('Sending draw data:', drawData);

    // Add to local history immediately
    setDrawingHistory(prev => [...prev, drawData]);

    // Send to other users
    sendMessage('whiteboard:draw', drawData);

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const drawPath = (pathData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = pathData.tool === 'eraser' ? '#FFFFFF' : pathData.color;
    ctx.lineWidth = pathData.brushSize;

    ctx.beginPath();
    pathData.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  const redrawCanvas = (history = drawingHistory) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all paths
    history.forEach(pathData => {
      drawPath(pathData);
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    if (!window.confirm('Are you sure you want to clear the whiteboard for everyone?')) {
      return;
    }

    console.log('Clearing whiteboard');
    setDrawingHistory([]);
    clearCanvas();
    sendMessage('whiteboard:clear', { projectId });
  };

  const handleUndo = () => {
    if (drawingHistory.length === 0) return;

    console.log('Undoing last action');
    const newHistory = drawingHistory.slice(0, -1);
    setDrawingHistory(newHistory);
    redrawCanvas(newHistory);
    sendMessage('whiteboard:undo', { projectId });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Toolbar */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-4 shadow-xl border-b-2 border-slate-600">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Tools Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 bg-opacity-50 p-2 rounded-lg">
              <button
                onClick={() => setCurrentTool('pen')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentTool === 'pen' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105' 
                    : 'bg-slate-600 text-gray-200 hover:bg-slate-500'
                }`}
                title="Pen Tool"
              >
                <i className="ri-pencil-line text-lg"></i>
              </button>

              <button
                onClick={() => setCurrentTool('eraser')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentTool === 'eraser' 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50 scale-105' 
                    : 'bg-slate-600 text-gray-200 hover:bg-slate-500'
                }`}
                title="Eraser"
              >
                <i className="ri-eraser-line text-lg"></i>
              </button>
            </div>

            <div className="h-10 w-px bg-slate-600"></div>

            {/* Enhanced Color Palette */}
            <div className="flex gap-2 bg-slate-900 bg-opacity-50 p-2 rounded-lg">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 ${
                    currentColor === color 
                      ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-800 scale-110 shadow-lg' 
                      : 'ring-2 ring-slate-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            <div className="h-10 w-px bg-slate-600"></div>

            {/* Enhanced Brush Sizes */}
            <div className="flex gap-2 bg-slate-900 bg-opacity-50 p-2 rounded-lg">
              {brushSizes.map(({ size, label }) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    brushSize === size 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                      : 'bg-slate-600 text-gray-200 hover:bg-slate-500'
                  }`}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={drawingHistory.length === 0}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              title="Undo"
            >
              <i className="ri-arrow-go-back-line mr-1"></i> Undo
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              title="Clear Canvas"
            >
              <i className="ri-delete-bin-line mr-1"></i> Clear
            </button>

            <button
              onClick={downloadCanvas}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              title="Download"
            >
              <i className="ri-download-line mr-1"></i> Save
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              title="Close Whiteboard"
            >
              <i className="ri-close-line mr-1"></i> Close
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Canvas Container */}
      <div className="flex-1 relative overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
          style={{ display: 'block' }}
        />

        {/* Enhanced Remote Cursors */}
        {Object.entries(remoteCursors).map(([userId, cursor]) => (
          <div
            key={userId}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-4 h-4 rounded-full shadow-lg animate-pulse"
              style={{ backgroundColor: cursor.color }}
            ></div>
            <div className="text-xs bg-black text-white px-3 py-1 rounded-full mt-2 whitespace-nowrap shadow-lg font-medium">
              {cursor.userName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whiteboard;
