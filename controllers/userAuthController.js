const msal = require('@azure/msal-node');
const request = require('request');
const {createAccessToken, createRefreshToken} = require('../handlers/jwtHandler');
const { json } = require('express');
const { GuestEmails, GuestUserInfo } = require('../shared/constants');

const clientId = process.env.MICROSOFT_GRAPH_CLIENT_ID;
const tenantId = 'https://login.microsoftonline.com/' + process.env.MICROSOFT_GRAPH_TENANT_ID;
const clientSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
const REDIRECT_URI = process.env.BASE_URL + '/auth/microsoft/redirect';

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

exports.microsoftLogin = async (req, res) => {
    const authCodeUrlParameters = {
        scopes: ['user.read'],
        redirectUri: REDIRECT_URI,
    };

    const url = await pca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(url);
};

exports.microsoftLoginRedirect = async (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ['user.read'],
        redirectUri: REDIRECT_URI
    };

    const response = await pca.acquireTokenByCode(tokenRequest);
    request.get({
        url: 'https://graph.microsoft.com/v1.0/me',
        headers: {
            'Authorization': 'Bearer ' + response.accessToken
        }
    }, async function (err, resp, body) {
        console.log('here');
        if(err){
            console.log(err);
            return res.render('authSuccessView.ejs', {
                status: 'ERROR',
                outlookInfo: JSON.stringify({
                    accessToken: '', 
                    refreshToken: '', 
                    email: '',
                    displayName: '',
                    rollNumber: ''
                })
            });
        }

        const userInfo = JSON.parse(body);

        if(GuestEmails.includes(userInfo.mail)){
            return res.render('authSuccessView.ejs', {
                status: 'SUCCESS',
                outlookInfo: JSON.stringify({
                    accessToken: createAccessToken(userInfo.mail),
                    refreshToken: createRefreshToken(userInfo.mail),
                    email: userInfo.mail,
                    ...GuestUserInfo
                })
            });
        }

        if(!userInfo.displayName || !userInfo.mail || !userInfo.surname){
            return res.render('authSuccessView.ejs', {
                status: 'ERROR',
                outlookInfo: JSON.stringify({
                    accessToken: '', 
                    refreshToken: '', 
                    email: '',
                    displayName: '',
                    rollNumber: ''
                })
            });
        }
        
        const accessToken = createAccessToken(userInfo.mail);
        const refreshToken = createRefreshToken(userInfo.mail);

        return res.render('authSuccessView.ejs', {
            status: 'SUCCESS', 
            outlookInfo: JSON.stringify({
                accessToken, 
                refreshToken, 
                email: userInfo.mail,
                displayName: userInfo.displayName,
                rollNumber: userInfo.surname
            })
        });
    });
};
