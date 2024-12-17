// import { PublicClientApplication } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "caae822c-8c80-4b57-ad15-9fe8759d7e37",
        authority: "https://login.microsoftonline.com/b74ebfb9-6485-4ad0-86e6-76d883c78e7e", // Replace with your Azure AD Tenant ID - b74ebfb9-6485-4ad0-86e6-76d883c78e7e  sethvinit98outlook.onmicrosoft.com
        redirectUri: "http://localhost:3000",
        postLogoutRedirectUrl: '/',
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookies: false, // set to 'true' if facing issue in Edge
    },
    system: {
        loggerOptions: {
            loggerCalback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: ['user.read'],
}

/* An Optional silentRequest object can be used to achieve silent SSO
   between applications by providing a 'login_hint' property */

export const silentRequest = {
    scopes: ['user.read'], // ["openid", "profile"],
    loginHint: 'sethvinit98@outlook.com'  //'vinit.seth@capgemini.com'
}

// export const msalInstance = new PublicClientApplication(msalConfig);
