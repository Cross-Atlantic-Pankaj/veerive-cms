
const authorizeUser = (permittedRoles) => {
    return (req, res, next) => {
        console.log('req.user:', req.user); // Debugging log
        if (req.user && permittedRoles.includes(req.user.role)) {
            next(); // Role is permitted
        } else {
            console.log('Access Denied for role:', req.user ? req.user.role : 'None'); // Debugging log
            return res.status(403).json({ errors: 'You do not have access to this page' });
        }
    };
};

export default authorizeUser;
