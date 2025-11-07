import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import 'remixicon/fonts/remixicon.css';

const StudyRoomList = () => {
  const [publicRooms, setPublicRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('public'); // 'public' or 'my-rooms'
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudyRooms();
  }, []);

  const fetchStudyRooms = async () => {
    try {
      setLoading(true);
      const [publicResponse, myResponse] = await Promise.all([
        api.get('/studyroom/public'),
        api.get('/studyroom/my-rooms')
      ]);
      
      setPublicRooms(publicResponse.data.studyRooms || []);
      setMyRooms(myResponse.data.studyRooms || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch study rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/studyroom/${roomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading study rooms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <i className="ri-group-line text-indigo-600"></i>
                Study Rooms
              </h1>
              <p className="text-gray-600 mt-1">Collaborate, learn, and share knowledge together</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition flex items-center gap-2"
              >
                <i className="ri-home-line"></i>
                Home
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <i className="ri-login-box-line"></i>
                Join Private Room
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <i className="ri-add-circle-line"></i>
                Create Room
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'public'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="ri-earth-line mr-2"></i>
              Public Rooms ({publicRooms.length})
            </button>
            <button
              onClick={() => setActiveTab('my-rooms')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                activeTab === 'my-rooms'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="ri-user-line mr-2"></i>
              My Rooms ({myRooms.length})
            </button>
          </div>

          {/* Rooms List */}
          <div className="p-6">
            {activeTab === 'public' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicRooms.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <i className="ri-inbox-line text-6xl mb-4"></i>
                    <p>No public study rooms available</p>
                  </div>
                ) : (
                  publicRooms.map((room) => (
                    <div
                      key={room._id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleJoinRoom(room._id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <i className="ri-door-open-line text-indigo-600"></i>
                          {room.name}
                        </h3>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          Public
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <i className="ri-user-star-line text-yellow-500"></i>
                          Owner: {room.owner?.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <i className="ri-group-line text-blue-500"></i>
                          {room.participants?.length || 0} participant(s)
                        </p>
                        <p className="flex items-center gap-2">
                          <i className="ri-key-2-line text-gray-500"></i>
                          Code: <span className="font-mono font-bold">{room.code}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'my-rooms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRooms.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <i className="ri-inbox-line text-6xl mb-4"></i>
                    <p>You haven't joined any study rooms yet</p>
                  </div>
                ) : (
                  myRooms.map((room) => {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const isOwner = room.owner?._id === user._id;
                    
                    return (
                      <div
                        key={room._id}
                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-lg transition cursor-pointer"
                        onClick={() => handleJoinRoom(room._id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i className={`${isOwner ? 'ri-shield-star-line text-yellow-500' : 'ri-door-open-line text-indigo-600'}`}></i>
                            {room.name}
                          </h3>
                          <span className={`${room.isPrivate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-xs px-2 py-1 rounded`}>
                            {room.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          {isOwner && (
                            <p className="flex items-center gap-2 text-yellow-600 font-semibold">
                              <i className="ri-vip-crown-line"></i>
                              You are the owner
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <i className="ri-user-star-line text-yellow-500"></i>
                            Owner: {room.owner?.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="ri-group-line text-blue-500"></i>
                            {room.participants?.length || 0} participant(s)
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="ri-key-2-line text-gray-500"></i>
                            Code: <span className="font-mono font-bold">{room.code}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchStudyRooms();
          }}
        />
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={(roomId) => {
            setShowJoinModal(false);
            navigate(`/studyroom/${roomId}`);
          }}
        />
      )}
    </div>
  );
};

// Create Room Modal Component
const CreateRoomModal = ({ onClose, onSuccess }) => {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/studyroom/create', {
        name: roomName,
        isPrivate
      });

      alert(`Room created successfully! Room code: ${response.data.studyRoom.code}`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-add-circle-line text-indigo-600"></i>
          Create Study Room
        </h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter room name"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-indigo-600"
                disabled={loading}
              />
              <span className="text-gray-700">Make this room private</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-6">
              Private rooms require a code to join
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Join Room Modal Component
const JoinRoomModal = ({ onClose, onSuccess }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Room code is required');
      return;
    }

    if (roomCode.length !== 6) {
      setError('Room code must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/studyroom/join', {
        code: roomCode
      });

      onSuccess(response.data.studyRoom._id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <i className="ri-login-box-line text-green-600"></i>
          Join Private Room
        </h2>
        <p className="text-gray-600 text-sm mb-4">Enter the 6-digit code to join a private study room</p>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">6-Digit Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyRoomList;
