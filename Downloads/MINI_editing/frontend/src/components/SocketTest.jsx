// import { useState, useEffect } from 'react';
// import { 
//   intializeSocket, 
//   sendMessage, 
//   recieveMessage, 
//   checkUserStatus, 
//   getActiveUsers, 
//   isConnected, 
//   getSocketId,
//   disconnectSocket 
// } from '../config/socket';

// const SocketTest = ({ projectId }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [activeUsers, setActiveUsers] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState(false);
//   const [socketId, setSocketId] = useState(null);
//   const [userToCheck, setUserToCheck] = useState('');

//   useEffect(() => {
//     // Checkpoint: Initialize socket testing
//     if (projectId) {
//       // Initialize socket
//       intializeSocket(projectId);

//       // Set up message listener
//       recieveMessage('project-message', (data) => {
//         setMessages(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
//       });

//       // Set up active users listener
//       recieveMessage('active-users', (users) => {
//         setActiveUsers(users);
//       });

//       // Set up user status listener
//       recieveMessage('user-status', (data) => {
//         alert(`User ${data.userId} is ${data.isConnected ? 'connected' : 'disconnected'}`);
//       });

//       // Update connection status and socket ID
//       const updateStatus = () => {
//         setConnectionStatus(isConnected());
//         setSocketId(getSocketId());
//       };

//       updateStatus();
//       const interval = setInterval(updateStatus, 2000);

//       return () => clearInterval(interval);
//     }
//   }, [projectId]);

//   const handleSendMessage = () => {
//     if (!newMessage.trim()) return;

//     const messageData = {
//       message: newMessage,
//       sender: 'test-user',
//       timestamp: new Date().toISOString(),
//       user: { email: 'test@example.com', name: 'Test User' }
//     };

//     console.log('🧪 Test sending message:', messageData);
//     sendMessage('project-message', messageData);
//     setNewMessage('');
//   };

//   const handleCheckUserStatus = () => {
//     if (!userToCheck.trim()) {
//       alert('Please enter a user ID to check');
//       return;
//     }
//     console.log('🧪 Test checking user status for:', userToCheck);
//     checkUserStatus(userToCheck);
//   };

//   const handleGetActiveUsers = () => {
//     console.log('🧪 Test requesting active users');
//     getActiveUsers();
//   };

//   const handleDisconnect = () => {
//     console.log('🧪 Test disconnecting socket');
//     disconnectSocket();
//     setConnectionStatus(false);
//     setSocketId(null);
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Socket.IO Test Component</h2>
      
//       {/* Connection Status */}
//       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//         <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center">
//             <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
//             <span className={connectionStatus ? 'text-green-600' : 'text-red-600'}>
//               {connectionStatus ? 'Connected' : 'Disconnected'}
//             </span>
//           </div>
//           {socketId && (
//             <span className="text-sm text-gray-600">Socket ID: {socketId}</span>
//           )}
//         </div>
//       </div>

//       {/* Active Users */}
//       <div className="mb-6 p-4 bg-blue-50 rounded-lg">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="text-lg font-semibold">Active Users ({activeUsers.length})</h3>
//           <button 
//             onClick={handleGetActiveUsers}
//             className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Refresh
//           </button>
//         </div>
//         <div className="space-y-2">
//           {activeUsers.map((user, index) => (
//             <div key={index} className="flex items-center text-sm">
//               <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//               <span>{user.email} (ID: {user.userId})</span>
//             </div>
//           ))}
//           {activeUsers.length === 0 && (
//             <p className="text-gray-600">No active users</p>
//           )}
//         </div>
//       </div>

//       {/* User Status Check */}
//       <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
//         <h3 className="text-lg font-semibold mb-2">Check User Status</h3>
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={userToCheck}
//             onChange={(e) => setUserToCheck(e.target.value)}
//             placeholder="Enter user ID to check"
//             className="flex-1 p-2 border border-gray-300 rounded"
//           />
//           <button 
//             onClick={handleCheckUserStatus}
//             className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//           >
//             Check Status
//           </button>
//         </div>
//       </div>

//       {/* Message Testing */}
//       <div className="mb-6 p-4 bg-green-50 rounded-lg">
//         <h3 className="text-lg font-semibold mb-2">Send Test Message</h3>
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Enter test message"
//             className="flex-1 p-2 border border-gray-300 rounded"
//             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//           />
//           <button 
//             onClick={handleSendMessage}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Send
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//         <h3 className="text-lg font-semibold mb-2">Messages ({messages.length})</h3>
//         <div className="max-h-40 overflow-y-auto space-y-2">
//           {messages.map((msg, index) => (
//             <div key={index} className="p-2 bg-white rounded border text-sm">
//               <div className="font-medium">{msg.user?.email || 'Unknown'}</div>
//               <div>{msg.message}</div>
//               <div className="text-xs text-gray-500">{msg.timestamp}</div>
//             </div>
//           ))}
//           {messages.length === 0 && (
//             <p className="text-gray-600">No messages yet</p>
//           )}
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="flex space-x-2">
//         <button 
//           onClick={handleDisconnect}
//           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           Disconnect
//         </button>
//         <button 
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//         >
//           Reload Page
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SocketTest;
