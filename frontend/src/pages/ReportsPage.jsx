import React from "react";

function StatCard({ label, value }) {
  return (
    <div className="report-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReportsPage({ summary, isLoading, error }) {
  const overview = summary?.overview;

  return (
    <section className="hero-card">
      <div className="card-actions">
        <div>
          <p className="eyebrow">Аналитика</p>
          <h1>Отчеты по работе поликлиники</h1>
          <p className="lead">
            Здесь администратор видит сводную картину по приемам, врачам,
            пациентам и назначениям.
          </p>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      {isLoading ? (
        <p className="placeholder">Загрузка отчетов...</p>
      ) : summary ? (
        <div className="report-layout">
          <section className="details-card details-info">
            <div className="panel-header">
              <h2>Сводка системы</h2>
              <span>Общие показатели</span>
            </div>

            <div className="report-grid">
              <StatCard label="Пациентов" value={overview.total_patients} />
              <StatCard label="Врачей" value={overview.total_doctors} />
              <StatCard label="Всего приемов" value={overview.total_appointments} />
              <StatCard label="Записанных приемов" value={overview.scheduled_appointments} />
              <StatCard label="Пройденных приемов" value={overview.completed_appointments} />
              <StatCard label="Протоколов приема" value={overview.total_visits} />
              <StatCard label="Назначений лекарств" value={overview.total_medications} />
              <StatCard label="Назначений процедур" value={overview.total_procedures} />
              <StatCard label="Выполненных процедур" value={overview.completed_procedures} />
            </div>
          </section>

          <div className="stacked-sections">
            <section className="details-card">
              <div className="panel-header">
                <h2>Нагрузка по врачам</h2>
                <span>{summary.doctor_stats.length} врачей</span>
              </div>
              {summary.doctor_stats.length === 0 ? (
                <p className="placeholder">Данных по врачам пока нет.</p>
              ) : (
                <ul className="patient-list">
                  {summary.doctor_stats.map((item) => (
                    <li key={item.doctor_id} className="patient-item">
                      <div className="schedule-item-content">
                        <div>
                          <strong>{item.doctor_name}</strong>
                          <p>{item.position_name || "Должность не указана"}</p>
                        </div>
                        <div className="meta">
                          <span>Всего: {item.total_appointments}</span>
                          <span>Записан: {item.scheduled_appointments}</span>
                          <span>Пройден: {item.completed_appointments}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="details-card">
              <div className="panel-header">
                <h2>Активные пациенты</h2>
                <span>{summary.patient_stats.length} записей</span>
              </div>
              {summary.patient_stats.length === 0 ? (
                <p className="placeholder">Данных по пациентам пока нет.</p>
              ) : (
                <ul className="patient-list">
                  {summary.patient_stats.map((item) => (
                    <li key={item.patient_id} className="patient-item">
                      <div className="schedule-item-content">
                        <div>
                          <strong>{item.patient_name}</strong>
                          <p>ID #{item.patient_id}</p>
                        </div>
                        <div className="meta">
                          <span>Всего посещений: {item.total_appointments}</span>
                          <span>Пройдено: {item.completed_appointments}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="details-card">
              <div className="panel-header">
                <h2>Частые медикаменты</h2>
                <span>{summary.medication_stats.length} позиций</span>
              </div>
              {summary.medication_stats.length === 0 ? (
                <p className="placeholder">Назначений лекарств пока нет.</p>
              ) : (
                <ul className="patient-list">
                  {summary.medication_stats.map((item) => (
                    <li key={item.medication_name} className="patient-item">
                      <div className="schedule-item-content">
                        <div>
                          <strong>{item.medication_name}</strong>
                        </div>
                        <div className="meta">
                          <span>Назначений: {item.total_prescriptions}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="details-card">
              <div className="panel-header">
                <h2>Процедуры</h2>
                <span>{summary.procedure_stats.length} позиций</span>
              </div>
              {summary.procedure_stats.length === 0 ? (
                <p className="placeholder">Назначений процедур пока нет.</p>
              ) : (
                <ul className="patient-list">
                  {summary.procedure_stats.map((item) => (
                    <li key={item.procedure_name} className="patient-item">
                      <div className="schedule-item-content">
                        <div>
                          <strong>{item.procedure_name}</strong>
                        </div>
                        <div className="meta">
                          <span>Назначено: {item.total_assigned}</span>
                          <span>Выполнено: {item.total_completed}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : (
        <p className="placeholder">Отчеты пока недоступны.</p>
      )}
    </section>
  );
}

export default ReportsPage;
