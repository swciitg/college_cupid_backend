const msal = require('@azure/msal-node');
const request = require('request');
const { createAccessToken, createRefreshToken } = require('./jwtAuthController');

const clientId = process.env.MICROSOFT_GRAPH_CLIENT_ID;
const tenantId = 'https://login.microsoftonline.com/' + process.env.MICROSOFT_GRAPH_TENANT_ID;
const clientSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
const REDIRECT_URI = 'localhost:3000/auth/microsoft/redirect';

const config = {
    auth: {
        clientId: clientId,
        authority: tenantId,
        clientSecret: clientSecret
    },
    system: {
        loggerOptions: {
            loggerCallback(logLevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnable: false,
            logLevel: msal.LogLevel.Warning,
        }
    }
};

const pca = new msal.ConfidentialClientApplication(config);

exports.microsoftLogin = (req, res) => {
    const authCodeUrlParameters = {
        scopes: ['user.read'],
        redirectUri: REDIRECT_URI,
    };

    pca.getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
        console.log(response);
        res.redirect(response);
    }).catch((err) => console.log(JSON.stringify(err)));
};

exports.microsoftLoginRedirect = (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ['user.read'],
        redirectUri: REDIRECT_URI
    };

    pca.acquireTokenByCode(tokenRequest)
    .then(async response => {
        request.get({
            url: 'https://graph.microsoft.com/v1.0/me',
            headers: {
                'Authorization': 'Bearer ' + response.accessToken
            }
        }, async function (err, resp, body) {
            console.log('here');
            if(err){
                console.log(err);
                return res.render('authSuccessView.ejs', {status: 'ERROR', accessToken: '', refreshToken: '', email: ''});
            }
            const userInfo = JSON.parse(body);
            console.log(userInfo);
            if(!userInfo.displayName || !userInfo.mail || !userInfo.surname){
                return res.render('authSuccessView.ejs', {
                    status: 'ERROR', 
                    accessToken: '', 
                    refreshToken: '', 
                    email: ''
                });
            }
            
            const accessToken = createAccessToken(userInfo.mail);
            const refreshToken = createRefreshToken(userInfo.mail);

            return res.render('authSuccessView.ejs', {
                status: 'SUCCESS', 
                accessToken, 
                refreshToken, 
                email: userInfo.email
            });
        });
    });
};