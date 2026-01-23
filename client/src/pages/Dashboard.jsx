import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';

function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    if (user.role === 'Admin') {
        return <AdminDashboard />;
    }

    return <EmployeeDashboard user={user} />;
}

export default Dashboard;
