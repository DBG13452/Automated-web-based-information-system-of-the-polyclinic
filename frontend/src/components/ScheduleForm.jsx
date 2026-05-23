import React from "react";

const initialSchedule = {
  work_date: "",
  start_time: "",
  end_time: "",
  slot_duration_minutes: "30",
};

function ScheduleForm({ onSubmit, isSaving, error }) {
  const [form, setForm] = React.useState(initialSchedule);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      ...form,
      slot_duration_minutes: Number(form.slot_duration_minutes),
    });
    setForm(initialSchedule);
  }

  return (
    <div className="details-card details-info">
      <div className="panel-header">
        <h2>Добавить смену</h2>
        <span>Расписание</span>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      <form className="patient-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Дата смены</span>
          <input
            type="date"
            name="work_date"
            value={form.work_date}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field-group">
          <span>Время начала</span>
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field-group">
          <span>Время окончания</span>
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field-group">
          <span>Длительность приема</span>
          <input
            type="number"
            name="slot_duration_minutes"
            min="5"
            max="240"
            value={form.slot_duration_minutes}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Добавить смену"}
        </button>
      </form>
    </div>
  );
}

export default ScheduleForm;
