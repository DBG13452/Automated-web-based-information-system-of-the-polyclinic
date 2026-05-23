import React from "react";

export const emptyDoctorForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  phone: "",
  position_name: "",
};

function DoctorForm({
  title,
  subtitle,
  initialValues,
  submitLabel,
  isSaving,
  error,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = React.useState(initialValues);

  React.useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <section className="form-card">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p className="panel-copy">{subtitle}</p>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      <form className="patient-form" onSubmit={handleSubmit}>
        <input
          name="last_name"
          placeholder="Фамилия"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="first_name"
          placeholder="Имя"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="middle_name"
          placeholder="Отчество"
          value={form.middle_name}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="position_name"
          placeholder="Должность или специализация"
          value={form.position_name}
          onChange={handleChange}
          required
        />

        <div className="form-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Сохранение..." : submitLabel}
          </button>
          <button type="button" className="ghost-button" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>
    </section>
  );
}

export default DoctorForm;
