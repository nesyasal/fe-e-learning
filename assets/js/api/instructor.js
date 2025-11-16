// assets/js/api/instructor.js
import { apiFetch } from "./config.js";

export async function getInstructorEarnings() {
  return apiFetch("/instructor/earnings", { method: "GET" });
}

export async function getInstructorCourses() {
  return apiFetch("/instructor/courses", { method: "GET" });
}

export async function getInstructorFeedback() {
  return apiFetch("/instructor/feedback", { method: "GET" });
}

export async function getProfile() {
  return apiFetch("/auth/me", { method: "GET" });
}

export async function createCourse(courseData) {
  return apiFetch("/instructor/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
  });
}

export async function updateCourse(courseId, courseData) {
  return apiFetch(`/instructor/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(courseData),
  });
}

export async function deleteCourse(courseId) {
  return apiFetch(`/instructor/courses/${courseId}`, { method: "DELETE" });
}

export async function addModule(courseId, moduleData) {
  return apiFetch(`/instructor/courses/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(moduleData),
  });
}

export async function publishCourse(courseId) {
  return apiFetch(`/admin/courses/${courseId}/publish`, { method: "PUT" });
}

export async function unpublishCourse(courseId) {
  return apiFetch(`/admin/courses/${courseId}/unpublish`, { method: "PUT" });
}
