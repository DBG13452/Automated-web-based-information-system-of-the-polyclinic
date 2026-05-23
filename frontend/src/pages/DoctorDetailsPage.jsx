import React from "react";
import ScheduleForm from "../components/ScheduleForm";

function DoctorDetailsPage({
  doctor,
  isLoading,
  isSaving,
  error,
  scheduleError,
  canManageSchedule,
  onBack,
  onAddSchedule,
}) {
  return (
    <section className="hero-card">
      <div className="details-topbar">
        <button type="button" className="ghost-button" onClick={onBack}>
          Назад к врачам
        </button>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      {isLoading ? (
        <p className="placeholder">Загрузка карточки врача...</p>
      ) : doctor ? (
        <div className="details-layout">
          <section className="details-card">
            <p className="eyebrow">Карточка врача</p>
            <h1>
              {doctor.last_name} {doctor.first_name} {doctor.middle_name || ""}
            </h1>
            <p className="lead">
              {doctor.position_name || "Должность не указана"} ·{" "}
              {doctor.phone || "Телефон не указан"}
            </p>

            <div className="panel-header">
              <h2>Расписание</h2>
              <span>{doctor.schedules.length} смен</span>
            </div>

            {doctor.schedules.length === 0 ? (
              <p className="placeholder">Для врача пока не добавлены смены.</p>
            ) : (
              <ul className="patient-list">
                {doctor.schedules.map((schedule) => (
                  <li key={schedule.id} className="patient-item">
                    <div className="schedule-item-content">
                      <div>
                        <strong>{schedule.work_date}</strong>
                        <p>
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                      <div className="meta">
                        <span>Прием</span>
                        <span>{schedule.slot_duration_minutes} мин</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {canManageSchedule ? (
            <ScheduleForm
              onSubmit={onAddSchedule}
              isSaving={isSaving}
              error={scheduleError}
            />
          ) : null}
        </div>
      ) : (
        <p className="placeholder">Врач не найден.</p>
      )}
    </section>
  );
}

export default DoctorDetailsPage;
