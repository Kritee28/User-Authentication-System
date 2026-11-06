import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Login from '../Pages/Login';
import Dashboard from '../Pages/Dashboard';
import Register from '../Pages/Register';
import PageNotFound from '../Pages/PageNotFound';
import { API_URL } from '../module/api';

const Rotas = () => {
	const [auth, setAuth] = useState({ loading: true, loggedIn: false });
	useEffect(() => {
		axios.get(API_URL, { withCredentials: true })
			.then(({ data }) => setAuth({ loading: false, loggedIn: data.loggedIn }))
			.catch(() => setAuth({ loading: false, loggedIn: false }));
	}, []);

	if (auth.loading) return <main role="status">Checking your session…</main>;
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={auth.loggedIn ? <Dashboard /> : <Login />} />
				<Route path="/register" element={auth.loggedIn ? <Navigate to="/" replace /> : <Register />} />
				<Route path="*" element={<PageNotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

export default Rotas;
