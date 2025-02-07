import {useState, useContext} from 'react'
import AuthContext from '../context/AuthContext'

export default function Login(){
    const {handleLogin} = useContext(AuthContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('') 
    
    const handleSubmit = (e) => {
        e.preventDefault()
        //run validations
        const formData = {
            email: email,
            password: password
        }
       
        handleLogin(formData)
    }
    return (
        <div>
            <h2>Login Page</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="enter email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                /> <br/>

                <input 
                    type="password" 
                    placeholder="enter password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                />  <br/>    

                <input type="submit" />         
            </form>
        </div>
    )
}

// ==================TEMPLATE FROM GPT=============================================
// import React, { useState } from 'react';

// const RegistrationForm = () => {
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
//     });

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         Handle form submission logic here
//         console.log(formData);
//     };

//     return (
//         <div style={styles.container}>
//             <h2 style={styles.heading}>Register</h2>
//             <form style={styles.form} onSubmit={handleSubmit}>
//                 <div style={styles.inputGroup}>
//                     <label style={styles.label} htmlFor="name">Name:</label>
//                     <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         style={styles.input}
//                         required
//                     />
//                 </div>
//                 <div style={styles.inputGroup}>
//                     <label style={styles.label} htmlFor="email">Email:</label>
//                     <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         style={styles.input}
//                         required
//                     />
//                 </div>
//                 <div style={styles.inputGroup}>
//                     <label style={styles.label} htmlFor="password">Password:</label>
//                     <input
//                         type="password"
//                         id="password"
//                         name="password"
//                         value={formData.password}
//                         onChange={handleChange}
//                         style={styles.input}
//                         required
//                     />
//                 </div>

//                 <div style={styles.inputGroup}>
//                     <label style={styles.label} htmlFor="newField">NewField:</label>
//                     <input
//                         type="newfield"
//                         id="newfield"
//                         name="newfield"
//                         value={formData.newfield}
                        
//                         style={styles.input}
//                         required
//                     />
//                 </div>

//                 <button type="submit" style={styles.button}>Register</button>
//             </form>
//         </div>
//     );
// };

// const styles = {
//     container: {
//         maxWidth: '400px',
//         margin: '50px auto',
//         padding: '20px',
//         borderRadius: '8px',
//         boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
//         backgroundColor: '#fff',
//     },
//     heading: {
//         textAlign: 'center',
//         marginBottom: '20px',
//         color: '#333',
//     },
//     form: {
//         display: 'flex',
//         flexDirection: 'column',
//     },
//     inputGroup: {
//         marginBottom: '15px',
//     },
//     label: {
//         marginBottom: '5px',
//         fontSize: '14px',
//         color: '#555',
//     },
//     input: {
//         width: '100%',
//         padding: '10px',
//         fontSize: '16px',
//         borderRadius: '4px',
//         border: '1px solid #ccc',
//         boxSizing: 'border-box',
//     },
//     button: {
//         padding: '10px 15px',
//         fontSize: '16px',
//         borderRadius: '4px',
//         border: 'none',
//         backgroundColor: '#4CAF50',
//         color: '#fff',
//         cursor: 'pointer',
//         marginTop: '10px',
//     },
//     buttonHover: {
//         backgroundColor: '#45a049',
//     },
// };

// export default RegistrationForm;
