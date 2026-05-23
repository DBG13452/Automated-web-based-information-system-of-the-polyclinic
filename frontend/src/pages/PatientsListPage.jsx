import React from "react";

function PatientsListPage({
  patients,
  search,
  onSearchChange,
  onSearchSubmit,
  onOpenPatient,
  onCreatePatient,
  isLoading,
  error,
  success,
}) {
  return (
    <section className="hero-card">
      <div className="card-actions">
        <div>
          <p className="eyebrow">Модуль пациентов</p>
          <h1>Автоматизированная информационная система поликлиники</h1>
          <p className="lead">
            Здесь регистратор может искать пациентов, открывать карточки и
            переходить к созданию новых записей.
          </p>
        </div>
        <button type="button" onClick={onCreatePatient}>
          Добавить пациента
        </button>
      </div>

      <form className="search-bar" onSubmit={onSearchSubmit}>
        <input
          type="text"
          placeholder="Поиск по ФИО, телефону, полису или СНИЛС"
          value={search}
          onChange={onSearchChange}
        />
        <button type="submit">Найти</button>
      </form>

      {error ? <p className="status error">{error}</p> : null}
      {success ? <p className="status success">{success}</p> : null}

      <div className="patients-panel">
        <div className="panel-header">
          <h2>Список пациентов</h2>
          <span>{patients.length} записей</span>
        </div>

        {isLoading ? (
          <p className="placeholder">Загрузка пациентов...</p>
        ) : patients.length === 0 ? (
          <p className="placeholder">Пациенты пока не добавлены.</p>
        ) : (
          <ul className="patient-list">
            {patients.map((patient) => (
              <li key={patient.id} className="patient-item patient-item-button">
                <button type="button" onClick={() => onOpenPatient(patient.id)}>
                  <div>
                    <strong>
                      {patient.last_name} {patient.first_name}{" "}
                      {patient.middle_name || ""}
                    </strong>
                    <p>
                      {patient.birth_date || "Дата рождения не указана"} ·{" "}
                      {patient.phone || "Телефон не указан"}
                    </p>
                  </div>
                  <div className="meta">
                    <span>ID #{patient.id}</span>
                    <span>{patient.policy_number || "Без полиса"}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default PatientsListPage;
