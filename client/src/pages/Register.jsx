import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Donor' // Default to Donor
  });

  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Send data to backend
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, { ...formData, email: formData.email.toLowerCase() });
      
      // 2. SAVE TOKEN AND USER DATA (Crucial Step!)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user)); // This saves the role!

      // 3. Redirect to home and refresh to update Navbar
      alert('Registration Successful!');
      navigate('/'); 
      window.location.reload(); 

    } catch (err) {
      console.error(err.response.data);
      alert('Error registering');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input 
          type="text" placeholder="Name" name="name" 
          value={name} onChange={onChange} required 
        /><br /><br />
        
        <input 
          type="email" placeholder="Email" name="email" 
          value={email} onChange={onChange} required 
        /><br /><br />
        
        <input 
          type="password" placeholder="Password" name="password" 
          value={password} onChange={onChange} required 
        /><br /><br />

        <select name="role" value={role} onChange={onChange}>
          <option value="Donor">Donor</option>
          <option value="NGO">NGO</option>
          <option value="Volunteer">Volunteer</option>
        </select><br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;