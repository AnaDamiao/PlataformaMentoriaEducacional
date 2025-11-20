function logout() {
  fetch("/auth/logout", {
    method: "POST",
    credentials: "include"
  }).finally(() => window.location.href = "/");
}
