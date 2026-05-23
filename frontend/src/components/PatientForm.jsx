import React from "react";

export const emptyPatientForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  birth_date: "",
  gender: "",
  phone: "",
  address: "",
  policy_number: "",
  snils: "",
};

function PatientForm({
  title,
  subtitle,
  initialValues,
  submitLabel,
  isSaving,
  error,
  success,
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
      {success ? <p className="status success">{success}</p> : null}

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
          name="birth_date"
          type="date"
          value={form.birth_date}
          onChange={handleChange}
        />
        <input
          name="gender"
          placeholder="Пол"
          value={form.gender}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Адрес"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="policy_number"
          placeholder="Номер полиса"
          value={form.policy_number}
          onChange={handleChange}
        />
        <input
          name="snils"
          placeholder="СНИЛС"
          value={form.snils}
          onChange={handleChange}
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

export default PatientForm;
