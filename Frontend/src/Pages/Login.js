import '../Styles/login.css';
import * as yup from 'yup';
import { ErrorMessage, Formik, Form, Field } from 'formik';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { API_URL } from '../module/api';

const validationSchema = yup.object({
	email: yup.string().trim().required('Email or username is required'),
	password: yup.string().required('Password is required'),
});

const Login = () => {
	const handleLogin = async (values, { setSubmitting }) => {
		const pending = toast.loading('Signing in…');
		try {
			await axios.post(`${API_URL}/auth/login`, {
				email: values.email.trim(),
				password: values.password,
			}, { withCredentials: true });
			toast.success('Signed in.', { id: pending });
			window.location.assign('/');
		} catch (error) {
			toast.error(error.response?.data?.message || 'Could not sign in. Check your connection and try again.', { id: pending });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section>
			<div className="box">
				{[1, 2, 3, 4, 5, 6].map((item) => <div className="square" key={item} />)}
				<div className="container"><div className="form">
					<h2>LOGIN</h2>
					<Formik initialValues={{ email: '', password: '' }} onSubmit={handleLogin} validationSchema={validationSchema}>
						{({ isSubmitting }) => <Form className="LoginForm">
							<div className="inputBx">
								<Field name="email" type="text" className="inputBox" autoComplete="username" aria-label="Email or username" />
								<span className="spanInput">Email or username</span>
								<ErrorMessage component="span" name="email" className="form-error" />
							</div>
							<div className="inputBx">
								<Field name="password" type="password" className="inputBox" autoComplete="current-password" aria-label="Password" />
								<span className="spanInput">Password</span>
								<ErrorMessage component="span" name="password" className="form-error" />
							</div>
							<div className="inputBx"><button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Login'}</button></div>
						</Form>}
					</Formik>
					<p>Don't have an account? <Link to="/register">Sign up</Link></p>
				</div></div>
			</div>
			<Toaster />
		</section>
	);
};

export default Login;
