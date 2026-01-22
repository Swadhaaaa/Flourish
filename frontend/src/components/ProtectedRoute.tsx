import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // You could render a loader here
        return <div className="h-screen w-full flex items-center justify-center bg-[#FFF8F5]"></div>;
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
