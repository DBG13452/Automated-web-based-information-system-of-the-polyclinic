import React from "react";
import DoctorForm, { emptyDoctorForm } from "./components/DoctorForm";
import PatientForm, { emptyPatientForm } from "./components/PatientForm";
import useClinicApp from "./hooks/useClinicApp";
import { ROLE_LABELS, getRoleName, navigate } from "./hooks/useHashRoute";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorDetailsPage from "./pages/DoctorDetailsPage";
import DoctorsListPage from "./pages/DoctorsListPage";
import LoginPage from "./pages/LoginPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";
import PatientsListPage from "./pages/PatientsListPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import VisitsPage from "./pages/VisitsPage";
import "./styles/app.css";

function App() {
  const app = useClinicApp();

  function renderPage() {
    if (app.isAuthLoading) {
      return (
        <section className="hero-card">
          <p className="placeholder">Проверка сессии...</p>
        </section>
      );
    }

    if (!app.authUser || app.route.name === "login") {
      return <LoginPage isSaving={app.isSaving} error={app.authError} onSubmit={app.handleLogin} />;
    }

    if (app.route.module === "visits") {
      return (
        <VisitsPage
          doctors={app.doctors}
          appointments={app.doctorAppointments}
          selectedDoctorId={app.selectedVisitDoctorId}
          selectedAppointmentId={app.selectedVisitAppointmentId}
          visitDetails={app.selectedVisitDetails}
          isDoctorLocked={app.isDoctorLocked}
          isLoading={app.isListLoading || app.isDetailsLoading}
          isSaving={app.isSaving}
          error={app.visitError}
          success={app.success}
          onDoctorChange={app.handleVisitDoctorChange}
          onOpenAppointment={app.handleOpenVisitAppointment}
          onSubmit={app.handleCompleteVisit}
        />
      );
    }

    if (app.route.module === "appointments") {
      return (
        <AppointmentsPage
          patients={app.patients}
          doctors={app.doctors}
          appointments={app.appointments}
          selectedPatientId={app.selectedAppointmentPatientId}
          selectedDoctorId={app.selectedAppointmentDoctorId}
          selectedDate={app.selectedAppointmentDate}
          selectedTime={app.selectedAppointmentTime}
          reason={app.appointmentReason}
          availableDates={app.availableAppointmentDates}
          availableSlots={app.availableAppointmentSlots}
          isLoading={app.isListLoading}
          isSaving={app.isSaving}
          error={app.appointmentError}
          success={app.success}
          onPatientChange={(event) => app.setSelectedAppointmentPatientId(event.target.value)}
          onDoctorChange={(event) => {
            app.setSelectedAppointmentDoctorId(event.target.value);
            app.setSelectedAppointmentDate("");
            app.setSelectedAppointmentTime("");
            app.setAvailableAppointmentDates([]);
            app.setAvailableAppointmentSlots([]);
          }}
          onDateChange={(event) => {
            app.setSelectedAppointmentDate(event.target.value);
            app.setSelectedAppointmentTime("");
          }}
          onTimeChange={(event) => app.setSelectedAppointmentTime(event.target.value)}
          onReasonChange={(event) => app.setAppointmentReason(event.target.value)}
          onSubmit={app.handleCreateAppointment}
        />
      );
    }

    if (app.route.module === "reports") {
      return (
        <ReportsPage
          summary={app.reportsSummary}
          isLoading={app.isListLoading}
          error={app.listError}
        />
      );
    }

    if (app.route.module === "users") {
      return (
        <UsersPage
          users={app.users}
          roles={app.userRoles}
          availableDoctors={app.availableUserDoctors}
          isLoading={app.isListLoading}
          isSaving={app.isSaving}
          error={app.formError}
          success={app.success}
          onSubmit={app.handleCreateUser}
        />
      );
    }

    if (app.route.module === "doctors" && app.route.name === "create") {
      return (
        <DoctorForm
          title="Добавить врача"
          subtitle="Создай карточку сотрудника, который будет вести прием."
          initialValues={emptyDoctorForm}
          submitLabel="Добавить врача"
          isSaving={app.isSaving}
          error={app.formError}
          onSubmit={app.handleCreateDoctor}
          onCancel={() => navigate("/doctors")}
        />
      );
    }

    if (app.route.module === "doctors" && app.route.name === "details") {
      return (
        <DoctorDetailsPage
          doctor={app.selectedDoctor}
          isLoading={app.isDetailsLoading}
          isSaving={app.isSaving}
          error={app.detailsError}
          scheduleError={app.scheduleError}
          canManageSchedule={app.canManageSchedule}
          onBack={() => navigate("/doctors")}
          onAddSchedule={app.handleAddSchedule}
        />
      );
    }

    if (app.route.module === "doctors") {
      return (
        <DoctorsListPage
          doctors={app.doctors}
          search={app.doctorSearch}
          onSearchChange={(event) => app.setDoctorSearch(event.target.value)}
          onSearchSubmit={app.handleDoctorSearchSubmit}
          onOpenDoctor={(doctorId) => navigate(`/doctors/${doctorId}`)}
          onCreateDoctor={() => navigate("/doctors/new")}
          canCreateDoctor={app.canCreateDoctor}
          isLoading={app.isListLoading}
          error={app.doctorListError}
        />
      );
    }

    if (app.route.name === "create") {
      return (
        <PatientForm
          title="Добавить пациента"
          subtitle="Создай новую регистрационную карточку пациента."
          initialValues={emptyPatientForm}
          submitLabel="Добавить пациента"
          isSaving={app.isSaving}
          error={app.formError}
          success={app.success}
          onSubmit={app.handleCreatePatient}
          onCancel={() => navigate("/patients")}
        />
      );
    }

    if (app.route.name === "details") {
      return (
        <PatientDetailsPage
          patient={app.selectedPatient}
          isLoading={app.isDetailsLoading}
          error={app.detailsError}
          onBack={() => navigate("/patients")}
          onEdit={(patientId) => navigate(`/patients/${patientId}/edit`)}
        />
      );
    }

    if (app.route.name === "edit") {
      if (app.isDetailsLoading && !app.selectedPatient) {
        return (
          <section className="hero-card">
            <p className="placeholder">Загрузка формы редактирования...</p>
          </section>
        );
      }

      return (
        <PatientForm
          title="Редактировать пациента"
          subtitle="Обнови контактные и регистрационные данные пациента."
          initialValues={app.patientFormValues}
          submitLabel="Сохранить изменения"
          isSaving={app.isSaving}
          error={app.formError || app.detailsError}
          success={app.success}
          onSubmit={app.handleUpdatePatient}
          onCancel={() =>
            navigate(app.selectedPatient ? `/patients/${app.selectedPatient.id}` : "/patients")
          }
        />
      );
    }

    return (
      <PatientsListPage
        patients={app.patients}
        search={app.search}
        onSearchChange={(event) => app.setSearch(event.target.value)}
        onSearchSubmit={app.handleSearchSubmit}
        onOpenPatient={(patientId) => navigate(`/patients/${patientId}`)}
        onCreatePatient={() => navigate("/patients/new")}
        isLoading={app.isListLoading}
        error={app.listError}
        success={app.success}
      />
    );
  }

  return (
    <main className="app-shell">
      {app.authUser ? (
        <div className="top-nav-bar">
          <nav className="top-nav">
            {app.navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className={app.route.module === item.module ? "nav-link active" : "nav-link"}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="session-panel">
            <div className="session-copy">
              <strong>{app.authUser.username}</strong>
              <span>{ROLE_LABELS[getRoleName(app.authUser)] || app.authUser.role_name}</span>
            </div>
            <button
              type="button"
              className="ghost-button session-button"
              onClick={app.handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>
      ) : null}
      {renderPage()}
    </main>
  );
}

export default App;
