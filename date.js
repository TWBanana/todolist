
// do not include "()"
// the moment you add "()", you are actually executing the function
exports.getDate = function () {
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    return today.toLocaleDateString("en-US", options);
}

exports.getDay = function () {
    const today = new Date();
    const options = {
        weekday: "long"
    };
    return today.toLocaleTimeString("en-US", options);
}