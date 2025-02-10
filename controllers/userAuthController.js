const msal = require('@azure/msal-node');
const axios = require('axios');
const { createAccessToken, createRefreshToken } = require('../handlers/jwtHandler');
const { GuestEmails, GuestUserInfo } = require('../shared/constants');

const clientId = process.env.MICROSOFT_GRAPH_CLIENT_ID;
const tenantId = process.env.MICROSOFT_GRAPH_TENANT_ID;
const clientSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
const REDIRECT_URI = process.env.BASE_URL + '/auth/microsoft/redirect';

const config = {
    auth: {
        clientId: clientId,
        authority: 'https://login.microsoftonline.com/' + tenantId,
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
        scopes: ['User.Read', 'Files.ReadWrite.AppFolder', 'offline_access'],
        redirectUri: REDIRECT_URI,
    };

    const url = await pca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(url);
};

exports.microsoftLoginRedirect = async (req, res) => {
    const tokens = await getTokens(req.query.code);

    if(tokens == null){
        return res.render('authSuccessView.ejs', {
            status: 'ERROR',
            basePath: process.env.BASE_URL,
            outlookInfo: JSON.stringify({
                accessToken: '',
                refreshToken: '',
                email: '',
                displayName: '',
                rollNumber: '',
                outlookAccessToken: '',
                outlookRefreshToken: '',
            })
        });
    }

    const userResp = await axios.get(
        'https://graph.microsoft.com/v1.0/me',
        { headers: { Authorization: `Bearer ${tokens.outlookAccessToken}` } }
    );
    const userInfo = userResp.data;

    if (GuestEmails.includes(userInfo.mail) || (`${userInfo.mail}`).endsWith("@alumni.iitg.ac.in")) {
        return res.render('authSuccessView.ejs', {
            status: 'SUCCESS',
            basePath: process.env.BASE_URL,
            outlookInfo: JSON.stringify({
                accessToken: createAccessToken(GuestUserInfo.email),
                refreshToken: createRefreshToken(GuestUserInfo.email),
                ...tokens,
                ...GuestUserInfo,
            })
        });
    }

    if (!userInfo.displayName || !userInfo.mail || !userInfo.surname) {
        return res.render('authSuccessView.ejs', {
            status: 'ERROR',
            basePath: process.env.BASE_URL,
            outlookInfo: JSON.stringify({
                accessToken: '',
                refreshToken: '',
                email: '',
                displayName: '',
                rollNumber: '',
                outlookAccessToken: '',
                outlookRefreshToken: '',
            })
        });
    }

    const accessToken = createAccessToken(userInfo.mail);
    const refreshToken = createRefreshToken(userInfo.mail);

    return res.render('authSuccessView.ejs', {
        status: 'SUCCESS',
        basePath: process.env.BASE_URL,
        outlookInfo: JSON.stringify({
            accessToken,
            refreshToken,
            email: userInfo.mail,
            displayName: userInfo.displayName,
            rollNumber: userInfo.surname,
            ...tokens,
        })
    });
};

async function getTokens(authCode) {
    try {
        const response = await axios.post(
            `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: authCode,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
                scope: 'User.Read Files.ReadWrite.AppFolder offline_access'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return {
            outlookAccessToken: response.data.access_token,
            outlookRefreshToken: response.data.refresh_token,
        };
    } catch (error) {
        console.error("Error getting tokens:", error.response?.data || error.message);
        return null;
    }
}