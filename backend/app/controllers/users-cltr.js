import User from "../models/user-model.js";
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';

const usersCltr = {};

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

usersCltr.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, name } = req.body;

    try {
        // Check for existing Admin users
        const adminCount = await User.countDocuments({ role: 'Admin' });

        let assignedRole = 'User'; // Default role for non-admin registrations

        if (adminCount === 0) {
            // If no Admin exists, assign Admin role to the first user
            assignedRole = 'Admin';
            if (!name) {
                return res.status(400).json({ error: 'Name is required for Admin registration.' });
            }
        } else if (role === 'Admin') {
            // Prevent non-authenticated users from registering as Admin
            return res.status(403).json({ error: 'Only Admins can assign Admin role.' });
        } else if (role === 'Moderator') {
            // Allow moderator registration without admin intervention
            assignedRole = 'Moderator';
        }

        // Create and save the user (plain text password)
        const user = new User({
            email,
            password, // store as plain text
            role: assignedRole,
            name,
            lastPasswordUpdate: Date.now(),
        });

        await user.save();

        return res.status(201).json({
            message: `User registered successfully with role: ${assignedRole}`,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
            },
        });
    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Remove provider check
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }

        // Plain-text password check
        if (password !== user.password) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }

        // Generate token if login is successful
        const tokenData = { userId: user._id, role: user.role };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '30d' });

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

usersCltr.forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 900000; // 15 minutes

        await user.save();
        console.log("Token Saved to Database"); // Debugging

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:
            http://localhost:3001/reset-password?token=${token}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error('Error during forgot password:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};


usersCltr.resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        // Store new password as plain text (to maintain consistency with current system)
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        user.lastPasswordUpdate = Date.now(); // Reset password update time
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error('Error during reset password:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};



usersCltr.updatePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if current password matches (plain text comparison since passwords are stored as plain text)
        if (currentPassword !== user.password) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        // Store new password as plain text (to maintain consistency with current system)
        user.password = newPassword;
        user.lastPasswordUpdate = Date.now(); // Update last password change date
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Error during update password:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.updateEmail = async (req, res) => {
    //console.log("Request User from Middleware:", req.user); // Log req.user to confirm presence

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
        const userId = req.user?.userId; // Access userId from req.user
        if (!userId) {
            console.error('User ID is missing from request.');
            return res.status(401).json({ error: 'User ID is missing from the request' });
        }

        const user = await User.findById(userId); // Use the userId from req.user
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.email = email;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Updated',
            text: 'Your email address has been successfully updated.'
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email updated successfully.' });
    } catch (err) {
        console.error('Error during update email:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.list = async (req, res) => {
    console.log('Accessing user list with req.user:', req.user); // Debugging log
    try {
        let query = {};
        if (req.user.role === 'SuperAdmin') {
            query = {};
        } else if (req.user.role === 'Admin') {
            query = { role: { $ne: 'SuperAdmin' } };
        } else if (req.user.role === 'Moderator' || req.user.role === 'User') {
            query = {};
        } else {
            return res.status(403).json({ errors: 'You do not have access to this page' });
        }
        const users = await User.find(query).select('-password -resetToken -resetTokenExpiration');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users list:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.account = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("email role name");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching account details:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.destroy = async (req, res) => {
    try {
        const id = req.params.id;

        // Allow SuperAdmin to delete any user except themselves
        if (req.user.role === 'SuperAdmin') {
            if (id === req.user.userId) {
                return res.status(400).json({ error: 'You cannot delete your own account.' });
            }
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            await user.deleteOne();
            return res.status(200).json({ message: 'User deleted successfully.' });
        }

        // Ensure the logged-in user is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admins can delete accounts.' });
        }

        // Prevent Admin from deleting their own account
        if (id === req.user.userId) {
            return res.status(400).json({ error: 'You cannot delete your own account.' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Allow Admin to delete only users or moderators
        if (!['User', 'Moderator'].includes(user.role)) {
            return res.status(403).json({ error: 'You cannot delete an Admin account.' });
        }

        await user.deleteOne();

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.updateUser = async (req, res) => {
    const { name, email, role, password } = req.body;
    const id = req.params.id; // ID of the target user

    try {
        // Prevent updating own account through this route
        if (id === req.user.userId) {
            return res.status(400).json({ error: 'You cannot update your own account through this route. Use the settings page instead.' });
        }

        // Validate required fields
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required.' });
        }

        // Validate the role
        if (!['Moderator', 'User', 'Admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role provided. Only Moderator, User, or Admin roles are allowed.' });
        }

        // Retrieve the target user
        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Prevent updating SuperAdmin
        if (targetUser.role === 'SuperAdmin' || targetUser.email === 'info@veerive.com') {
            return res.status(400).json({ error: 'Cannot update a SuperAdmin account.' });
        }

        // If the requester is not SuperAdmin, prevent updating Admin accounts
        if (req.user.role !== 'SuperAdmin' && targetUser.role === 'Admin') {
            return res.status(400).json({ error: 'Cannot update an Admin account.' });
        }

        // Check if email is being changed and if it's already taken
        if (email !== targetUser.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email address is already in use.' });
            }
        }

        // Update user fields
        targetUser.name = name || '';
        targetUser.email = email;
        targetUser.role = role;

        // Update password if provided
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
            }
            targetUser.password = password; // Store as plain text (consistent with current system)
            targetUser.lastPasswordUpdate = Date.now();
        }

        await targetUser.save();

        res.status(200).json({
            message: 'User updated successfully.',
            user: {
                _id: targetUser._id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role
            }
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

usersCltr.changeRole = async (req, res) => {
    const { role } = req.body; // The desired role
    const id = req.params.id; // ID of the target user

    try {
        // Prevent changing own role
        if (id === req.user.userId) {
            return res.status(400).json({ error: 'You cannot change your own role.' });
        }

        // Validate the role
        if (!['Moderator', 'User', 'Admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role provided. Only Moderator, User, or Admin roles are allowed.' });
        }

        // Retrieve the target user
        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Prevent changing the role of SuperAdmin
        if (targetUser.role === 'SuperAdmin' || targetUser.email === 'info@veerive.com') {
            return res.status(400).json({ error: 'Cannot change the role of a SuperAdmin.' });
        }

        // If the requester is not SuperAdmin, prevent changing Admin roles
        if (req.user.role !== 'SuperAdmin' && targetUser.role === 'Admin') {
            return res.status(400).json({ error: 'Cannot change the role of an Admin.' });
        }

        // Update the role of the target user
        targetUser.role = role;
        await targetUser.save();

        res.status(200).json({
            message: `User role updated successfully to ${role}.`,
            user: targetUser,
        });
    } catch (err) {
        console.error('Error changing user role:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};
export default usersCltr;