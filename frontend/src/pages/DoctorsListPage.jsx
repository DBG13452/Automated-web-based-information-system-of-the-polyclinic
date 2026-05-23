import React from "react";

function DoctorsListPage({
  doctors,
  search,
  onSearchChange,
  onSearchSubmit,
  onOpenDoctor,
  onCreateDoctor,
  canCreateDoctor,
  isLoading,
  error,
}) {
  return (
    <section className="hero-card">
      <div className="card-actions">
        <div>
          <p className="eyebrow">Модуль врачей</p>
          <h1>Сотрудники и расписание</h1>
          <p className="lead">
            Здесь мы заводим врачей и готовим для них расписание, на основе
            которого дальше будет строиться запись пациентов на прием.
          </p>
        </div>
        {canCreateDoctor ? (
          <button type="button" onClick={onCreateDoctor}>
            Добавить врача
          </button>
        ) : null}
      </div>

      <form className="search-bar" onSubmit={onSearchSubmit}>
        <input
          type="text"
          placeholder="Поиск по ФИО, телефону или должности"
          value={search}
          onChange={onSearchChange}
        />
        <button type="submit">Найти</button>
      </form>

      {error ? <p className="status error">{error}</p> : null}

      <div className="patients-panel">
        <div className="panel-header">
          <h2>Список врачей</h2>
          <span>{doctors.length} записей</span>
        </div>

        {isLoading ? (
          <p className="placeholder">Загрузка врачей...</p>
        ) : doctors.length === 0 ? (
          <p className="placeholder">Врачи пока не добавлены.</p>
        ) : (
          <ul className="patient-list">
            {doctors.map((doctor) => (
              <li key={doctor.id} className="patient-item">
                <button type="button" onClick={() => onOpenDoctor(doctor.id)}>
                  <div>
                    <strong>
                      {doctor.last_name} {doctor.first_name}{" "}
                      {doctor.middle_name || ""}
                    </strong>
                    <p>
                      {doctor.position_name || "Должность не указана"} ·{" "}
                      {doctor.phone || "Телефон не указан"}
                    </p>
                  </div>
                  <div className="meta">
                    <span>ID #{doctor.id}</span>
                    <span>Врач</span>
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

export default DoctorsListPage;
