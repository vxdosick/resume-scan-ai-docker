const UserService = require('../service/userService');
const MailService = require('../service/mailService');

class AuthController {
    async registration(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await UserService.registration(email, password);
            
            if (userData === 'error') {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
            const activationLink = `${'http://localhost:3000'}/auth/activate/${userData.activationLink}`;
            try {
                await MailService.sendActivationMail(email, activationLink);
            } catch (mailError) {
                console.error('Email sending failed:', mailError);
                return res.status(500).json({ error: 'Failed to send activation email' });
            }

            return res.redirect('/auth/login');
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).send('Server Error');
        }
    }

async login(req, res, next) {
    try {
        const { email, password } = req.body;
        const userData = await UserService.login(email, password);

        if (userData === 'not found') {
            return res.status(404).render('error', { error: 'You are not registered' });
        } else if (userData === 'error pass') {
            return res.status(401).render('error', { error: 'Wrong password' });
        } else if (!userData.user.isActivated) {
            return res.status(403).render('error', { error: 'Please activate your account via email.' });
        }

        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        });
        res.cookie('accessToken', userData.accessToken, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
        })

        return res.redirect('/dashboard');


    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('error', {
            title: 'Login Error',
            message: 'Internal server error. Please try again later.',
        });
    }
}

    

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
    
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token not provided' });
            }

            res.clearCookie('accessToken', {
                httpOnly: true,
            });
    
            res.clearCookie('refreshToken', {
                httpOnly: true,
            });

    
            await UserService.logout(refreshToken);
    
            return res.redirect('/');
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).send('Server Error');
        }
    }
    

async activate(req, res, next) {
    try {
        const activationLink = req.params.link;
        await UserService.activate(activationLink);

        return res.redirect('/auth/login');
    } catch (error) {
        console.error('Activation error:', error.message);
        return res.status(400).render('error', {
            title: 'Activation Error',
            message: error.message || 'Invalid or expired activation link',
        });
    }
}

    

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const userData = await UserService.refresh(refreshToken);

            if (!userData) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            res.cookie('accessToken', userData.accessToken, {
                maxAge: 30 * 60 * 1000,
                httpOnly: true,
            });

            return res.json({
                accessToken: userData.accessToken,
                user: userData.user,
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(500).send('Server Error');
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await UserService.getUsers();
            return res.json(users);
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).send('Server Error');
        }
    }
}

module.exports = new AuthController();
