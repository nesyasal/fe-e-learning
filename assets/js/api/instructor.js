// assets/js/api/instructor.js
import { apiFetch } from "./config.js";

// =====================
// INSTRUCTOR DASHBOARD
// =====================

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

// =====================
// COURSE CRUD (INSTRUCTOR)
// =====================

// Create course
// body: { title: string, description: string }
export async function createCourse(courseData) {
  return apiFetch("/instructor/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
  });
}

// Update course
// body: { title: string, description: string }
export async function updateCourse(courseId, courseData) {
  return apiFetch(`/instructor/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(courseData),
  });
}

// Delete course
export async function deleteCourse(courseId) {
  return apiFetch(`/instructor/courses/${courseId}`, { method: "DELETE" });
}

// Ambil detail course (termasuk modules dari backend GetCourseDetail)
export async function getCourseDetail(id) {
  return apiFetch(`/instructor/courses/${id}`, { method: "GET" });
}

// =====================
// MODULE CRUD (INSTRUCTOR)
// =====================

// Tambah module ke course
// Backend: POST /instructor/courses/:id/modules
// formData: title (string), pdf (file, optional), order (optional)
export async function addModule(courseId, formData) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    `http://127.0.0.1:8080/api/instructor/courses/${courseId}/modules`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

// Edit module
// PUT /instructor/courses/:course_id/modules/:module_id
export async function editModule(courseId, moduleId, formData) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    `http://127.0.0.1:8080/api/instructor/courses/${courseId}/modules/${moduleId}`,
    {
      method: "PUT",
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

// Delete module
// DELETE /instructor/courses/:course_id/modules/:module_id
export async function deleteModule(courseId, moduleId) {
  return apiFetch(`/instructor/courses/${courseId}/modules/${moduleId}`, {
    method: "DELETE",
  });
}

// =====================
// QUIZ (INSTRUCTOR)
// =====================

// Tambah banyak quiz untuk satu modul
// Backend: POST /instructor/courses/:course_id/modules/:module_id/quizzes
// quizList = [ { question, options: [a,b,c,d], answer: "teks jawaban" }, ... ]
export async function addQuiz(courseId, moduleId, quizList) {
  return apiFetch(
    `/instructor/courses/${courseId}/modules/${moduleId}/quizzes`,
    {
      method: "POST",
      body: JSON.stringify(quizList),
    }
  );
}

// Ambil daftar quiz untuk satu modul
// (asumsi ada GET /courses/:course_id/modules/:module_id/quizzes)
export async function getModuleQuizzes(courseId, moduleId) {
  return apiFetch(`/instructor/courses/${courseId}/modules/${moduleId}/quizzes`, {
    method: "GET",
  });
}


// Kalau nanti kamu buat endpoint edit/hapus quiz, tinggal aktifkan ini:
// export async function updateQuiz(courseId, moduleId, quizId, quizData) {
//   return apiFetch(`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`, {
//     method: "PUT",
//     body: JSON.stringify(quizData),
//   });
// }
//
// export async function deleteQuiz(courseId, moduleId, quizId) {
//   return apiFetch(`/instructor/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`, {
//     method: "DELETE",
//   });
// }

// =====================
// PUBLISH / UNPUBLISH (ADMIN, kalau masih dipakai)
// =====================
