exports.logout = function (req, res) {
    res.status(200).send({ auth: false, token: null });
}
