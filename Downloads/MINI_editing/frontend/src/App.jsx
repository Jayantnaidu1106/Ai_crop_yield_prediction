import AppRoutes from './routes/Approutes';
import { UserProvider } from './context/user.context';
import './App.css';

const App = () => {
  return (
    <UserProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </UserProvider>
  );
};

export default App;
