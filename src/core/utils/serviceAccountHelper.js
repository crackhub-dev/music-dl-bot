module.exports = {
    chooseSeviceAccount() {
        let randInt = Math.floor(Math.random() * (100 - 1) + 1);
        let account;
        if (randInt < 10) {
            account = 'dst' + '00' + String(randInt) + ':';
        }
        if (randInt >= 10) {
            account = 'dst' + '0' + String(randInt) + ':';
        }
        return account;
    }
}