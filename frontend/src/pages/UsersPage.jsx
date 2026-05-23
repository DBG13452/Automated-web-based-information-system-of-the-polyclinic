import React from "react";

const initialForm = {
  username: "",
  password: "",
  role_name: "doctor",
  employee_id: "",
};

function UsersPage({
  users,
  roles,
  availableDoctors,
  isLoading,
  isSaving,
  error,
  success,
  onSubmit,
}) {
  const [form, setForm] = React.useState(initialForm);

  React.useEffect(() => {
    if (form.role_name !== "doctor" && form.employee_id) {
      setForm((current) => ({
        ...current,
        employee_id: "",
      }));
    }
  }, [form.employee_id, form.role_name]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      username: form.username,
      password: form.password,
      role_name: form.role_name,
      employee_id: form.role_name === "doctor" && form.employee_id
        ? Number(form.employee_id)
        : null,
    });
    setForm((current) => ({
      ...initialForm,
      role_name: current.role_name,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <section className="hero-card">
      <div className="card-actions">
        <div>
          <p className="eyebrow">Администрирование</p>
          <h1>Пользователи системы</h1>
          <p className="lead">
            Здесь администратор создает учетные записи и привязывает врачей к
            их карточкам сотрудников.
          </p>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}
      {success ? <p className="status success">{success}</p> : null}

      <div className="details-layout">
        <section className="details-card details-info">
          <div className="panel-header">
            <h2>Новый пользователь</h2>
            <span>Учетная запись</span>
          </div>

          <form className="patient-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Логин</span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Например: doctor-ivanov"
                required
              />
            </label>

            <label className="field-group">
              <span>Пароль</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                required
              />
            </label>

            <label className="field-group">
              <span>Роль</span>
              <select name="role_name" value={form.role_name} onChange={handleChange}>
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>

            {form.role_name === "doctor" ? (
              <label className="field-group">
                <span>Привязанный врач</span>
                <select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выбери врача</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                      {doctor.position_name ? ` (${doctor.position_name})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <button type="submit" disabled={isSaving || isLoading}>
              {isSaving ? "Сохранение..." : "Создать пользователя"}
            </button>
          </form>
        </section>

        <section className="details-card">
          <div className="panel-header">
            <h2>Текущие пользователи</h2>
            <span>{users.length} записей</span>
          </div>

          {isLoading ? (
            <p className="placeholder">Загрузка пользователей...</p>
          ) : users.length === 0 ? (
            <p className="placeholder">Пользователи пока не созданы.</p>
          ) : (
            <ul className="patient-list">
              {users.map((user) => (
                <li key={user.id} className="patient-item">
                  <div className="schedule-item-content">
                    <div>
                      <strong>{user.username}</strong>
                      <p>
                        {user.role_name}
                        {user.employee_name ? ` · ${user.employee_name}` : ""}
                      </p>
                    </div>
                    <div className="meta">
                      <span>{user.is_active ? "active" : "inactive"}</span>
                      <span>ID #{user.id}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}

export default UsersPage;
