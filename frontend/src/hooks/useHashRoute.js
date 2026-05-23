const ROLE_LABELS = {
  admin: "Администратор",
  registrar: "Регистратор",
  doctor: "Врач",
};

const NAV_ITEMS = {
  admin: [
    { module: "patients", label: "Пациенты", path: "/patients" },
    { module: "appointments", label: "Запись на прием", path: "/appointments" },
    { module: "visits", label: "Проведение приема", path: "/visits" },
    { module: "doctors", label: "Врачи и расписание", path: "/doctors" },
    { module: "reports", label: "Отчеты", path: "/reports" },
    { module: "users", label: "Пользователи", path: "/users" },
  ],
  registrar: [
    { module: "patients", label: "Пациенты", path: "/patients" },
    { module: "appointments", label: "Запись на прием", path: "/appointments" },
    { module: "doctors", label: "Врачи и расписание", path: "/doctors" },
  ],
  doctor: [{ module: "visits", label: "Проведение приема", path: "/visits" }],
};

export function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/login";
  const doctorDetailMatch = hash.match(/^\/doctors\/(\d+)$/);
  const patientEditMatch = hash.match(/^\/patients\/(\d+)\/edit$/);
  const patientDetailMatch = hash.match(/^\/patients\/(\d+)$/);

  if (hash === "/login") {
    return { module: "auth", name: "login" };
  }
  if (hash === "/appointments") {
    return { module: "appointments", name: "list" };
  }
  if (hash === "/users") {
    return { module: "users", name: "list" };
  }
  if (hash === "/reports") {
    return { module: "reports", name: "list" };
  }
  if (hash === "/visits") {
    return { module: "visits", name: "list" };
  }
  if (hash === "/doctors") {
    return { module: "doctors", name: "list" };
  }
  if (hash === "/doctors/new") {
    return { module: "doctors", name: "create" };
  }
  if (doctorDetailMatch) {
    return { module: "doctors", name: "details", doctorId: Number(doctorDetailMatch[1]) };
  }
  if (hash === "/patients/new") {
    return { module: "patients", name: "create" };
  }
  if (patientEditMatch) {
    return { module: "patients", name: "edit", patientId: Number(patientEditMatch[1]) };
  }
  if (patientDetailMatch) {
    return { module: "patients", name: "details", patientId: Number(patientDetailMatch[1]) };
  }

  return { module: "patients", name: "list" };
}

export function navigate(path) {
  window.location.hash = path;
}

export function getRoleName(user) {
  return user?.role_name || "";
}

export function getDefaultPathForUser(user) {
  if (getRoleName(user) === "doctor") {
    return "/visits";
  }

  return "/patients";
}

export function canAccessRoute(user, route) {
  const roleName = getRoleName(user);

  if (!user) {
    return route.name === "login";
  }
  if (route.name === "login") {
    return false;
  }
  if (roleName === "admin") {
    return true;
  }
  if (roleName === "registrar") {
    if (route.module === "patients") {
      return true;
    }
    if (route.module === "appointments") {
      return route.name === "list";
    }
    if (route.module === "doctors") {
      return route.name === "list" || route.name === "details";
    }

    return false;
  }
  if (roleName === "doctor") {
    return route.module === "visits";
  }

  return false;
}

export function getNavigationItems(user) {
  return NAV_ITEMS[getRoleName(user)] || [];
}

export { ROLE_LABELS };
