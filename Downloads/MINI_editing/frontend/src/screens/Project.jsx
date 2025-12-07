import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/axios';
import 'remixicon/fonts/remixicon.css';
import { intializeSocket, recieveMessage, sendMessage } from '../config/socket';
import { useUser } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import Whiteboard from '../components/Whiteboard';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const { user, setUser } = useUser();
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const socketInitialized = useRef(false);

  // File upload states
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Moderation states
  const [moderationWarning, setModerationWarning] = useState(null);

  // Message management states
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');

  // Load messages from database on mount
  useEffect(() => {
    if (project?._id) {
      fetchMessages();
    }
  }, [project?._id]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${project._id}`);
      setMessages(response.data.messages.map(msg => ({
        ...msg,
        id: msg._id,
        user: msg.isAI ? { email: 'ai@example.com', name: 'AI' } : msg.sender,
        sender: msg.sender._id || msg.sender,
        isOwn: msg.isAI ? false : (msg.sender._id === user?._id || msg.sender === user?._id)
      })));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    // Initialize socket when project is available (only once)
    if (project?._id && !socketInitialized.current) {
      intializeSocket(project._id);
      socketInitialized.current = true;

      // Set up message listener - receive ALL messages
      recieveMessage('project-message', (data) => {
        console.log('Received message:', data);
        const isOwnMessage = data.sender === user?._id && data.sender !== 'ai';
        setMessages(prev => {
          // Check if message already exists (by timestamp + sender)
          const exists = prev.some(msg => 
            msg.timestamp === data.timestamp && 
            (msg.sender === data.sender || msg.user?._id === data.user?._id)
          );
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          return [...prev, { 
            ...data, 
            isOwn: isOwnMessage, 
            id: Date.now() + Math.random() 
          }];
        });
      });

      // Listen for moderation warnings
      recieveMessage('moderation-warning', (data) => {
        console.log('Moderation warning:', data);
        setModerationWarning(data);
        
        // Auto-hide warning after 5 seconds
        setTimeout(() => {
          setModerationWarning(null);
        }, 5000);

        // If removed, redirect to home
        if (data.removed) {
          setTimeout(() => {
            alert('You have been removed from this project due to inappropriate content.');
            navigate('/');
          }, 2000);
        }
      });

      // Listen for permanent ban
      recieveMessage('permanently-banned', (data) => {
        alert(`🚫 ${data.message}\n\nYou cannot rejoin this project.`);
        navigate('/');
      });

      // Listen for user removed (refresh for other participants)
      recieveMessage('user-removed', (data) => {
        fetchProject(); // Refresh project details and participant list
      });

      // Listen for user removed (by owner)
      recieveMessage('user-removed', (data) => {
        console.log('User removed:', data);
        if (data.userId === user?._id) {
          alert(`You have been removed from this project. Reason: ${data.reason}`);
          navigate('/');
        }
        // Refresh project data to update participant list
        fetchProject();
      });

      // Listen for participant updates
      recieveMessage('room-participants-update', (data) => {
        console.log('Participant update:', data);
      });

      // Listen for user joined
      recieveMessage('user-joined', (data) => {
        console.log('User joined:', data);
      });

      // Listen for user left
      recieveMessage('user-left', (data) => {
        console.log('User left:', data);
      });

      // Listen for message deletion
      recieveMessage('message-deleted-for-me', (data) => {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });

      recieveMessage('message-deleted-for-everyone', (data) => {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      });

      recieveMessage('all-chat-cleared-for-me', () => {
        setMessages([]);
      });

      // Listen for message edits
      recieveMessage('message-edited', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, message: data.newMessage, edited: true } 
            : msg
        ));
      });
    }
  }, [project, user]);

  useEffect(() => {
    // Fetch all users for project management
    const fetchAllUsers = async () => {
      try {
        const response = await api.get('/users/all');
        setAllUsers(response.data.allUsers || []);
      } catch (err) {
        setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Validate authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) return navigate('/login');
    if (userData) setUser(JSON.parse(userData));

    // Load project data
    if (id) {
      fetchProject();
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProject = async () => {
    // Fetch project details
    try {
      const response = await api.get(`/project/get-project/${id}`);
      setProject(response.data.project);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError('Failed to fetch project: ' + errorMsg);
      
      // Handle removed/banned users
      if (err.response?.data?.removed) {
        alert('🚫 You have been permanently removed from this project and cannot access it.');
        navigate('/home');
        return;
      }
      
      if (err.response?.status === 403 || err.response?.status === 404) {
        setTimeout(() => navigate('/home'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      sender: user?._id,
      projectId: project?._id,
      timestamp: new Date().toISOString(),
      user: user
    };

    // Send to server (server will broadcast to ALL users including sender)
    sendMessage('project-message', messageData);

    // Clear input immediately for better UX
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Message deletion functions
  const handleDeleteMessageForMe = (messageId) => {
    sendMessage('delete-message-for-me', { messageId });
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    setShowMessageMenu(null);
  };

  const handleDeleteMessageForEveryone = (messageId) => {
    if (!confirm('Delete this message for everyone?')) return;
    sendMessage('delete-message-for-everyone', { messageId });
    setShowMessageMenu(null);
  };

  const handleClearAllChat = () => {
    if (!confirm('Clear all messages for you? (Others will still see them)')) return;
    sendMessage('clear-all-chat-for-me');
    setMessages([]);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectMessage = (msg) => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    toggleMessageSelection(msg._id);
    setHoveredMessage(null);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
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

  const handleDeleteSelected = () => {
    if (selectedMessages.length === 0) {
      alert('No messages selected');
      return;
    }
    
    // Check if user can delete all selected messages
    const canDeleteAll = selectedMessages.every(msgId => {
      const msg = messages.find(m => m._id === msgId);
      return msg && (msg.isOwn || isOwner());
    });
    
    if (!canDeleteAll) {
      alert('You can only delete your own messages. Owner can delete any message.');
      return;
    }
    
    if (!confirm(`Delete ${selectedMessages.length} selected message(s) for everyone?`)) return;
    
    selectedMessages.forEach(messageId => {
      sendMessage('delete-message-for-everyone', { messageId });
    });
    
    setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg._id)));
    setSelectedMessages([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddCollaborators = async () => {
    if (selectedUserIds.length === 0) {
      setError('Please select at least one user to add');
      return;
    }

    try {
      const response = await api.put('/project/add-user', {
        projectId: id,
        users: selectedUserIds
      });

      // Update the project with new collaborators
      setProject(response.data.project);
      setSelectedUserIds([]);
      setShowUserModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add collaborators');
    }
  };

  // File operations
  const fetchFiles = async () => {
    try {
      const response = await api.get(`/files/list/${id}`);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  useEffect(() => {
    if (project?._id) {
      fetchFiles();
    }
  }, [project]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      setError('');
      
      const response = await api.post(`/files/upload/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFiles(prev => [...prev, response.data.file]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileDownload = async (filename, originalName) => {
    try {
      const response = await api.get(`/files/download/${id}/${filename}`, {
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
      setError(err.response?.data?.error || 'Failed to download file');
    }
  };

  const handleFileDelete = async (filename) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.delete(`/files/delete/${id}/${filename}`);
      setFiles(prev => prev.filter(f => f.filename !== filename));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete file');
    }
  };

  // Owner controls
  const handleRemoveUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user from the project?')) return;

    try {
      const response = await api.post('/project/remove-user', {
        projectId: id,
        userId: userId
      });

      setProject(response.data.project);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove user');
    }
  };

  const handleLeaveProject = async () => {
    if (!confirm('Are you sure you want to leave this project?')) return;

    try {
      await api.post('/project/leave', { projectId: id });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave project');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone!')) return;

    try {
      await api.delete(`/project/${id}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const isOwner = () => {
    return project?.owner?._id === user?._id || project?.owner === user?._id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative font-sans">

      {/* 💬 Chat Section */}
      <div className={`${showWhiteboard ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 h-screen bg-[#f7f2f2] flex-col border-r border-gray-300`}>
        {/* Top Bar */}
        <div className="bg-[#9e7676] p-4 flex justify-between items-center flex-wrap gap-2 flex-shrink-0">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button onClick={() => navigate('/')} className="bg-white bg-opacity-20 px-3 py-2 rounded hover:bg-opacity-30 transition">
              <i className="ri-home-line text-black text-xl"></i>
            </button>
            
            <button onClick={() => setShowUserModal(true)}>
              <i className="ri-user-add-line text-black text-xl cursor-pointer hover:text-white"></i>
            </button>

            {/* Collaborator Count Badge */}
            {project && (
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  {project.users?.length || 0} user{project.users?.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Project Code Display */}
            {project?.isPrivate && project?.code && (
              <div className="bg-yellow-400 bg-opacity-80 px-3 py-1 rounded font-mono font-bold text-sm">
                Code: {project.code}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="flex items-center space-x-1 bg-white bg-opacity-20 px-3 py-2 rounded hover:bg-opacity-30 transition disabled:opacity-50"
              title="Upload File"
            >
              <i className="ri-upload-cloud-line text-black text-xl"></i>
              <span className="text-sm text-black hidden sm:inline">Upload</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Whiteboard Toggle */}
            <button 
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className="flex items-center space-x-1 bg-white bg-opacity-20 px-3 py-2 rounded hover:bg-opacity-30 transition"
              title={showWhiteboard ? 'Hide Whiteboard' : 'Show Whiteboard'}
            >
              <i className={`${showWhiteboard ? 'ri-chat-3-line' : 'ri-pencil-ruler-2-line'} text-black text-xl`}></i>
              <span className="text-sm text-black hidden sm:inline">{showWhiteboard ? 'Chat' : 'Board'}</span>
            </button>

            {/* Owner Controls */}
            {isOwner() ? (
              <button
                onClick={handleDeleteProject}
                className="flex items-center space-x-1 bg-red-500 bg-opacity-80 px-3 py-2 rounded hover:bg-opacity-100 transition"
                title="Delete Project"
              >
                <i className="ri-delete-bin-line text-white text-xl"></i>
              </button>
            ) : (
              <button
                onClick={handleLeaveProject}
                className="flex items-center space-x-1 bg-orange-500 bg-opacity-80 px-3 py-2 rounded hover:bg-opacity-100 transition"
                title="Leave Project"
              >
                <i className="ri-logout-box-line text-white text-xl"></i>
              </button>
            )}
          </div>
        </div>

        {/* Moderation Warning */}
        {moderationWarning && (
          <div className="bg-red-500 text-white px-4 py-2 text-sm">
            {moderationWarning.message}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
            {error}
          </div>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <div className="bg-gray-100 border-b border-gray-300 p-3 max-h-32 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-600 mb-2">Shared Files:</div>
            <div className="space-y-1">
              {files.map((file) => (
                <div key={file.filename} className="flex items-center justify-between bg-white p-2 rounded shadow-sm text-xs">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <i className="ri-file-line text-gray-600"></i>
                    <span className="truncate">{file.originalName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleFileDownload(file.filename, file.originalName)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download"
                    >
                      <i className="ri-download-line"></i>
                    </button>
                    {(isOwner() || file.uploadedBy === user?._id) && (
                      <button
                        onClick={() => handleFileDelete(file.filename)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Info Bar */}
        <div className="bg-gray-200 p-2 border-b border-gray-300">
          <div className="text-sm font-semibold text-gray-700 truncate">
            {project?.name || 'Untitled Project'}
          </div>
          <div className="text-xs text-gray-600">
            {project?.isPrivate ? '🔒 Private Project' : '🌐 Public Project'}
          </div>
        </div>

        {/* Message Actions Bar */}
        {(selectedMessages.length > 0 || true) && (
          <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedMessages.length > 0 && (
                <>
                  <span className="text-sm font-medium">{selectedMessages.length} selected</span>
                  <button
                    onClick={handleDeleteSelected}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded bg-red-50 hover:bg-red-100"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedMessages([])}
                    className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleClearAllChat}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 rounded hover:bg-gray-300"
            >
              <i className="ri-delete-bin-2-line mr-1"></i>
              Clear All
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => {
            const isAI = msg.user?.email === 'ai@example.com';
            const isSelected = selectedMessages.includes(msg._id);
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isOwn ? 'items-end text-right' : 'items-start'} group relative`}
              >
                <span className={`text-xs font-medium ${isAI ? 'text-blue-600' : 'text-gray-600'} flex items-center gap-1`}>
                  {isAI && <i className="ri-robot-line"></i>}
                  {msg.user?.email || 'Unknown'}
                </span>
                <div className="relative flex items-center gap-2">
                  {/* Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMessageSelection(msg._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  />
                  
                  <div
                    className={`px-4 py-2.5 rounded-2xl min-w-[100px] max-w-[75%] md:max-w-[65%] text-sm shadow-sm break-words ${
                      isSelected ? 'ring-2 ring-yellow-400' : ''
                    } ${
                      isAI 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
                        : msg.isOwn 
                          ? 'bg-gradient-to-br from-purple-400 to-purple-500 text-white' 
                          : 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                    }`}
                  >
                  {/* Check if message is from AI and render as markdown */}
                  {isAI ? (
                    <Markdown
                      options={{
                        wrapper: 'div',
                        forceWrapper: true,
                        overrides: {
                          p: {
                            props: {
                              style: { margin: '0.5em 0', color: '#1e40af' }
                            }
                          },
                          code: {
                            props: {
                              style: {
                                backgroundColor: '#dbeafe',
                                color: '#1e3a8a',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.9em',
                                fontFamily: 'monospace'
                              }
                            }
                          },
                          pre: {
                            props: {
                              style: {
                                backgroundColor: '#1e293b',
                                color: '#e2e8f0',
                                padding: '12px',
                                borderRadius: '6px',
                                overflow: 'auto',
                                fontSize: '0.85em',
                                fontFamily: 'monospace'
                              }
                            }
                          },
                          h1: {
                            props: {
                              style: { fontSize: '1.2em', fontWeight: 'bold', margin: '0.5em 0', color: '#1e40af' }
                            }
                          },
                          h2: {
                            props: {
                              style: { fontSize: '1.1em', fontWeight: 'bold', margin: '0.4em 0', color: '#1e40af' }
                            }
                          },
                          h3: {
                            props: {
                              style: { fontSize: '1em', fontWeight: 'bold', margin: '0.3em 0', color: '#1e40af' }
                            }
                          }
                        }
                      }}
                    >
                      {msg.message}
                    </Markdown>
                  ) : (
                    msg.message
                  )}
                  <div className="text-[10px] text-gray-500 mt-1">{formatTime(msg.timestamp)}</div>
                  </div>

                  {/* Delete button */}
                  {(msg.isOwn || isOwner()) && !isAI && (
                    <button
                      onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-800"
                    >
                      <i className="ri-more-2-fill"></i>
                    </button>
                  )}

                  {/* Message menu */}
                  {showMessageMenu === msg._id && (
                    <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-1 z-10 w-48">
                      <button
                        onClick={() => handleDeleteMessageForMe(msg._id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete for me
                      </button>
                      {(msg.isOwn || isOwner()) && (
                        <button
                          onClick={() => handleDeleteMessageForEveryone(msg._id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                        >
                          <i className="ri-delete-bin-2-line mr-2"></i>
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="bg-[#d1d1d1] p-4 border-t">
          <div className="flex items-center gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              type="text"
              placeholder="Type your message... (Use @ai for AI help)"
              className="flex-1 p-2 rounded-md border border-gray-400 bg-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-[#9e7676] text-white rounded-md hover:bg-[#825f5f] transition-colors"
            >
              Send
            </button>
          </div>
          {newMessage.includes('@ai') && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <i className="ri-robot-line"></i>
              <span>AI will respond to your message</span>
            </div>
          )}
        </div>
      </div>

      {/* Whiteboard or Placeholder Panel */}
      <div className={`${showWhiteboard ? 'flex' : 'hidden md:flex'} flex-1 bg-[#e4e5e7]`}>
        {showWhiteboard && project ? (
          <Whiteboard 
            projectId={project._id} 
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

      {/* 👥 Multi-User Selection Modal */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
          >
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Manage Participants</h2>
                <button onClick={() => setShowUserModal(false)}>
                  <i className="ri-close-line text-xl text-gray-600 hover:text-black"></i>
                </button>
              </div>

              {/* Current Participants Section */}
              <div className="border-b">
                <div className="px-4 py-3 bg-gray-50 font-semibold text-sm">
                  Current Participants ({project?.users?.length || 0})
                </div>
                <div className="max-h-48 overflow-y-auto divide-y">
                  {project?.users?.map((participant) => {
                    const participantId = (participant._id || participant).toString();
                    const ownerId = (project?.owner?._id || project?.owner).toString();
                    const isProjectOwner = participantId === ownerId;
                    return (
                      <div
                        key={participantId}
                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                            {(participant.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{participant.email || 'Unknown'}</div>
                            {isProjectOwner && (
                              <span className="text-xs text-indigo-600 font-semibold">Owner</span>
                            )}
                          </div>
                        </div>
                        {isOwner() && !isProjectOwner && (
                          <button
                            onClick={() => handleRemoveUser(participantId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Collaborators Section */}
              <div className="px-4 py-3 bg-gray-50 font-semibold text-sm border-b">
                Add New Collaborators
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="text-red-700 text-sm">{error}</div>
                </div>
              )}

              {/* User List */}
              <div className="max-h-60 overflow-y-auto divide-y">
                {allUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users available to add
                  </div>
                ) : (
                  allUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleUserSelection(u._id)}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 ${
                          isSelected ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{u.email}</p>
                          <p className="text-xs text-gray-500">Available to add</p>
                        </div>
                        <input
                          type="checkbox"
                          readOnly
                          checked={isSelected}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Confirm Button */}
              <div className="p-4 border-t flex justify-between">
                <div className="text-sm text-gray-600">
                  {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCollaborators}
                    disabled={selectedUserIds.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Collaborators
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Project;
