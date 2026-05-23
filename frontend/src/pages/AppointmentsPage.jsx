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

function AppointmentListSection({ title, items, emptyText }) {
  return (
    <section className="details-card">
      <div className="panel-header">
        <h2>{title}</h2>
        <span>{items.length} записей</span>
      </div>

      {items.length === 0 ? (
        <p className="placeholder">{emptyText}</p>
      ) : (
        <ul className="patient-list">
          {items.map((appointment) => (
            <li key={appointment.id} className="patient-item">
              <div className="schedule-item-content">
                <div>
                  <strong>
                    {appointment.appointment_date} · {appointment.start_time} -{" "}
                    {appointment.end_time}
                  </strong>
                  <p>
                    {appointment.patient_name} → {appointment.doctor_name}
                  </p>
                </div>
                <div className="meta">
                  <span>{getStatusLabel(appointment.status)}</span>
                  <span>{appointment.reason || "Без комментария"}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AppointmentsPage({
  patients,
  doctors,
  appointments,
  selectedPatientId,
  selectedDoctorId,
  selectedDate,
  selectedTime,
  reason,
  availableDates,
  availableSlots,
  isLoading,
  isSaving,
  error,
  success,
  onPatientChange,
  onDoctorChange,
  onDateChange,
  onTimeChange,
  onReasonChange,
  onSubmit,
}) {
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
          <p className="eyebrow">Регистратура</p>
          <h1>Запись пациента на прием</h1>
          <p className="lead">
            Выбери пациента, врача и свободное время из расписания, чтобы
            создать запись на прием.
          </p>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}
      {success ? <p className="status success">{success}</p> : null}

      <div className="details-layout">
        <section className="details-card details-info">
          <div className="panel-header">
            <h2>Новая запись</h2>
            <span>Талон</span>
          </div>

          <form className="patient-form" onSubmit={onSubmit}>
            <label className="field-group">
              <span>Пациент</span>
              <select value={selectedPatientId} onChange={onPatientChange} required>
                <option value="">Выбери пациента</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.last_name} {patient.first_name} {patient.middle_name || ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Врач</span>
              <select value={selectedDoctorId} onChange={onDoctorChange} required>
                <option value="">Выбери врача</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.last_name} {doctor.first_name} {doctor.middle_name || ""}{" "}
                    {doctor.position_name ? `(${doctor.position_name})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Дата приема</span>
              <select
                value={selectedDate}
                onChange={onDateChange}
                required
                disabled={!selectedDoctorId}
              >
                <option value="">Выбери дату</option>
                {availableDates.map((dateValue) => (
                  <option key={dateValue} value={dateValue}>
                    {dateValue}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Время приема</span>
              <select
                value={selectedTime}
                onChange={onTimeChange}
                required
                disabled={!selectedDate}
              >
                <option value="">Выбери время</option>
                {availableSlots.map((slot) => (
                  <option key={`${slot.start_time}-${slot.end_time}`} value={slot.start_time}>
                    {slot.start_time} - {slot.end_time}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Причина обращения</span>
              <textarea
                rows="4"
                value={reason}
                onChange={onReasonChange}
                placeholder="Например: первичный прием, справка, консультация"
              />
            </label>

            <button type="submit" disabled={isSaving || isLoading}>
              {isSaving ? "Сохранение..." : "Записать на прием"}
            </button>
          </form>
        </section>

        <div className="stacked-sections">
          {isLoading ? (
            <section className="details-card">
              <p className="placeholder">Загрузка записей...</p>
            </section>
          ) : (
            <>
              <AppointmentListSection
                title="Записанные приемы"
                items={scheduledAppointments}
                emptyText="Записанных приемов пока нет."
              />
              <AppointmentListSection
                title="Пройденные приемы"
                items={completedAppointments}
                emptyText="Пройденных приемов пока нет."
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default AppointmentsPage;
