import React from "react";

function LoginPage({ isSaving, error, onSubmit }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      username,
      password,
    });
  }

  return (
    <section className="form-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Авторизация</p>
          <h2>Вход в систему поликлиники</h2>
          <p className="panel-copy">
            Войди под своей ролью, чтобы увидеть только доступные рабочие модули.
          </p>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      <form className="patient-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Логин</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Например: registrar"
            autoComplete="username"
            required
          />
        </label>

        <label className="field-group">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Вход..." : "Войти"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
