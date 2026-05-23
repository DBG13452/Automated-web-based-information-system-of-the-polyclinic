import React from "react";

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value || "Не указано"}</strong>
    </div>
  );
}

function PatientDetailsPage({
  patient,
  isLoading,
  error,
  onBack,
  onEdit,
}) {
  return (
    <section className="hero-card">
      <div className="details-topbar">
        <button type="button" className="ghost-button" onClick={onBack}>
          Назад к списку
        </button>
        {patient ? (
          <button type="button" onClick={() => onEdit(patient.id)}>
            Редактировать
          </button>
        ) : null}
      </div>

      {error ? <p className="status error">{error}</p> : null}

      {isLoading ? (
        <p className="placeholder">Загрузка карточки пациента...</p>
      ) : patient ? (
        <div className="details-layout">
          <section className="details-card">
            <p className="eyebrow">Карточка пациента</p>
            <h1>
              {patient.last_name} {patient.first_name} {patient.middle_name || ""}
            </h1>
            <p className="lead">
              Здесь будут расширяться медицинская история, записи на прием и
              назначения. Пока мы завершаем базовую регистрационную карточку.
            </p>
          </section>

          <section className="details-card details-info">
            <div className="panel-header">
              <h2>Основные данные</h2>
              <span>ID #{patient.id}</span>
            </div>
            <InfoRow label="Дата рождения" value={patient.birth_date} />
            <InfoRow label="Пол" value={patient.gender} />
            <InfoRow label="Телефон" value={patient.phone} />
            <InfoRow label="Адрес" value={patient.address} />
            <InfoRow label="Полис" value={patient.policy_number} />
            <InfoRow label="СНИЛС" value={patient.snils} />
          </section>
        </div>
      ) : (
        <p className="placeholder">Пациент не найден.</p>
      )}
    </section>
  );
}

export default PatientDetailsPage;
