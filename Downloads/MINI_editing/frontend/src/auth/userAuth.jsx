import { useEffect, useState } from 'react';
import { useUser } from '../context/user.context';
import { useNavigate } from 'react-router-dom';

const UserAuth = ({ children }) => {
    const { user, setUser } = useUser();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');


        if (!token) {
            navigate('/login');
            return;
        }

        if (userData && !user) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
        }

        setLoading(false);
    }, [user, navigate, setUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return <>{children}</>;
};

export default UserAuth;
