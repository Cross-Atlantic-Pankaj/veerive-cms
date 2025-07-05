
import jwt from 'jsonwebtoken';
import User from '../models/user-model.js'; // Ensure the correct path to the User model
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Hardcoded Gmail SMTP host
    port: 587, // Hardcoded SMTP port for TLS
    secure: false, // Use STARTTLS (not SSL)
    auth: {
        user: 'info@veerive.com', // Hardcoded email address
        pass: 'rtos ktbb yzdf twaw',   // Hardcoded App Password (from Gmail settings)
    },
    tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
    },
    family: 4, // Force IPv4
    debug: true, // Enable debug output for troubleshooting
});

// Verify the transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Debugging Error:', error);
    } else {
        console.log('SMTP Debugging Successful:', success);
    }
});

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Retrieve Authorization header
    //console.log('Authorization Header:', authHeader); // Log the header for debugging

    if (!authHeader) {
        return res.status(401).json({ error: 'Token is required' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        // console.log('Decoded Token Data:', tokenData); // Log the decoded data
        req.user = { userId: tokenData.userId, role: tokenData.role }; // Attach decoded data to req
        // console.log('Request User:', req.user); // Debug log
        next();
    } catch (err) {
        console.error('Invalid Token:', err.message); // Log error for debugging
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const conditionalAuth = async (req, res, next) => {
    try {
        // Check if any admin exists in the database
        const adminCount = await User.countDocuments({ role: 'Admin' });

        if (adminCount === 0) {
            // No Admin exists; allow the first admin registration
            console.log('No Admins found. Bypassing authentication for registration.');
            next();
        } else {
            // Admin exists, but no authentication required for registration
            console.log('Admins found. Bypassing authentication for all registrations.');
            next();
        }
    } catch (err) {
        console.error('Error checking Admin count:', err.message);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};

const checkPasswordExpiry = async (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Calculate days since last password update
            const daysSinceLastUpdate = Math.floor((Date.now() - new Date(user.lastPasswordUpdate)) / (1000 * 60 * 60 * 24));

            // Reminder email: Send during the last 5 days before expiry
            if (daysSinceLastUpdate >= 25 && daysSinceLastUpdate < 30) {
                try {
                    console.log('Sending password nearing expiry reminder.');
                    const mailOptions = {
                        from: 'info@veerive.com', // Hardcoded sender email
                        to: user.email,
                        subject: 'Password Change Reminder',
                        text: 'Your password is nearing expiry. Please change it within the next 5 days to avoid disruption.',
                    };
                    await transporter.sendMail(mailOptions);
                } catch (emailErr) {
                    console.error('Error sending password expiry reminder email:', emailErr.message);
                }
            }

            // Password expired: Block further actions
            if (daysSinceLastUpdate >= 30) {
                console.log('Password expired.');
                return res.status(403).json({ error: 'Password expired. Please update your password to continue.' });
            }

            next();
        } catch (err) {
            console.error('Error checking password expiry:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    } else {
        next(); // Skip check for non-admin users
    }
};
///test for 2 minutes

// const checkPasswordExpiry = async (req, res, next) => {
//     if (req.user && req.user.role === 'Admin') {
//         try {
//             const user = await User.findById(req.user.userId);
//             if (!user) {
//                 return res.status(404).json({ error: 'User not found' });
//             }

//             // Calculate minutes since last password update
//             const minutesSinceLastUpdate = Math.floor((Date.now() - new Date(user.lastPasswordUpdate)) / (1000 * 60));

//             // Reminder email: Send during the reminder window
//             if (minutesSinceLastUpdate > 1 && minutesSinceLastUpdate <= 2) {
//                 try {
//                     console.log('Sending password nearing expiry reminder.');
//                     const mailOptions = {
//                         // from: process.env.EMAIL_USER,
//                         // to: user.email,
//                         from: 'paich147@gmail.com', // Hardcoded sender email
//                         to: user.email,
//                         subject: 'Password Change Reminder',
//                         text: 'Your password is nearing expiry. Please change it soon to avoid disruption.',
//                     };
//                     await transporter.sendMail(mailOptions);
//                 } catch (emailErr) {
//                     console.error('Error sending password expiry reminder email:', emailErr.message);
//                 }
//             }

//             // Password expired: Block further actions
//             if (minutesSinceLastUpdate > 2) {
//                 console.log('Password expired.');
//                 return res.status(403).json({ error: 'Password expired. Please update your password to continue.' });
//             }

//             next();
//         } catch (err) {
//             console.error('Error checking password expiry:', err.message);
//             return res.status(500).json({ error: 'Internal server error.' });
//         }
//     } else {
//         next(); // Skip check for non-admin users
//     }
// };



export { authenticateUser, conditionalAuth, checkPasswordExpiry };