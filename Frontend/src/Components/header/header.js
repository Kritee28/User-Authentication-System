import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../Styles/header.css';
import { API_URL } from '../../module/api';

function Header() {
	const [loggingOut, setLoggingOut] = useState(false);
	const navigate = useNavigate();
	const logout = async () => {
		setLoggingOut(true);
		try {
			await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
			navigate('/', { replace: true });
			window.location.reload();
		} catch (error) {
			toast.error(error.response?.data?.message || 'Could not sign out. Try again.');
			setLoggingOut(false);
		}
	};

	return <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
		<div className="col-md-3 text-end"><button onClick={logout} type="button" className="btn btn-primary" disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button></div>
	</header>;
}

export default Header;
