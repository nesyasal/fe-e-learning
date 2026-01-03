import { apiFetch } from "./config.js";

/* ================= COURSES ================= */

// GET /api/courses or /api/me/courses or /api/courses?published=true
export async function getPublishedCourses() {
  try {
    console.log("Trying /courses");
    const result = await apiFetch("/courses", { method: "GET" });
    console.log("/courses response:", result);
    return result;
  } catch (e) {
    console.warn("Failed /courses:", e.message);
    try {
      console.log("Trying /me/courses");
      const result = await apiFetch("/me/courses", { method: "GET" });
      console.log("/me/courses response:", result);
      return result;
    } catch (e2) {
      console.warn("Failed /me/courses:", e2.message);
      try {
        console.log("Trying /courses?published=true");
        const result = await apiFetch("/courses?published=true", {
          method: "GET",
        });
        console.log("/courses?published=true response:", result);
        return result;
      } catch (e3) {
        console.error("All endpoints failed:", e3.message);
        throw e3;
      }
    }
  }
}

/* ================= ENROLLMENT ================= */

// GET /api/me/enrollments
export async function getUserEnrollments() {
  return await apiFetch("/me/enrollments", { method: "GET" });
}

// POST /api/me/course/:id/enroll
export async function enrollCourse(courseId) {
  return await apiFetch(`/me/course/${courseId}/enroll`, {
    method: "POST",
  });
}

// Helper: cek apakah course sudah dienroll
export function isCourseEnrolled(courseId, enrollments) {
  if (!Array.isArray(enrollments)) return false;
  return enrollments.some((e) => e.course_id === courseId);
}

/* ================= COURSE DETAIL ================= */

// GET /api/me/courses/:id/modules
export async function getCourseModules(courseId) {
  return await apiFetch(`/me/courses/${courseId}/modules`, {
    method: "GET",
  });
}

// GET /api/me/courses/:courseId/modules/:moduleId/quizzes
export async function getModuleQuizzes(courseId, moduleId) {
  const res = await apiFetch(
    `/me/courses/${courseId}/modules/${moduleId}/quizzes`,
    { method: "GET" }
  );

  // 🔥 NORMALISASI SEKALI DI SINI
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;

  return [];
}


// POST /api/me/courses/:courseId/modules/:moduleId/quizzes/submit
export async function submitModuleQuiz(courseId, moduleId, answers) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://127.0.0.1:8080/api/me/courses/${courseId}/modules/${moduleId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(answers), // 🔥 PENTING: ARRAY, BUKAN OBJECT
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}



export async function getModulePDFUrl(courseId, moduleId) {
  // Fetch PDF directly because `apiFetch` expects JSON responses
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    `http://127.0.0.1:8080/api/me/courses/${courseId}/modules/${moduleId}/pdf`,
    { method: "GET", headers }
  );

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch (e) {
      // ignore parse error
    }
    throw new Error(errorMsg);
  }

  return response.blob(); // return Blob bukan JSON
}

// GET QUIZ RESULT
export async function getQuizResult(courseId, moduleId) {
  return await apiFetch(
    `/courses/${courseId}/modules/${moduleId}/quiz-results`,
    { method: "GET" }
  );
}

// GET /api/me/courses/:id/modules/quiz-results
export async function getCourseQuizResults(courseId) {
  return apiFetch(`/me/courses/${courseId}/modules/quiz-results`, {
    method: "GET",
  });
}
