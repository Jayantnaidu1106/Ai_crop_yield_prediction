import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { intializeSocket, sendMessage, recieveMessage, getActiveUsers, isConnected } from '../config/socket';

const SocketTest = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [testProjectId, setTestProjectId] = useState('');
  const [socketInitialized, setSocketInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check connection status periodically
    const checkConnection = () => {
      setConnectionStatus(isConnected());
    };

    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleInitializeSocket = () => {
    if (!testProjectId.trim()) {
      alert('Please enter a project ID');
      return;
    }

    try {
      intializeSocket(testProjectId);
      setSocketInitialized(true);

      // Set up message listener
      recieveMessage('project-message', (data) => {
        setMessages(prev => [...prev, { ...data, isOwn: false, id: Date.now() }]);
      });

      // Set up active users listener
      recieveMessage('active-users', (users) => {
        setActiveUsers(users);
      });

      // Get active users
      setTimeout(() => {
        getActiveUsers();
      }, 1000);

    } catch (error) {
      alert('Error initializing socket: ' + error.message);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!socketInitialized) {
      alert('Please initialize socket first');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const messageData = {
      message: newMessage,
      sender: user._id,
      projectId: testProjectId,
      timestamp: new Date(),
      user: user
    };

    sendMessage('project-message', messageData);

    // Add to local messages for immediate display
    setMessages(prev => [...prev, {
      ...messageData,
      isOwn: true,
      id: Date.now()
    }]);

    setNewMessage('');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Socket.IO Connection Test</h1>
          
          {/* User Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current User</h2>
            <p><strong>Email:</strong> {user.email || 'Not logged in'}</p>
            <p><strong>User ID:</strong> {user._id || 'N/A'}</p>
          </div>

          {/* Connection Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={connectionStatus ? 'text-green-600' : 'text-red-600'}>
                  {connectionStatus ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Socket Initialized: {socketInitialized ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Socket Initialization */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Initialize Socket</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testProjectId}
                onChange={(e) => setTestProjectId(e.target.value)}
                placeholder="Enter project ID (or 'test' for testing)"
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button 
                onClick={handleInitializeSocket}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                disabled={socketInitialized}
              >
                {socketInitialized ? 'Initialized' : 'Initialize Socket'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Note: Use a valid MongoDB ObjectId for real projects, or 'test' for testing without project validation
            </p>
          </div>

          {/* Active Users */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Active Users ({activeUsers.length})</h2>
              <button 
                onClick={() => getActiveUsers()}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={!socketInitialized}
              >
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>{user.email} (ID: {user.userId})</span>
                </div>
              ))}
              {activeUsers.length === 0 && (
                <p className="text-gray-600">No active users</p>
              )}
            </div>
          </div>

          {/* Message Testing */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Send Test Message</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter test message"
                className="flex-1 p-2 border border-gray-300 rounded"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!socketInitialized}
              />
              <button 
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!socketInitialized}
              >
                Send
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Messages ({messages.length})</h2>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className={`p-3 rounded border text-sm ${msg.isOwn ? 'bg-blue-100 ml-8' : 'bg-white mr-8'}`}>
                  <div className="font-medium">{msg.user?.email || 'Unknown'}</div>
                  <div>{msg.message}</div>
                  <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-gray-600">No messages yet</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketTest;
