


const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Strip "Bearer " prefix
    console.log(token, "token");

    if (!token) {
        return res.status(401).json({ status: 0, error: 'Unauthorized: No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, '#123456789suchi');
        
        req.user = decodedToken;
        
        next();

    } catch (error) {
        console.log(error, "Invalid token or token expired");

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 0, error: 'Unauthorized: Token expired' });
        }

        return res.status(401).json({ status: 0, error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
