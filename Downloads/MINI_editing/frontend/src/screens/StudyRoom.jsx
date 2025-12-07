import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/axios';
import 'remixicon/fonts/remixicon.css';
import { intializeSocket, recieveMessage, sendMessage } from '../config/socket';
import { useUser } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import Whiteboard from '../components/Whiteboard';

const StudyRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studyRoom, setStudyRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false); // Prevent multiple join attempts
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // For message context menu
  const [fileDeleteMenu, setFileDeleteMenu] = useState(null); // For file delete dropdown
  const [hoveredMessage, setHoveredMessage] = useState(null); // Track hovered message
  const [selectionMode, setSelectionMode] = useState(false); // Multi-select mode
  const [selectedMessages, setSelectedMessages] = useState([]); // Selected message IDs
  const [editingMessage, setEditingMessage] = useState(null); // Message being edited
  const [editText, setEditText] = useState(''); // Edited message text

  const { user } = useUser();

  const isOwner = studyRoom && user && studyRoom.owner?._id === user._id;

  useEffect(() => {
    if (!id) {
      navigate('/studyrooms');
      return;
    }

    fetchStudyRoom(true); // Pass true to join on initial load only
  }, [id]);

  useEffect(() => {
    if (!studyRoom?._id) return;

    // Initialize socket with study room ID
    intializeSocket(studyRoom._id, true); // true indicates it's a study room

    // Fetch existing messages
    fetchMessages();

    // Set up message listener - receive ALL messages including own
    recieveMessage('project-message', (data) => {
      console.log('Received message:', data);
      // Check if message is from current user
      const isOwnMessage = data.sender === user._id || data.user?._id === user._id;
      setMessages(prev => {
        // Check if message already exists by _id or by timestamp+sender
        const exists = prev.some(msg => 
          (msg._id && msg._id === data._id) ||
          (msg.timestamp === data.timestamp && 
           (msg.sender === data.sender || msg.user?._id === data.user?._id))
        );
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        return [...prev, { ...data, isOwn: isOwnMessage }];
      });
    });

    // Listen for participant updates
    recieveMessage('room-participants-update', (data) => {
      console.log('Participant update:', data);
      fetchStudyRoom(); // Refresh to get updated participant list
    });

    // Listen for user joined
    recieveMessage('user-joined', (data) => {
      console.log('User joined:', data);
      fetchStudyRoom();
    });

    // Listen for user left
    recieveMessage('user-left', (data) => {
      console.log('User left:', data);
      fetchStudyRoom();
    });

    // Listen for moderation warnings
    recieveMessage('moderation-warning', (data) => {
      alert(`⚠️ ${data.message}\n\nYou will be automatically removed after 3 warnings.`);
      if (data.removed) {
        alert('You have been removed from this study room due to inappropriate content.');
        navigate('/studyrooms');
      }
    });

    // Listen for permanent ban
    recieveMessage('permanently-banned', (data) => {
      alert(`🚫 ${data.message}\n\nYou cannot rejoin this room.`);
      navigate('/studyrooms');
    });

    // Listen for user removed (for other participants to see)
    recieveMessage('user-removed', (data) => {
      fetchStudyRoom(); // Refresh participant list
    });

    // Listen for participants updated
    recieveMessage('participants-updated', (data) => {
      setStudyRoom(prev => ({ ...prev, participants: data.participants }));
    });

    // Listen for user kicked
    recieveMessage('user-kicked', (data) => {
      if (data.userId === user._id) {
        alert('You have been removed from this study room by the owner.');
        navigate('/studyrooms');
      } else {
        fetchStudyRoom(); // Refresh participant list
      }
    });

    // Listen for file events
    recieveMessage('file-uploaded', () => {
      fetchFiles();
    });

    recieveMessage('file-deleted', () => {
      fetchFiles();
    });

    // Listen for message deletion events
    recieveMessage('message-deleted-for-me', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    recieveMessage('message-deleted-for-everyone', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Listen for message edit events
    recieveMessage('message-edited', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, message: data.newMessage, edited: true } 
          : msg
      ));
    });

    recieveMessage('all-chat-cleared-for-me', () => {
      setMessages([]);
    });

    fetchFiles();    // Cleanup function - disconnect socket when component unmounts or room changes
    return () => {
      console.log('Cleaning up socket connection');
      // Socket will be disconnected when intializeSocket is called again with new room
    };
  }, [studyRoom?._id]); // Only re-run when room ID changes, not when room data updates

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchStudyRoom = async (shouldJoin = false) => {
    try {
      setLoading(true);
      
      // Only try to join on initial load, not on every refresh
      if (shouldJoin && !isJoining) {
        setIsJoining(true); // Prevent concurrent join attempts
        try {
          const joinResponse = await api.post(`/studyroom/join/${id}`);
          console.log('Join response:', joinResponse.data.message);
        } catch (joinErr) {
          // If join fails with 403 (removed/no access), handle it
          if (joinErr.response?.status === 403) {
            const errorMsg = joinErr.response?.data?.error || 'Access denied';
            setError(errorMsg);
            setLoading(false);
            if (joinErr.response?.data?.removed) {
              alert('🚫 You have been permanently removed from this study room and cannot access it.');
              navigate('/studyrooms');
              return;
            }
            setTimeout(() => navigate('/studyrooms'), 2000);
            return;
          }
          // For other errors, log and continue to try fetching room details
          console.log('Join attempt:', joinErr.response?.data?.message || joinErr.message);
        } finally {
          // Keep isJoining true to prevent re-joining during this session
        }
      }
      
      // Then fetch the room details
      const response = await api.get(`/studyroom/${id}`);
      setStudyRoom(response.data.studyRoom);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch study room';
      setError(errorMsg);
      
      // Handle removed/banned users
      if (err.response?.data?.removed) {
        alert('🚫 You have been permanently removed from this study room and cannot access it.');
        navigate('/studyrooms');
        return;
      }
      
      if (err.response?.status === 403 || err.response?.status === 404) {
        setTimeout(() => navigate('/studyrooms'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await api.get(`/files/studyroom/list/${id}`);
      const allFiles = response.data.files || [];
      // Filter out files deleted by current user or deleted for everyone
      const visibleFiles = allFiles.filter(file => 
        !file.deletedForEveryone && 
        !file.deletedBy?.some(id => id === user._id || id === user._id.toString())
      );
      setFiles(visibleFiles);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${id}`);
      const msgs = response.data.messages || [];
      // Normalize message structure - ensure user field exists
      const messagesWithOwn = msgs.map(msg => ({
        ...msg,
        user: msg.user || msg.sender, // Use user if exists, otherwise sender
        isOwn: msg.sender?._id === user._id || msg.sender === user._id
      }));
      setMessages(messagesWithOwn);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      // Don't show error to user, just log it
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      sender: user._id,
      studyRoomId: studyRoom._id,
      timestamp: new Date().toISOString(),
      user: user
    };

    // Send message via socket - server will broadcast to all including sender
    sendMessage('project-message', messageData);
    
    // Clear input immediately for better UX
    setNewMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/files/studyroom/upload/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      sendMessage('file-uploaded', { filename: file.name });
      fetchFiles();
      alert('File uploaded successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDownload = async (filename, originalName) => {
    try {
      const response = await api.get(`/files/studyroom/download/${id}/${filename}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to download file');
    }
  };

  const handleDeleteFile = async (filename, deleteForEveryone = false) => {
    try {
      await api.post(`/files/studyroom/delete/${id}/${filename}`, {
        deleteForEveryone
      });
      if (deleteForEveryone) {
        sendMessage('file-deleted', { filename });
      }
      fetchFiles();
      alert(deleteForEveryone ? 'File deleted for everyone!' : 'File hidden for you!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete file');
    }
  };

  const handleKickUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      await api.post('/studyroom/remove-participant', {
        roomId: id,
        userId
      });

      sendMessage('kick-user', { userId });
      fetchStudyRoom();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove user');
    }
  };

  const handleLeaveRoom = async () => {
    if (!confirm('Are you sure you want to leave this study room?')) return;

    try {
      await api.post('/studyroom/leave', { roomId: id });
      navigate('/studyrooms');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to leave room');
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm('Are you sure you want to delete this study room? This action cannot be undone.')) return;

    try {
      await api.delete(`/studyroom/${id}`);
      navigate('/studyrooms');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete room');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageRightClick = (e, msg) => {
    e.preventDefault();
    if (msg.user?.email === 'ai@example.com') return; // Can't delete AI messages
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg
    });
  };

  const handleDeleteForMe = () => {
    if (!contextMenu) return;
    
    sendMessage('delete-message-for-me', {
      messageId: contextMenu.message._id
    });
    
    // Remove from local state immediately
    setMessages(prev => prev.filter(msg => msg._id !== contextMenu.message._id));
    setContextMenu(null);
  };

  const handleDeleteForEveryone = () => {
    if (!contextMenu) return;
    
    sendMessage('delete-message-for-everyone', {
      messageId: contextMenu.message._id
    });
    
    // Remove from local state immediately
    setMessages(prev => prev.filter(msg => msg._id !== contextMenu.message._id));
    setContextMenu(null);
  };

  const handleClearAllChat = () => {
    if (window.confirm('Clear all messages for you? (Others will still see them)')) {
      sendMessage('clear-all-chat-for-me', {});
      setMessages([]);
    }
  };

  const handleToggleSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedMessages.length === 0) return;
    
    // Check if user can delete all selected messages
    const canDeleteAll = selectedMessages.every(msgId => {
      const msg = messages.find(m => m._id === msgId);
      return msg && (msg.isOwn || isOwner);
    });
    
    if (!canDeleteAll) {
      alert('You can only delete your own messages. Owner can delete any message.');
      return;
    }
    
    if (window.confirm(`Delete ${selectedMessages.length} message(s) for everyone?`)) {
      selectedMessages.forEach(messageId => {
        sendMessage('delete-message-for-everyone', { messageId });
      });
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg._id)));
      setSelectedMessages([]);
      setSelectionMode(false);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Message copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy message');
    });
    setHoveredMessage(null);
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.message);
    setHoveredMessage(null);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingMessage) return;
    
    sendMessage('edit-message', {
      messageId: editingMessage._id,
      newMessage: editText
    });
    
    // Update local state
    setMessages(prev => prev.map(msg => 
      msg._id === editingMessage._id ? { ...msg, message: editText, edited: true } : msg
    ));
    
    setEditingMessage(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleSelectMessage = (msg) => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    handleToggleSelection(msg._id);
    setHoveredMessage(null);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading study room...</div>
      </div>
    );
  }

  if (error && !studyRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/studyrooms')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Study Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative font-sans bg-gray-50">
      {/* Chat Section */}
      <div className={`${showWhiteboard ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 h-screen bg-white flex-col border-r border-gray-300`}>
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <i className="ri-door-open-line"></i>
                {studyRoom.name}
              </h2>
              <p className="text-indigo-100 text-sm">
                Code: <span className="font-mono font-bold">{studyRoom.code}</span>
              </p>
            </div>
            <button 
              onClick={() => navigate('/studyrooms')}
              className="text-white hover:text-indigo-200"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowParticipants(true)}
              className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded text-white text-sm hover:bg-opacity-30"
            >
              <i className="ri-group-line"></i>
              {studyRoom.participants?.length || 0} members
            </button>
            <button
              onClick={() => setShowFiles(true)}
              className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded text-white text-sm hover:bg-opacity-30"
            >
              <i className="ri-folder-line"></i>
              {files.length} files
            </button>
            <button
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded text-white text-sm hover:bg-opacity-30"
            >
              <i className={`${showWhiteboard ? 'ri-chat-3-line' : 'ri-pencil-ruler-2-line'}`}></i>
              {showWhiteboard ? 'Chat' : 'Whiteboard'}
            </button>
            <button
              onClick={handleClearAllChat}
              className="flex items-center gap-1 bg-orange-500 bg-opacity-80 px-3 py-1 rounded text-white text-sm hover:bg-opacity-100"
              title="Clear all messages for me only"
            >
              <i className="ri-delete-bin-line"></i>
              Clear for Me
            </button>
            {isOwner && (
              <button
                onClick={handleDeleteRoom}
                className="flex items-center gap-1 bg-red-500 bg-opacity-80 px-3 py-1 rounded text-white text-sm hover:bg-opacity-100"
              >
                <i className="ri-delete-bin-line"></i>
                Delete Room
              </button>
            )}
            {!isOwner && (
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-1 bg-yellow-500 bg-opacity-80 px-3 py-1 rounded text-white text-sm hover:bg-opacity-100"
              >
                <i className="ri-logout-box-line"></i>
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Selection Mode Bar */}
        {selectionMode && (
          <div className="bg-yellow-100 border-b border-yellow-300 p-3 flex justify-between items-center">
            <span className="text-sm font-medium text-yellow-800">
              {selectedMessages.length} message(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedMessages.length === 0}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              >
                <i className="ri-delete-bin-line"></i> Delete Selected
              </button>
              <button
                onClick={handleCancelSelection}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50" onClick={() => { setContextMenu(null); setHoveredMessage(null); }}>
          {messages.map((msg) => {
            const isAI = msg.user?.email === 'ai@example.com';
            const isSelected = selectedMessages.includes(msg._id);
            const isHovered = hoveredMessage === msg._id;
            const canEdit = msg.isOwn && !isAI;
            
            return (
              <div
                key={msg._id || msg.id}
                className={`flex flex-col ${msg.isOwn ? 'items-end text-right' : 'items-start'} relative group`}
                onMouseEnter={() => setHoveredMessage(msg._id)}
                onMouseLeave={() => setHoveredMessage(null)}
                onContextMenu={(e) => handleMessageRightClick(e, msg)}
              >
                {/* Selection Checkbox */}
                {(selectionMode || isSelected) && !isAI && (
                  <div className={`absolute ${msg.isOwn ? 'right-0' : 'left-0'} top-0 z-10`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelection(msg._id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                )}

                <span className={`text-xs font-medium ${
                  isAI ? 'text-blue-600' : 'text-gray-600'
                } flex items-center gap-1`}>
                  {isAI && <i className="ri-robot-line"></i>}
                  {msg.user?.name || msg.user?.email || msg.sender?.name || msg.sender?.email || 'Unknown'}
                  {msg.edited && <span className="text-gray-400 italic">(edited)</span>}
                </span>

                <div className="relative">
                  {/* Dropdown Menu on Hover */}
                  {isHovered && !isAI && !selectionMode && (
                    <div className={`absolute ${msg.isOwn ? 'right-0' : 'left-0'} top-0 -mt-8 bg-white shadow-lg rounded-lg border border-gray-200 z-20 flex gap-1 p-1`}>
                      <button
                        onClick={() => handleSelectMessage(msg)}
                        className="px-2 py-1 hover:bg-gray-100 rounded text-xs flex items-center gap-1"
                        title="Select"
                      >
                        <i className="ri-checkbox-line"></i> Select
                      </button>
                      <button
                        onClick={() => handleCopyMessage(msg.message)}
                        className="px-2 py-1 hover:bg-gray-100 rounded text-xs flex items-center gap-1"
                        title="Copy"
                      >
                        <i className="ri-file-copy-line"></i> Copy
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleEditMessage(msg)}
                          className="px-2 py-1 hover:bg-gray-100 rounded text-xs flex items-center gap-1"
                          title="Edit"
                        >
                          <i className="ri-edit-line"></i> Edit
                        </button>
                      )}
                      {(msg.isOwn || isOwner) && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this message for everyone?')) {
                              sendMessage('delete-message-for-everyone', { messageId: msg._id });
                              setMessages(prev => prev.filter(m => m._id !== msg._id));
                              setHoveredMessage(null);
                            }
                          }}
                          className="px-2 py-1 hover:bg-red-100 text-red-600 rounded text-xs flex items-center gap-1"
                          title={msg.isOwn ? "Delete" : "Delete (Owner)"}
                        >
                          <i className="ri-delete-bin-line"></i> {msg.isOwn ? 'Delete' : 'Remove'}
                        </button>
                      )}
                    </div>
                  )}

                  <div
                    className={`px-4 py-2.5 rounded-2xl min-w-[100px] max-w-[75%] md:max-w-[65%] text-sm shadow-sm break-words ${
                      isSelected ? 'ring-2 ring-yellow-400' : ''
                    } ${
                      isAI 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
                        : msg.isOwn 
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                  {isAI ? (
                    <Markdown
                      options={{
                        wrapper: 'div',
                        forceWrapper: true,
                        overrides: {
                          p: { props: { style: { margin: '0.5em 0', color: '#1e40af', wordBreak: 'break-word' } } },
                          code: {
                            props: {
                              style: {
                                backgroundColor: '#dbeafe',
                                color: '#1e3a8a',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                                wordBreak: 'break-all'
                              }
                            }
                          },
                          pre: {
                            props: {
                              style: {
                                backgroundColor: '#1e293b',
                                color: '#e2e8f0',
                                padding: '8px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                fontSize: '0.8em',
                                maxWidth: '100%'
                              }
                            }
                          }
                        }
                      }}
                    >
                      {msg.message}
                    </Markdown>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {msg.message}
                    </div>
                  )}
                  <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                    msg.isOwn ? 'text-indigo-100' : 'text-gray-400'
                  }`}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.edited && (
                      <span className="italic opacity-75">• edited</span>
                    )}
                  </div>
                </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Context Menu for Message Actions */}
        {contextMenu && (
          <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDeleteForMe}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <i className="ri-delete-bin-6-line text-gray-600"></i>
              Delete for me
            </button>
            {contextMenu.message.isOwn && (
              <button
                onClick={handleDeleteForEveryone}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <i className="ri-delete-bin-line"></i>
                Delete for everyone
              </button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="bg-white p-4 border-t">
          {/* Edit Mode */}
          {editingMessage && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  <i className="ri-edit-line"></i> Editing message
                </span>
                <button
                  onClick={handleCancelEdit}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="w-full p-2 border border-blue-300 rounded mb-2"
                placeholder="Edit your message..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile || editingMessage}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:bg-gray-50"
              title="Upload file"
            >
              <i className={`ri-attachment-line text-xl ${uploadingFile ? 'animate-spin' : ''}`}></i>
            </button>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              type="text"
              placeholder="Type your message... (Use @ai for AI help)"
              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={editingMessage}
            />
            <button
              onClick={handleSendMessage}
              disabled={editingMessage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
          {newMessage.includes('@ai') && !editingMessage && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <i className="ri-robot-line"></i>
              <span>AI will respond to your message</span>
            </div>
          )}
        </div>
      </div>

      {/* Whiteboard Panel */}
      <div className={`${showWhiteboard ? 'flex' : 'hidden md:flex'} flex-1 bg-gray-100`}>
        {showWhiteboard && studyRoom ? (
          <Whiteboard 
            projectId={studyRoom._id} 
            isVisible={showWhiteboard}
            onClose={() => setShowWhiteboard(false)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <i className="ri-pencil-ruler-2-line text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 text-lg">Click "Whiteboard" to start collaborating</p>
            </div>
          </div>
        )}
      </div>

      {/* Participants Modal */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b bg-indigo-600 text-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <i className="ri-group-line"></i>
                  Participants ({studyRoom.participants?.length || 0})
                </h2>
                <button onClick={() => setShowParticipants(false)}>
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <div className="overflow-y-auto max-h-96">
                {studyRoom.participants?.map((participant) => (
                  <div key={participant.user._id} className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-indigo-600"></i>
                      </div>
                      <div>
                        <p className="font-medium">{participant.user.email}</p>
                        {participant.user._id === studyRoom.owner._id && (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <i className="ri-vip-crown-line"></i>
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwner && participant.user._id !== studyRoom.owner._id && (
                      <button
                        onClick={() => handleKickUser(participant.user._id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files Modal */}
      <AnimatePresence>
        {showFiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => {
              setShowFiles(false);
              setFileDeleteMenu(null);
            }}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b bg-indigo-600 text-white flex-shrink-0">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <i className="ri-folder-line"></i>
                  Shared Files ({files.length})
                </h2>
                <button onClick={() => setShowFiles(false)} className="hover:bg-indigo-700 rounded p-1">
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {files.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <i className="ri-inbox-line text-6xl mb-4"></i>
                    <p>No files shared yet</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div key={file.filename} className="flex items-center gap-2 px-3 py-2 border-b hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium flex items-center gap-2 truncate text-sm">
                          <i className="ri-file-line text-indigo-600 flex-shrink-0 text-base"></i>
                          <span className="truncate">{file.originalName}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.uploadedBy?.email?.split('@')[0]}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleDownloadFile(file.filename, file.originalName)}
                          className="px-2.5 py-1.5 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition"
                          title="Download"
                        >
                          <i className="ri-download-line"></i>
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFileDeleteMenu(fileDeleteMenu === file.filename ? null : file.filename);
                            }}
                            className="px-2 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition flex items-center gap-0.5"
                            title="Delete options"
                          >
                            <i className="ri-delete-bin-line"></i>
                            <i className="ri-arrow-down-s-line text-xs"></i>
                          </button>
                          {fileDeleteMenu === file.filename && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-xl z-[60] w-[160px] overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file.filename, false);
                                  setFileDeleteMenu(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 flex items-center gap-1.5 transition"
                              >
                                <i className="ri-eye-off-line text-gray-600 text-sm"></i>
                                <span>Delete for me</span>
                              </button>
                              {(isOwner || file.uploadedBy._id === user._id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this file for everyone?')) {
                                      handleDeleteFile(file.filename, true);
                                    }
                                    setFileDeleteMenu(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-50 flex items-center gap-1.5 text-red-600 border-t transition"
                                >
                                  <i className="ri-delete-bin-line text-sm"></i>
                                  <span>Delete for everyone</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyRoom;


