import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [showCodeDisplayModal, setShowCodeDisplayModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createdProjectCode, setCreatedProjectCode] = useState('');
  const [joiningProject, setJoiningProject] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchProjects();
    fetchPublicProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/project/all');
      console.log('Projects response:', response.data);
      setProjects(response.data.allUserProjects || []);
    } catch (err) {
      setError('Failed to fetch projects: ' + (err.response?.data?.error || err.message));
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicProjects = async () => {
    try {
      const response = await api.get('/project/public');
      console.log('Public projects response:', response.data);
      setPublicProjects(response.data.projects || []);
    } catch (err) {
      console.error('Error fetching public projects:', err);
    }
  };

  const handleNewProject = () => {
    setShowNameModal(true);
    setProjectName('');
    setIsPrivate(false);
    setError('');
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    try {
      setCreatingProject(true);
      setError('');

      const response = await api.post('/project/create', {
        name: projectName.trim(),
        isPrivate: isPrivate
      });

      console.log('New project created:', response.data);

      if (response.data.newProject && response.data.newProject._id) {
        setShowNameModal(false);
        
        // If private, show the code modal
        if (isPrivate && response.data.newProject.code) {
          setCreatedProjectCode(response.data.newProject.code);
          setShowCodeDisplayModal(true);
        } else {
          // If public, navigate directly
          navigate(`/project/${response.data.newProject._id}`);
        }
        
        // Refresh project lists
        fetchProjects();
        fetchPublicProjects();
      } else {
        setError('Failed to create project: Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating new project:', err);
      setError('Failed to create new project: ' + (err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message));
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCancelCreate = () => {
    setShowNameModal(false);
    setProjectName('');
    setIsPrivate(false);
    setError('');
  };

  const handleJoinByCode = () => {
    setShowJoinCodeModal(true);
    setJoinCode('');
    setError('');
  };

  const handleJoinCodeSubmit = async () => {
    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setJoiningProject(true);
      setError('');

      const response = await api.post('/project/join-by-code', {
        code: joinCode.trim()
      });

      console.log('Joined project:', response.data);

      if (response.data.project && response.data.project._id) {
        setShowJoinCodeModal(false);
        navigate(`/project/${response.data.project._id}`);
      }
    } catch (err) {
      console.error('Error joining project:', err);
      setError(err.response?.data?.error || 'Failed to join project');
    } finally {
      setJoiningProject(false);
    }
  };

  const handleJoinPublicProject = async (projectId) => {
    try {
      const response = await api.post(`/project/join/${projectId}`);
      console.log('Joined public project:', response.data);

      if (response.data.project && response.data.project._id) {
        navigate(`/project/${response.data.project._id}`);
      }
    } catch (err) {
      console.error('Error joining public project:', err);
      setError(err.response?.data?.error || 'Failed to join project');
    }
  };

  const handleCodeDisplayClose = () => {
    setShowCodeDisplayModal(false);
    // Navigate to the project after closing the modal
    const projectId = projects.find(p => p.code === createdProjectCode)?._id;
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.email || 'User'}
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Action Buttons */}
          <div className="mb-8 flex gap-4">
            <button
              onClick={handleNewProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
            >
              + New Project
            </button>
            <button
              onClick={handleJoinByCode}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
            >
              Join by Code
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Projects List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Projects
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Click on a project to view and edit it.
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No projects yet. Create your first project!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project._id}>
                    <div
                      onClick={() => handleProjectClick(project._id)}
                      className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-indigo-600 truncate">
                            {project.name || 'Untitled Project'}
                          </h4>
                          {/* <p className="text-sm text-gray-500 mt-1">
                            Project ID: {project._id}
                          </p> */}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">
                              {project.users?.length || 0}
                            </span>{' '}
                            collaborator{project.users?.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-indigo-600">
                            →
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Public Projects Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mt-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Public Projects
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Join any public project to collaborate.
              </p>
            </div>

            {publicProjects.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No public projects available.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {publicProjects
                  .filter((project) => {
                    // Don't show projects where user has been removed
                    const isRemoved = project.removedUsers?.some(
                      (removedUserId) => removedUserId === user?._id || removedUserId?._id === user?._id
                    );
                    return !isRemoved;
                  })
                  .map((project) => (
                  <li key={project._id}>
                    <div className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-green-600 truncate">
                            {project.name || 'Untitled Project'}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Owner: {project.owner?.email || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">
                              {project.users?.length || 0}
                            </span>{' '}
                            participant{project.users?.length !== 1 ? 's' : ''}
                          </div>
                          {/* Show Join button only if user is not owner and not already a participant */}
                          {project.owner?._id !== user?._id && 
                           !project.users?.some(u => u._id === user?._id || u === user?._id) ? (
                            <button
                              onClick={() => handleJoinPublicProject(project._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Join
                            </button>
                          ) : (
                            <span className="text-sm text-green-600 font-medium">
                              {project.owner?._id === user?._id ? 'Owner' : 'Joined'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* New Project Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={handleCancelCreate}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creatingProject) {
                      handleCreateProject();
                    }
                  }}
                  placeholder="Enter project name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Private Project (requires 6-digit code to join)
                  </span>
                </label>
                {isPrivate && (
                  <p className="mt-2 text-xs text-gray-500">
                    A unique 6-digit code will be generated for this project. Share it with people you want to invite.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={handleCancelCreate}
                disabled={creatingProject}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creatingProject || !projectName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join by Code Modal */}
      {showJoinCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Join Private Project</h2>
              <button
                onClick={() => {
                  setShowJoinCodeModal(false);
                  setJoinCode('');
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Project Code
                </label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !joiningProject) {
                      handleJoinCodeSubmit();
                    }
                  }}
                  placeholder="Enter code..."
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowJoinCodeModal(false);
                  setJoinCode('');
                  setError('');
                }}
                disabled={joiningProject}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinCodeSubmit}
                disabled={joiningProject || joinCode.trim().length !== 6}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {joiningProject ? 'Joining...' : 'Join Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Display Modal */}
      {showCodeDisplayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Private Project Created!</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Your project has been created. Share this code with people you want to invite:
              </p>

              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Project Code:</p>
                <p className="text-4xl font-bold font-mono tracking-widest text-indigo-600">
                  {createdProjectCode}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important:</strong> Save this code! You'll need it to share with others who want to join this private project.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={handleCodeDisplayClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Go to Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;