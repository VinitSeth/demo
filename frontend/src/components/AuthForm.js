import {
  Form,
  useSearchParams,
  useActionData,
  useNavigation,
} from "react-router-dom";

import classes from "./AuthForm.module.css";

function AuthForm() {
  const data = useActionData();
  const navigation = useNavigation();

  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const isSubmitting = navigation.state === "submitting";

  function handleSwitchAuthMode() {
    const newMode = mode === "login" ? "signup" : "login";
    setSearchParams({ mode: newMode });
  }

  function handleSSOClick(e) {
    e.preventDefault();
    setSearchParams({ mode: "sso" });
  }

  return (
    <Form method="post" className={classes.form}>
      <h1>{mode === "signup" ? "Create a new user" : "Log in"}</h1>
      {data && data.errors && (
        <ul>
          {Object.values(data.errors).map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      {data && data.message && <p>{data.message}</p>}
      <div>
        <p>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required />
        </p>
        {mode !== "sso" && (
          <p>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </p>
        )}
        {mode === "login" && (
          <p>
            <a href="#" onClick={handleSSOClick}>
              Login with SSO
            </a>
          </p>
        )}
      </div>
      <div className={classes.actions}>
        {mode === "sso" ? (
          <button
            type="button"
            onClick={() => setSearchParams({ mode: "signup" })}
          >
            Create new user
          </button>
        ) : (
          <button type="button" onClick={handleSwitchAuthMode}>
            {mode === "login" ? "Create new user" : "Login"}
          </button>
        )}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Save"}
        </button>
      </div>
    </Form>
  );
}

export default AuthForm;
