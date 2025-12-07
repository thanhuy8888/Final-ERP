import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, saleOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.role ? user.role.toLowerCase() : '';

    if (adminOnly && role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    if (saleOnly && !['sale', 'admin'].includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

