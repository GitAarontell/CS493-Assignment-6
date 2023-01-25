function generateState() {
    let state = '';
    for (let i = 0; i < 20; i++){
        if (Math.random() == 1){
            if (Math.random() == 1){
                state += String.fromCharCode(Math.random() * (38 - 35) + 35);
            } else {
                state += String.fromCharCode(Math.random() * (95 - 40) + 40);
            }
        } else {
            state += String.fromCharCode(Math.random() * (126 - 97) + 97);
        }
    }
    return state;
}

module.exports = {generateState}