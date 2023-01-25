const express = require('express');
const bodyParser = require('body-parser');
const info = require('./client_secret');
const axios = require('axios');
const gen = require('./generator');
const stFunc = require('./stateFunc');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/authPage', (req, res) => {
    // set up authentication url
    let rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    let responseType = '?response_type=' + 'code';
    let clientId = '&client_id=' + info.web.client_id;
    let redirect = '&redirect_uri=' + info.web.redirect_uris[0]; // 0 is the cloud deployed url and 1 is the local host
    let scope = '&scope=' + 'profile';
    // generate random state
    let stateNum = gen.generateState();
    let state = '&state=' + stateNum

    // clean up state database then post new state
    stFunc.getStates().then((resObj) => {
        // clean up all previous states
        stFunc.deleteStates(resObj);
        // post new state
        stFunc.postState(stateNum);
    });
    
    let url = rootUrl + responseType + clientId + redirect + scope + state;
    res.redirect(url);
});

app.get('/oauth', (req, res) => {

    // get response information
    let resInfo = res.req.client._httpMessage.req.query;
    let state = resInfo.state;
    let code = resInfo.code;

    // get all states
    stFunc.getStates().then((mainResObj) => {
        // check that state is the same as in database
        if (stFunc.stateMatch(mainResObj, state)) {
            res.status(404).send({'Error': 'State not found'});
        }
        
        // make request for token
        axios('https://oauth2.googleapis.com/token', {
            method: 'POST',
            data: {
                code: code,
                client_id: info.web.client_id,
                client_secret: info.web.client_secret,
                redirect_uri: info.web.redirect_uris[0],
                grant_type: 'authorization_code'
            }       
        }).then((resObj) => {
            // get token from response
            let accessToken = resObj.data.access_token;
            // make request for information
            axios('https://people.googleapis.com/v1/people/me?personFields=names', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            }).then((resObj) => {
                // get information and send html to end user
                let firstName = resObj.data.names[0].givenName;
                let lastName = resObj.data.names[0].familyName;
                let dataToSend = `<html><ul><li>Your given name is ${firstName}</li><li>Your
                 family name is ${lastName}</li><li>The value of state is ${mainResObj[0].state}</li></ul></html>`
                res.status(200).send(dataToSend);
            });
        });
    })
});

app.use(express.static('./public'));

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});