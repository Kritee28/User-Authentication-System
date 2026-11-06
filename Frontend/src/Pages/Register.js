import '../Styles/login.css';
import * as yup from 'yup';
import { ErrorMessage, Formik, Form, Field } from 'formik';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { API_URL } from '../module/api';

const validationSchema = yup.object({
	name: yup.string().trim().required('Name is required'),
	lastname: yup.string().trim().required('Last name is required'),
	username: yup.string().matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, 'Use letters, numbers, and single hyphens').required('Username is required'),
	email: yup.string().email('Enter a valid email').required('Email is required'),
	password: yup.string().min(8, 'Use at least 8 characters').max(72, 'Password must be at most 72 bytes').required('Password is required'),
	confirmation: yup.string().oneOf([yup.ref('password')], 'Passwords do not match').required('Confirm your password'),
});

const Register = () => {
	const handleRegister = async (values, { setSubmitting }) => {
		try {
			await axios.post(`${API_URL}/auth/register`, {
				name: values.name.trim(),
				lastname: values.lastname.trim(),
				username: values.username.trim(),
				email: values.email.trim(),
				password: values.password,
			}, { withCredentials: true });
			toast.success('Account created. Sign in to continue.');
			window.location.assign('/');
		} catch (error) {
			toast.error(error.response?.data?.message || 'Could not create your account. Try again.');
		} finally {
			setSubmitting(false);
		}
	};
	const fields = [
		['name', 'Name', 'text'], ['lastname', 'Last name', 'text'],
		['username', 'Username', 'text'], ['email', 'Email', 'email'],
		['password', 'Password', 'password'], ['confirmation', 'Confirm password', 'password'],
	];

	return (
		<section>
			<Toaster />
			<div className="box">
				{[1, 2, 3, 4, 5, 6].map((item) => <div className="square" key={item} />)}
				<div className="container"><div className="form">
					<h2>Register</h2>
					<Formik initialValues={{ name: '', lastname: '', username: '', email: '', password: '', confirmation: '' }} onSubmit={handleRegister} validationSchema={validationSchema}>
						{({ isSubmitting }) => <Form className="login-form">
							{fields.map(([name, label, type]) => <div className="inputBx" key={name}>
								<Field name={name} type={type} className="inputBox" autoComplete={name === 'password' || name === 'confirmation' ? 'new-password' : name} aria-label={label} />
								<span className="spanInput">{label}</span>
								<ErrorMessage component="span" name={name} className="form-error" />
							</div>)}
							<div className="inputBx"><button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Sign up'}</button></div>
						</Form>}
					</Formik>
					<p>Already have an account? <Link to="/">Sign in</Link></p>
				</div></div>
			</div>
		</section>
	);
};

export default Register;
