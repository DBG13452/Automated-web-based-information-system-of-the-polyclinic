import React from "react";
import {
  createAppointment,
  fetchAppointments,
  fetchAvailableSlots,
} from "../api/appointments";
import { clearAuthToken, fetchMe, hasAuthToken, login, setAuthToken } from "../api/auth";
import {
  createDoctor,
  createDoctorSchedule,
  fetchDoctorById,
  fetchDoctors,
} from "../api/doctors";
import {
  createPatient,
  fetchPatientById,
  fetchPatients,
  updatePatient,
} from "../api/patients";
import { fetchReportsSummary } from "../api/reports";
import { createUser, fetchUserMeta, fetchUsers } from "../api/users";
import {
  completeVisit,
  fetchDoctorAppointments,
  fetchVisitDetails,
} from "../api/visits";
import { emptyPatientForm } from "../components/PatientForm";
import {
  canAccessRoute,
  getDefaultPathForUser,
  getRoleName,
  getNavigationItems,
  navigate,
  parseRoute,
} from "./useHashRoute";

function buildPatientPayload(form) {
  return {
    ...form,
    birth_date: form.birth_date || null,
    middle_name: form.middle_name || null,
    gender: form.gender || null,
    phone: form.phone || null,
    address: form.address || null,
    policy_number: form.policy_number || null,
    snils: form.snils || null,
  };
}

function buildPatientForm(patient) {
  if (!patient) {
    return emptyPatientForm;
  }

  return {
    first_name: patient.first_name || "",
    last_name: patient.last_name || "",
    middle_name: patient.middle_name || "",
    birth_date: patient.birth_date || "",
    gender: patient.gender || "",
    phone: patient.phone || "",
    address: patient.address || "",
    policy_number: patient.policy_number || "",
    snils: patient.snils || "",
  };
}

function resetClinicState(setters) {
  setters.setPatients([]);
  setters.setDoctors([]);
  setters.setAppointments([]);
  setters.setReportsSummary(null);
  setters.setUsers([]);
  setters.setUserRoles([]);
  setters.setAvailableUserDoctors([]);
  setters.setDoctorAppointments([]);
  setters.setSelectedPatient(null);
  setters.setSelectedDoctor(null);
  setters.setSelectedVisitDetails(null);
  setters.setSelectedVisitAppointmentId("");
  setters.setSelectedVisitDoctorId("");
  setters.setSelectedAppointmentPatientId("");
  setters.setSelectedAppointmentDoctorId("");
  setters.setSelectedAppointmentDate("");
  setters.setSelectedAppointmentTime("");
  setters.setAppointmentReason("");
  setters.setAvailableAppointmentDates([]);
  setters.setAvailableAppointmentSlots([]);
  setters.setSearch("");
  setters.setDoctorSearch("");
}

export default function useClinicApp() {
  const [route, setRoute] = React.useState(parseRoute);
  const [authUser, setAuthUser] = React.useState(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [patients, setPatients] = React.useState([]);
  const [doctors, setDoctors] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [reportsSummary, setReportsSummary] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [userRoles, setUserRoles] = React.useState([]);
  const [availableUserDoctors, setAvailableUserDoctors] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [doctorSearch, setDoctorSearch] = React.useState("");
  const [selectedAppointmentPatientId, setSelectedAppointmentPatientId] = React.useState("");
  const [selectedAppointmentDoctorId, setSelectedAppointmentDoctorId] = React.useState("");
  const [selectedAppointmentDate, setSelectedAppointmentDate] = React.useState("");
  const [selectedAppointmentTime, setSelectedAppointmentTime] = React.useState("");
  const [appointmentReason, setAppointmentReason] = React.useState("");
  const [availableAppointmentDates, setAvailableAppointmentDates] = React.useState([]);
  const [availableAppointmentSlots, setAvailableAppointmentSlots] = React.useState([]);
  const [doctorAppointments, setDoctorAppointments] = React.useState([]);
  const [selectedVisitDoctorId, setSelectedVisitDoctorId] = React.useState("");
  const [selectedVisitAppointmentId, setSelectedVisitAppointmentId] = React.useState("");
  const [selectedVisitDetails, setSelectedVisitDetails] = React.useState(null);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [selectedDoctor, setSelectedDoctor] = React.useState(null);
  const [isListLoading, setIsListLoading] = React.useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [authError, setAuthError] = React.useState("");
  const [listError, setListError] = React.useState("");
  const [doctorListError, setDoctorListError] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [detailsError, setDetailsError] = React.useState("");
  const [scheduleError, setScheduleError] = React.useState("");
  const [appointmentError, setAppointmentError] = React.useState("");
  const [visitError, setVisitError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const setters = {
    setPatients,
    setDoctors,
    setAppointments,
    setReportsSummary,
    setUsers,
    setUserRoles,
    setAvailableUserDoctors,
    setDoctorAppointments,
    setSelectedPatient,
    setSelectedDoctor,
    setSelectedVisitDetails,
    setSelectedVisitAppointmentId,
    setSelectedVisitDoctorId,
    setSelectedAppointmentPatientId,
    setSelectedAppointmentDoctorId,
    setSelectedAppointmentDate,
    setSelectedAppointmentTime,
    setAppointmentReason,
    setAvailableAppointmentDates,
    setAvailableAppointmentSlots,
    setSearch,
    setDoctorSearch,
  };

  const loadPatients = React.useCallback(async (query = "") => {
    setIsListLoading(true);
    setListError("");

    try {
      const data = await fetchPatients(query);
      setPatients(data.items);
    } catch (loadError) {
      setListError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке пациентов."
          : "Не удалось загрузить пациентов. Проверь, что backend запущен."
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const loadAppointments = React.useCallback(async () => {
    setIsListLoading(true);
    setAppointmentError("");

    try {
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchDoctors(),
      ]);
      setAppointments(appointmentsData.items);
      setPatients(patientsData.items);
      setDoctors(doctorsData.items);
    } catch (loadError) {
      setAppointmentError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке записей на прием."
          : loadError?.message || "Не удалось загрузить данные для записи на прием."
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const loadDoctors = React.useCallback(async (query = "") => {
    setIsListLoading(true);
    setDoctorListError("");

    try {
      const data = await fetchDoctors(query);
      setDoctors(data.items);
    } catch (loadError) {
      setDoctorListError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке врачей."
          : loadError?.message || "Не удалось загрузить врачей."
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const loadReportsModule = React.useCallback(async () => {
    setIsListLoading(true);
    setListError("");

    try {
      const summary = await fetchReportsSummary();
      setReportsSummary(summary);
    } catch (loadError) {
      setListError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке отчетов."
          : loadError?.message || "Не удалось загрузить отчеты."
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const loadUsersModule = React.useCallback(async () => {
    setIsListLoading(true);
    setFormError("");

    try {
      const [usersData, metaData] = await Promise.all([fetchUsers(), fetchUserMeta()]);
      setUsers(usersData.items);
      setUserRoles(metaData.roles);
      setAvailableUserDoctors(metaData.available_doctors);
    } catch (loadError) {
      setFormError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке пользователей."
          : loadError?.message || "Не удалось загрузить пользователей."
      );
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const loadVisitsModule = React.useCallback(async () => {
    setIsListLoading(true);
    setVisitError("");

    try {
      if (getRoleName(authUser) === "doctor") {
        if (!authUser.employee_id) {
          throw new Error("Для учетной записи врача не назначена карточка сотрудника.");
        }

        const [doctor, appointmentsData] = await Promise.all([
          fetchDoctorById(authUser.employee_id),
          fetchDoctorAppointments(authUser.employee_id),
        ]);

        setDoctors([doctor]);
        setSelectedVisitDoctorId(String(authUser.employee_id));
        setDoctorAppointments(appointmentsData.items);
        return;
      }

      const doctorsData = await fetchDoctors();
      setDoctors(doctorsData.items);
    } catch (loadError) {
      setVisitError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке данных врача."
          : loadError?.message || "Не удалось загрузить данные для проведения приема."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [authUser]);

  const loadPatientDetails = React.useCallback(async (patientId) => {
    setIsDetailsLoading(true);
    setDetailsError("");

    try {
      const patient = await fetchPatientById(patientId);
      setSelectedPatient(patient);
      return patient;
    } catch (loadError) {
      setDetailsError(loadError?.message || "Не удалось загрузить карточку пациента.");
      setSelectedPatient(null);
      return null;
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  const loadDoctorDetails = React.useCallback(async (doctorId) => {
    setIsDetailsLoading(true);
    setDetailsError("");

    try {
      const doctor = await fetchDoctorById(doctorId);
      setSelectedDoctor(doctor);
      return doctor;
    } catch (loadError) {
      setDetailsError(loadError?.message || "Не удалось загрузить карточку врача.");
      setSelectedDoctor(null);
      return null;
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!window.location.hash) {
      navigate("/login");
    }

    function handleHashChange() {
      setRoute(parseRoute());
      setFormError("");
      setDetailsError("");
      setScheduleError("");
      setAppointmentError("");
      setVisitError("");
      setSuccess("");
    }

    function handleUnauthorized() {
      clearAuthToken();
      setAuthUser(null);
      setAuthError("Сессия истекла. Войди снова.");
      resetClinicState(setters);
      navigate("/login");
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  React.useEffect(() => {
    async function bootstrapAuth() {
      if (!hasAuthToken()) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const user = await fetchMe();
        setAuthUser(user);
      } catch {
        clearAuthToken();
        setAuthUser(null);
        setAuthError("Сохраненная сессия недействительна. Войди снова.");
      } finally {
        setIsAuthLoading(false);
      }
    }

    void bootstrapAuth();
  }, []);

  React.useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!authUser) {
      if (route.name !== "login") {
        navigate("/login");
      }
      return;
    }

    if (route.name === "login") {
      navigate(getDefaultPathForUser(authUser));
      return;
    }

    if (!canAccessRoute(authUser, route)) {
      navigate(getDefaultPathForUser(authUser));
    }
  }, [authUser, isAuthLoading, route]);

  React.useEffect(() => {
    if (isAuthLoading || !authUser || route.name === "login" || !canAccessRoute(authUser, route)) {
      return;
    }

    if (route.module === "patients" && route.name === "list") {
      void loadPatients(search);
      return;
    }
    if (route.module === "patients" && (route.name === "details" || route.name === "edit")) {
      void loadPatientDetails(route.patientId);
      return;
    }
    if (route.module === "doctors" && route.name === "list") {
      void loadDoctors(doctorSearch);
      return;
    }
    if (route.module === "doctors" && route.name === "details") {
      void loadDoctorDetails(route.doctorId);
      return;
    }
    if (route.module === "appointments") {
      void loadAppointments();
      return;
    }
    if (route.module === "reports") {
      void loadReportsModule();
      return;
    }
    if (route.module === "users") {
      void loadUsersModule();
      return;
    }
    if (route.module === "visits") {
      void loadVisitsModule();
    }
  }, [
    authUser,
    doctorSearch,
    isAuthLoading,
    loadAppointments,
    loadDoctorDetails,
    loadDoctors,
    loadPatientDetails,
    loadPatients,
    loadReportsModule,
    loadUsersModule,
    loadVisitsModule,
    route,
    search,
  ]);

  React.useEffect(() => {
    async function loadDoctorScheduleDates() {
      if (!selectedAppointmentDoctorId || !authUser) {
        setAvailableAppointmentDates([]);
        return;
      }

      try {
        const doctor = await fetchDoctorById(selectedAppointmentDoctorId);
        setAvailableAppointmentDates(
          Array.from(new Set(doctor.schedules.map((schedule) => schedule.work_date)))
        );
      } catch (loadError) {
        setAppointmentError(
          loadError?.name === "AbortError"
            ? "Сервер слишком долго отвечает при загрузке дат приема."
            : loadError?.message || "Не удалось загрузить даты приема врача."
        );
        setAvailableAppointmentDates([]);
      }
    }

    void loadDoctorScheduleDates();
  }, [authUser, selectedAppointmentDoctorId]);

  React.useEffect(() => {
    async function loadSlots() {
      if (!selectedAppointmentDoctorId || !selectedAppointmentDate) {
        setAvailableAppointmentSlots([]);
        return;
      }

      try {
        const slots = await fetchAvailableSlots(
          selectedAppointmentDoctorId,
          selectedAppointmentDate
        );
        setAvailableAppointmentSlots(slots);
      } catch (loadError) {
        setAppointmentError(
          loadError?.name === "AbortError"
            ? "Сервер слишком долго отвечает при загрузке свободного времени."
            : loadError?.message || "Не удалось загрузить свободные слоты."
        );
        setAvailableAppointmentSlots([]);
      }
    }

    void loadSlots();
  }, [selectedAppointmentDate, selectedAppointmentDoctorId]);

  async function handleSearchSubmit(event) {
    event.preventDefault();
    await loadPatients(search);
  }

  async function handleDoctorSearchSubmit(event) {
    event.preventDefault();
    await loadDoctors(doctorSearch);
  }

  async function handleVisitDoctorChange(event) {
    const doctorId = event.target.value;
    setSelectedVisitDoctorId(doctorId);
    setSelectedVisitAppointmentId("");
    setSelectedVisitDetails(null);
    setVisitError("");

    if (!doctorId) {
      setDoctorAppointments([]);
      return;
    }

    setIsListLoading(true);
    try {
      const data = await fetchDoctorAppointments(doctorId);
      setDoctorAppointments(data.items);
    } catch (loadError) {
      setVisitError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке записей врача."
          : loadError?.message || "Не удалось загрузить записи врача."
      );
      setDoctorAppointments([]);
    } finally {
      setIsListLoading(false);
    }
  }

  async function handleOpenVisitAppointment(appointmentId) {
    setSelectedVisitAppointmentId(String(appointmentId));
    setIsDetailsLoading(true);
    setVisitError("");

    try {
      const details = await fetchVisitDetails(appointmentId);
      setSelectedVisitDetails(details);
    } catch (loadError) {
      setVisitError(
        loadError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при загрузке данных приема."
          : loadError?.message || "Не удалось загрузить протокол приема."
      );
      setSelectedVisitDetails(null);
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function resetAppointmentForm() {
    setSelectedAppointmentPatientId("");
    setSelectedAppointmentDoctorId("");
    setSelectedAppointmentDate("");
    setSelectedAppointmentTime("");
    setAppointmentReason("");
    setAvailableAppointmentDates([]);
    setAvailableAppointmentSlots([]);
  }

  async function handleLogin(credentials) {
    setIsSaving(true);
    setAuthError("");

    try {
      const response = await login(credentials.username, credentials.password);
      setAuthToken(response.access_token);
      setAuthUser(response.user);
      navigate(getDefaultPathForUser(response.user));
    } catch (saveError) {
      setAuthError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при входе."
          : saveError?.message || "Не удалось выполнить вход."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    clearAuthToken();
    setAuthUser(null);
    setAuthError("");
    setSuccess("");
    resetClinicState(setters);
    navigate("/login");
  }

  async function handleCreatePatient(form) {
    setIsSaving(true);
    setFormError("");

    try {
      const createdPatient = await createPatient(buildPatientPayload(form));
      setPatients((current) => [createdPatient, ...current]);
      navigate(`/patients/${createdPatient.id}`);
    } catch (saveError) {
      setFormError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при сохранении пациента."
          : saveError?.message || "Не удалось сохранить пациента. Проверь введенные данные."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdatePatient(form) {
    if (!route.patientId) {
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const updatedPatient = await updatePatient(route.patientId, buildPatientPayload(form));
      setSelectedPatient(updatedPatient);
      setPatients((current) =>
        current.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient))
      );
      navigate(`/patients/${updatedPatient.id}`);
    } catch (saveError) {
      setFormError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при обновлении пациента."
          : saveError?.message || "Не удалось обновить данные пациента."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateDoctor(form) {
    setIsSaving(true);
    setFormError("");

    try {
      const createdDoctor = await createDoctor(form);
      setDoctors((current) => [createdDoctor, ...current]);
      setAvailableUserDoctors((current) =>
        [
          ...current,
          {
            id: createdDoctor.id,
            full_name: [createdDoctor.last_name, createdDoctor.first_name, createdDoctor.middle_name]
              .filter(Boolean)
              .join(" "),
            position_name: createdDoctor.position_name || null,
          },
        ].sort((left, right) => left.full_name.localeCompare(right.full_name))
      );
      navigate(`/doctors/${createdDoctor.id}`);
    } catch (saveError) {
      setFormError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при сохранении врача."
          : saveError?.message || "Не удалось сохранить врача. Проверь введенные данные."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSchedule(form) {
    if (!route.doctorId) {
      return;
    }

    setIsSaving(true);
    setScheduleError("");

    try {
      const createdSchedule = await createDoctorSchedule(route.doctorId, form);
      setSelectedDoctor((current) =>
        current
          ? {
              ...current,
              schedules: [...current.schedules, createdSchedule].sort((left, right) => {
                const leftKey = `${left.work_date} ${left.start_time}`;
                const rightKey = `${right.work_date} ${right.start_time}`;
                return leftKey.localeCompare(rightKey);
              }),
            }
          : current
      );
    } catch (saveError) {
      setScheduleError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при сохранении смены."
          : saveError?.message || "Не удалось сохранить смену врача."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateAppointment(event) {
    event.preventDefault();
    setIsSaving(true);
    setAppointmentError("");
    setSuccess("");

    try {
      const createdAppointment = await createAppointment({
        patient_id: Number(selectedAppointmentPatientId),
        doctor_id: Number(selectedAppointmentDoctorId),
        appointment_date: selectedAppointmentDate,
        start_time: selectedAppointmentTime,
        reason: appointmentReason || null,
      });
      setAppointments((current) => [createdAppointment, ...current]);
      setSuccess("Пациент успешно записан на прием.");
      resetAppointmentForm();
    } catch (saveError) {
      setAppointmentError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при создании записи."
          : saveError?.message || "Не удалось создать запись на прием."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateUser(form) {
    setIsSaving(true);
    setFormError("");
    setSuccess("");

    try {
      const createdUser = await createUser(form);
      setUsers((current) =>
        [...current, createdUser].sort((left, right) => left.username.localeCompare(right.username))
      );
      if (createdUser.employee_id) {
        setAvailableUserDoctors((current) =>
          current.filter((doctor) => doctor.id !== createdUser.employee_id)
        );
      }
      setSuccess("Пользователь успешно создан.");
    } catch (saveError) {
      setFormError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при создании пользователя."
          : saveError?.message || "Не удалось создать пользователя."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCompleteVisit(form) {
    if (!selectedVisitAppointmentId) {
      return;
    }

    setIsSaving(true);
    setVisitError("");
    setSuccess("");

    try {
      const details = await completeVisit(selectedVisitAppointmentId, form);
      setSelectedVisitDetails(details);
      setDoctorAppointments((current) =>
        current.map((item) =>
          Number(item.appointment_id) === Number(selectedVisitAppointmentId)
            ? { ...item, status: details.status, has_visit: true }
            : item
        )
      );
      setSuccess("Прием успешно завершен.");
    } catch (saveError) {
      setVisitError(
        saveError?.name === "AbortError"
          ? "Сервер слишком долго отвечает при завершении приема."
          : saveError?.message || "Не удалось завершить прием."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const navItems = getNavigationItems(authUser);

  return {
    route,
    authUser,
    navItems,
    search,
    doctorSearch,
    patients,
    doctors,
    appointments,
    reportsSummary,
    users,
    userRoles,
    availableUserDoctors,
    selectedAppointmentPatientId,
    selectedAppointmentDoctorId,
    selectedAppointmentDate,
    selectedAppointmentTime,
    appointmentReason,
    availableAppointmentDates,
    availableAppointmentSlots,
    doctorAppointments,
    selectedVisitDoctorId,
    selectedVisitAppointmentId,
    selectedVisitDetails,
    selectedPatient,
    selectedDoctor,
    isAuthLoading,
    isListLoading,
    isDetailsLoading,
    isSaving,
    authError,
    listError,
    doctorListError,
    formError,
    detailsError,
    scheduleError,
    appointmentError,
    visitError,
    success,
    patientFormValues: buildPatientForm(selectedPatient),
    isDoctorLocked: getRoleName(authUser) === "doctor",
    canManageSchedule: getRoleName(authUser) === "admin",
    canCreateDoctor: getRoleName(authUser) === "admin",
    setSearch,
    setDoctorSearch,
    setSelectedAppointmentPatientId,
    setSelectedAppointmentDoctorId,
    setSelectedAppointmentDate,
    setSelectedAppointmentTime,
    setAppointmentReason,
    setAvailableAppointmentDates,
    setAvailableAppointmentSlots,
    handleSearchSubmit,
    handleDoctorSearchSubmit,
    handleVisitDoctorChange,
    handleOpenVisitAppointment,
    handleLogin,
    handleLogout,
    handleCreatePatient,
    handleUpdatePatient,
    handleCreateDoctor,
    handleAddSchedule,
    handleCreateAppointment,
    handleCreateUser,
    handleCompleteVisit,
  };
}
