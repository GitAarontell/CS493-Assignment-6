const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
const STATE = 'State';

function getStates(){
    const q = datastore.createQuery(STATE);
    return datastore.runQuery(q).then((entities) => {
        return entities[0].map(fromDatastore);
    });
}

function postState(state) {
    let key = datastore.key(STATE);
    const newState = {"state": state};
    return datastore.save({ "key": key, "data": newState }).then(() => { return key });
}

function deleteState(id) {
    const key = datastore.key([STATE, parseInt(id, 10)]);
    return datastore.delete(key);
}

function stateMatch(stArray, state){
    for(let i = 0; i < stArray.length; i++){
        if (stArray[i].state === state){
            return 0;
        }
    }
    return 1;
}

function deleteStates(states){
    states.forEach(element => {
        deleteState(element.id);
    });
}

function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}

module.exports = {getStates, postState, deleteStates, stateMatch}