
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRoam } from "../context/useRoam";

function Auth() {
  const navigate = useNavigate();
  const { login, register } = useRoam();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }

      navigate("/discover", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="inner-page">
      <section className="diary-paper">
        <p className="eyebrow">YOUR NEXT CHAPTER</p>

        <h1>{isRegistering ? "Join ROAM." : "Welcome back."}</h1>

        <p>
          {isRegistering
            ? "Create your account and start collecting places worth remembering."
            : "Your places, plans and little travel stories are waiting."}
        </p>

        <form className="diary-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Your name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="What should we call you?"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              minLength={8}
              required
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "One moment..."
              : isRegistering
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <p>
          {isRegistering
            ? "Already have an account? "
            : "New around here? "}

          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setIsRegistering((current) => !current);
              setError("");
            }}
          >
            {isRegistering ? "Log in" : "Create an account"}
          </button>
        </p>

        <Link to="/discover">Explore ROAM first</Link>
      </section>
    </main>
  );
}

export default Auth;
