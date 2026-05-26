import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';


// MELINDUGI DAN MEMISAHKAN ROUTE YANG MEMERLUKAN AUTENTIKASI DAN YANG TIDAK MEMERLUKAN AUTENTIKASI
export const GuestRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export const PrivateRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};