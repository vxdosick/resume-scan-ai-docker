module.exports = class UserDto {
    email;
    id;
    isActivated;
    constructor(user) {
        this.id = user._id
        this.email = user.email
        this.isActivated = user.isActivated
    }
}