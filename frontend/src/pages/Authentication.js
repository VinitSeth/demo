import { json, redirect } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { msalInstance } from '../index.js';
import { loginRequest } from "../util/auth-config";

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("mode") || "login";

  if (mode !== "login" && mode !== "signup" && mode !== 'sso') {
    throw json({ message: "Unsupported mode." }, { status: 422 });
  }

  // SSO Scenario
  if(mode === 'sso'){
    try {

      // Ensure msalInstance.getAllAccounts() is populated before proceeding.
      // Fix: Add logging in the front end to verify the accounts array and debug the active account logic.
      const accounts = msalInstance.getAllAccounts();

      if(!accounts || accounts.length === 0){
        // Trigger login if no account is active
        const loginResponse = await msalInstance.loginPopup(loginRequest);

        // Extract the authorization code from the response
        const authCode = loginResponse.idToken || loginResponse.authorizationCode;
        if (!authCode) {
            throw new Error("Authorization code not found in login response.");
        }

        // msalInstance.setActiveAccount(loginRequest.account);
      

      // // Ensure that after loginPopup, you extract the code parameter (e.g., from the URL or a token response) and send it to the backend.
      // const activeAccount = msalInstance.getActiveAccount();
      // if(!activeAccount){
      //   throw new Error("No active account found after SSO login")
      // }

      // // Send the user's email to the backend for SSO login
      // const email = activeAccount.username;

      const response = await fetch('http://localhost:8080/sso', {
        method: 'POST',
        headers: {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify({code: authCode}),
      });

      if (response.status === 422 || response.status === 401) {
        return response;
      }

      if (!response.ok) {
        throw json({ message: "SSO authentication failed." }, { status: 500 });
      }

      const resData = await response.json();
      const token = resData.token;

      // Store the token and expiration
      localStorage.setItem("token", token);
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 1);
      localStorage.setItem("expiration", expiration.toISOString());

      return redirect("/");
    }

    // Handle existing account (silent login scenario)
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
         throw new Error("No active account found after SSO login.");
    }

        // Send the user's email to the backend for SSO login
        const email = activeAccount.username;
        const response = await fetch('http://localhost:8080/sso', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          if (response.status === 422 || response.status === 401) {
            return response;
          }
          throw new Error("SSO authentication failed.");
        }
    
        const resData = await response.json();
        const token = resData.token;
    
        // Store the token and expiration
        localStorage.setItem("token", token);
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        localStorage.setItem("expiration", expiration.toISOString());
    
        return redirect("/");

    } 

    
    catch (error) {
      console.error("SSO login error", error);
      throw json({ message: "SSO login failed." }, { status: 500 });
    }
  }



  const data = await request.formData();
  const authData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const response = await fetch("http://localhost:8080/" + mode, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authData),
  });

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: "Could not authenticate user." }, { status: 500 });
  }

  const resData = await response.json();
  const token = resData.token;

  // or maybe store in session storage for SSO
  localStorage.setItem("token", token);
  const expiration = new Date();
  expiration.setHours(expiration.getHours()+1);
  localStorage.setItem('expiration', expiration.toISOString());

  // manage the token (soon)
  return redirect("/");
}
