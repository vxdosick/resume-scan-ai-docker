const UserModel = require('../models/userModel');
const tokenService = require('../service/tokenService');
const bcrypt = require('bcryptjs');
const userDto = require('../dtos/userDto');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            return 'error';
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const activationLink = require('uuid').v4();

        const user = await UserModel.create({ email, password: hashedPassword, activationLink });
        const dto = new userDto(user);
        const tokens = tokenService.generateToken({ ...dto });
        await tokenService.saveToken(dto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: dto,
            activationLink,
        };
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) return 'not found';

        const isPassValid = await bcrypt.compare(password, user.password);
        if (!isPassValid) return 'error pass';

        const dto = new userDto(user);
        const tokens = tokenService.generateToken({ ...dto });
        await tokenService.saveToken(dto.id, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: dto,
        };
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw new Error('Invalid or expired activation link');
        }
    
        if (user.isActivated) {
            throw new Error('Account already activated');
        }
    
        user.isActivated = true;
        user.activationLink = null;
        await user.save();
    
        return user;
    }
    
    async logout(refreshToken) {
        await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) return null;

        const user = await UserModel.findById(userData.id);
        const dto = new userDto(user);
        const tokens = tokenService.generateToken({ ...dto });

        return {
            accessToken: tokens.accessToken,
            refreshToken,
            user: dto,
        };
    }

    async getUsers() {
        return await UserModel.find();
    }
}

module.exports = new UserService();
