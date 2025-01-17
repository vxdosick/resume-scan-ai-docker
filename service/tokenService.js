const jwt = require('jsonwebtoken')
const tokenModel = require('../models/tokenModel')
class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, 'your-access-secret', {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, 'your-refresh-secret', {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId})
        if(tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        const token = await tokenModel.create({user: userId, refreshToken})
        return token
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken})
        return tokenData
    }

    async validateRefreshToken (refreshToken) {
        try {
            const userData = jwt.verify(refreshToken, 'your-refresh-secret')
            return userData
        } catch (e) {
            return null
        }
    }

    validateAccessToken (accessToken) {
        try {
            const userData = jwt.verify(accessToken, 'your-access-secret')
            return userData
        } catch (e) {
            return null
        }
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData
    }
}

module.exports = new TokenService()