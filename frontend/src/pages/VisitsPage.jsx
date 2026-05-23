import React from "react";

function getStatusLabel(status) {
  if (status === "scheduled") {
    return "Записан";
  }

  if (status === "completed") {
    return "Пройден";
  }

  if (status === "cancelled") {
    return "Отменен";
  }

  return status;
}

function VisitListSection({
  title,
  items,
  selectedAppointmentId,
  emptyText,
  onOpenAppointment,
}) {
  return (
    <div className="visit-section">
      <div className="panel-header">
        <h3>{title}</h3>
        <span>{items.length} приемов</span>
      </div>

      {items.length === 0 ? (
        <p className="placeholder">{emptyText}</p>
      ) : (
        <ul className="patient-list visit-list">
          {items.map((appointment) => (
            <li key={appointment.appointment_id} className="patient-item">
              <button
                type="button"
                className={
                  Number(selectedAppointmentId) === Number(appointment.appointment_id)
                    ? "visit-item active"
                    : "visit-item"
                }
                onClick={() => onOpenAppointment(appointment.appointment_id)}
              >
                <div>
                  <strong>{appointment.patient_name}</strong>
                  <p>
                    {appointment.appointment_date} · {appointment.start_time} -{" "}
                    {appointment.end_time}
                  </p>
                </div>
                <div className="meta">
                  <span>{getStatusLabel(appointment.status)}</span>
                  <span>{appointment.has_visit ? "Есть протокол" : "Новый прием"}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VisitsPage({
  doctors,
  appointments,
  selectedDoctorId,
  selectedAppointmentId,
  visitDetails,
  isDoctorLocked,
  isLoading,
  isSaving,
  error,
  success,
  onDoctorChange,
  onOpenAppointment,
  onSubmit,
}) {
  const [form, setForm] = React.useState({
    complaints: "",
    examination_notes: "",
    diagnosis_summary: "",
    treatment_plan: "",
    sick_leave_opened: false,
    medications: [],
    procedures: [],
  });

  React.useEffect(() => {
    setForm({
      complaints: visitDetails?.complaints || "",
      examination_notes: visitDetails?.examination_notes || "",
      diagnosis_summary: visitDetails?.diagnosis_summary || "",
      treatment_plan: visitDetails?.treatment_plan || "",
      sick_leave_opened: visitDetails?.sick_leave_opened || false,
      medications: visitDetails?.medications || [],
      procedures: visitDetails?.procedures || [],
    });
  }, [visitDetails]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleMedicationChange(index, field, value) {
    setForm((current) => ({
      ...current,
      medications: current.medications.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function handleProcedureChange(index, field, value) {
    setForm((current) => ({
      ...current,
      procedures: current.procedures.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addMedication() {
    setForm((current) => ({
      ...current,
      medications: [
        ...current.medications,
        { medication_name: "", dosage: "", instructions: "" },
      ],
    }));
  }

  function removeMedication(index) {
    setForm((current) => ({
      ...current,
      medications: current.medications.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addProcedure() {
    setForm((current) => ({
      ...current,
      procedures: [
        ...current.procedures,
        { procedure_name: "", notes: "", is_completed: false },
      ],
    }));
  }

  function removeProcedure(index) {
    setForm((current) => ({
      ...current,
      procedures: current.procedures.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
  }

  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  );

  return (
    <section className="hero-card">
      <div className="card-actions">
        <div>
          <p className="eyebrow">Кабинет врача</p>
          <h1>Проведение приема пациента</h1>
          <p className="lead">
            Врач выбирает запись на прием, фиксирует жалобы, осмотр, диагноз и
            план лечения, после чего прием считается завершенным.
          </p>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}
      {success ? <p className="status success">{success}</p> : null}

      <div className="details-layout">
        <section className="details-card details-info">
          <div className="panel-header">
            <h2>Записи врача</h2>
            <span>{appointments.length} приемов</span>
          </div>

          <label className="field-group">
            <span>Врач</span>
            <select
              value={selectedDoctorId}
              onChange={onDoctorChange}
              disabled={isDoctorLocked}
            >
              <option value="">Выбери врача</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.last_name} {doctor.first_name} {doctor.middle_name || ""}{" "}
                  {doctor.position_name ? `(${doctor.position_name})` : ""}
                </option>
              ))}
            </select>
          </label>

          {isLoading ? (
            <p className="placeholder">Загрузка записей...</p>
          ) : (
            <div className="stacked-sections">
              <VisitListSection
                title="Записанные приемы"
                items={scheduledAppointments}
                selectedAppointmentId={selectedAppointmentId}
                emptyText="Записанных приемов пока нет."
                onOpenAppointment={onOpenAppointment}
              />
              <VisitListSection
                title="Пройденные приемы"
                items={completedAppointments}
                selectedAppointmentId={selectedAppointmentId}
                emptyText="Пройденных приемов пока нет."
                onOpenAppointment={onOpenAppointment}
              />
            </div>
          )}
        </section>

        <section className="details-card">
          <div className="panel-header">
            <h2>Протокол приема</h2>
            <span>
              {visitDetails
                ? `${visitDetails.patient_name} · ${visitDetails.appointment_date}`
                : "Выбери запись"}
            </span>
          </div>

          {!visitDetails ? (
            <p className="placeholder">Сначала выбери запись на прием слева.</p>
          ) : (
            <form className="patient-form" onSubmit={handleSubmit}>
              <label className="field-group">
                <span>Жалобы</span>
                <textarea
                  name="complaints"
                  rows="4"
                  value={form.complaints}
                  onChange={handleChange}
                />
              </label>

              <label className="field-group">
                <span>Результаты осмотра</span>
                <textarea
                  name="examination_notes"
                  rows="5"
                  value={form.examination_notes}
                  onChange={handleChange}
                />
              </label>

              <label className="field-group">
                <span>Диагноз</span>
                <textarea
                  name="diagnosis_summary"
                  rows="4"
                  value={form.diagnosis_summary}
                  onChange={handleChange}
                />
              </label>

              <label className="field-group">
                <span>План лечения</span>
                <textarea
                  name="treatment_plan"
                  rows="5"
                  value={form.treatment_plan}
                  onChange={handleChange}
                />
              </label>

              <div className="subsection">
                <div className="subsection-header">
                  <h3>Медикаменты</h3>
                  <button type="button" className="ghost-button" onClick={addMedication}>
                    Добавить медикамент
                  </button>
                </div>

                {form.medications.length === 0 ? (
                  <p className="placeholder">Медикаменты пока не назначены.</p>
                ) : (
                  <div className="nested-form-list">
                    {form.medications.map((item, index) => (
                      <div key={index} className="nested-form-card">
                        <label className="field-group">
                          <span>Название препарата</span>
                          <input
                            value={item.medication_name || ""}
                            onChange={(event) =>
                              handleMedicationChange(index, "medication_name", event.target.value)
                            }
                          />
                        </label>
                        <label className="field-group">
                          <span>Дозировка</span>
                          <input
                            value={item.dosage || ""}
                            onChange={(event) =>
                              handleMedicationChange(index, "dosage", event.target.value)
                            }
                          />
                        </label>
                        <label className="field-group">
                          <span>Инструкция</span>
                          <textarea
                            rows="3"
                            value={item.instructions || ""}
                            onChange={(event) =>
                              handleMedicationChange(index, "instructions", event.target.value)
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => removeMedication(index)}
                        >
                          Удалить медикамент
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="subsection">
                <div className="subsection-header">
                  <h3>Процедуры</h3>
                  <button type="button" className="ghost-button" onClick={addProcedure}>
                    Добавить процедуру
                  </button>
                </div>

                {form.procedures.length === 0 ? (
                  <p className="placeholder">Процедуры пока не назначены.</p>
                ) : (
                  <div className="nested-form-list">
                    {form.procedures.map((item, index) => (
                      <div key={index} className="nested-form-card">
                        <label className="field-group">
                          <span>Название процедуры</span>
                          <input
                            value={item.procedure_name || ""}
                            onChange={(event) =>
                              handleProcedureChange(index, "procedure_name", event.target.value)
                            }
                          />
                        </label>
                        <label className="field-group">
                          <span>Примечание</span>
                          <textarea
                            rows="3"
                            value={item.notes || ""}
                            onChange={(event) =>
                              handleProcedureChange(index, "notes", event.target.value)
                            }
                          />
                        </label>
                        <label className="checkbox-row">
                          <input
                            type="checkbox"
                            checked={item.is_completed || false}
                            onChange={(event) =>
                              handleProcedureChange(index, "is_completed", event.target.checked)
                            }
                          />
                          <span>Процедура уже выполнена</span>
                        </label>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => removeProcedure(index)}
                        >
                          Удалить процедуру
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="sick_leave_opened"
                  checked={form.sick_leave_opened}
                  onChange={handleChange}
                />
                <span>Открыт больничный лист</span>
              </label>

              <button type="submit" disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Завершить прием"}
              </button>
            </form>
          )}
        </section>
      </div>
    </section>
  );
}

export default VisitsPage;
