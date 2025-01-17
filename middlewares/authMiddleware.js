const tokenService = require('../service/tokenService');

module.exports = function (req, res, next) {
    try {
        const protectedRoutes = ['/dashboard', '/feedback', '/send-prompt', '/auth/logout', '/auth/refresh'];
        const currentPath = req.path;

        if (!protectedRoutes.includes(currentPath)) {
            return next();
        }
        if (protectedRoutes.includes(currentPath)) {
            return res.redirect('/auth/login');
        }

        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            console.warn('Authorization header is missing');
            return res.redirect('/auth/login');
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            console.warn('Access token is missing');
            return res.redirect('/auth/login');
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            console.warn('Access token is invalid or expired');
            return res.redirect('/auth/login');
        }

        req.user = userData;
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error.message);
        return res.redirect('/auth/login');
    }
};
