// assets/js/api/dashboard.js
import { apiFetch } from "./config.js";

// DASHBOARD ADMIN
export async function getAdminOverview() {
  return apiFetch("/admin/overview", { method: "GET" });
}

export async function getPublishedCourses() {
  return apiFetch("/courses", { method: "GET" });
}

// Admin endpoints for courses
export async function getUnpublishedCourses() {
  try {
    return apiFetch("/admin/courses/unpublished", { method: "GET" });
  } catch (err) {
    console.warn("GET /admin/courses/unpublished not available", err);
    return [];
  }
}

export async function getAllCoursesByStatus() {
  try {
    return apiFetch("/admin/courses/status", { method: "GET" });
  } catch (err) {
    console.warn("GET /admin/courses/status not available", err);
    return null;
  }
}

// Admin publish/unpublish endpoints
export async function publishCourse(id) {
  return apiFetch(`/admin/courses/${id}/publish`, { method: "PUT" });
}

export async function unpublishCourse(id) {
  return apiFetch(`/admin/courses/${id}/unpublish`, { method: "PUT" });
}

// ===== USERS =====
// Note: backend may not have GET /admin/users yet, so we'll handle this gracefully
export async function getAllUsers() {
  try {
    return apiFetch("/admin/users", { method: "GET" });
  } catch (err) {
    console.warn("GET /admin/users not available, returning empty", err);
    return { users: [] };
  }
}

// Get user by ID
export async function getUserById(id) {
  return apiFetch(`/admin/users/${id}`, { method: "GET" });
}

// Update user
export async function updateUser(id, payload) {
  return apiFetch(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Delete user
export async function deleteUser(id) {
  return apiFetch(`/admin/users/${id}`, { method: "DELETE" });
}

// FEEDBACK
export async function getAllFeedback(
  courseId = null,
  ratingMin = null,
  ratingMax = null
) {
  let endpoint = "/admin/feedback";
  const params = new URLSearchParams();
  if (courseId) params.append("course_id", courseId);
  if (ratingMin) params.append("min_rating", ratingMin);
  if (ratingMax) params.append("max_rating", ratingMax);
  if (params.toString()) endpoint += "?" + params.toString();
  return apiFetch(endpoint, { method: "GET" });
}

export async function getFeedbackByCourse(courseId) {
  return apiFetch(`/admin/courses/${courseId}/feedback`, { method: "GET" });
}

// Delete feedback by id
export async function deleteFeedback(id) {
  return apiFetch(`/admin/feedback/${id}`, { method: "DELETE" });
}

// ===== EARNINGS (INSTRUCTOR) =====
export async function getInstructorEarnings() {
  return apiFetch("/instructor/earnings", { method: "GET" });
}

// ===== PROFILE =====
export async function getProfile() {
  return apiFetch("/auth/me", { method: "GET" });
}

// ----- Admin profile management -----
export async function updateAdminProfile(payload) {
  return apiFetch(`/admin/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function changeAdminPassword(payload) {
  // payload: { current_password, new_password }
  return apiFetch(`/admin/profile/password`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminAccount() {
  return apiFetch(`/admin/profile`, { method: "DELETE" });
}
