"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Settings,
  CalendarDays,
  UserCircle,
  FileQuestion,
  ChevronRight,
  Plus,
  GraduationCap,
  Lock,
  FileText,
  Users,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";

type Course = {
  id: string;
  name: string;
  description: string;
  teacher: string;
  startDate: string;
  endDate: string;
};

type Quiz = {
  id: string;
  title: string;
  dueDate: string;
  status: string;
};

type Student = {
  id: string;
  fullName: string;
};

type Lesson = {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
};

function CourseContent() {
  const params = useParams<{ uuid: string | string[] }>();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const { user } = useAuth();
  const isTeacher = user?.role === "instructor";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [courseRes, quizRes, enrollmentRes, lessonsRes] =
          await Promise.all([
            supabase
              .from("courses")
              .select(
                `id, title, description, "startDate", "endDate", profiles:instructorId ("fullName")`,
              )
              .eq("id", uuid)
              .single(),

            supabase
              .from("quizzes")
              .select(`id, title, status, "dueDate"`)
              .eq("courseId", uuid),

            supabase
              .from("enrollments")
              .select(`student:studentId (id, "fullName")`)
              .eq("courseId", uuid),

            supabase
              .from("lessons")
              .select("id, title, fileName, fileUrl, uploadedAt")
              .eq("courseId", uuid)
              .order("uploadedAt", { ascending: false }),
          ]);

        if (courseRes.error) throw courseRes.error;
        if (quizRes.error) throw quizRes.error;
        if (enrollmentRes.error) throw enrollmentRes.error;
        if (lessonsRes.error) throw lessonsRes.error;

        const rawCourse = courseRes.data as any;
        setCourse(
          rawCourse
            ? {
                id: rawCourse.id,
                name: rawCourse.title,
                description: rawCourse.description ?? "",
                teacher: rawCourse.profiles?.fullName ?? "Unknown Instructor",
                startDate: rawCourse.startDate ?? "",
                endDate: rawCourse.endDate ?? "",
              }
            : null,
        );

        setQuizzes(quizRes.data ?? []);
        setStudents(
          (enrollmentRes.data || []).map((e: any) => e.student).filter(Boolean),
        );

        setLessons(
          (lessonsRes.data || []).map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            fileName: lesson.fileName,
            fileUrl: lesson.fileUrl,
          })),
        );
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) fetchData();
  }, [uuid, supabase]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLessonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !course || !uuid) return;

    const {
      data: { user: liveUser },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !liveUser) {
      alert("Authentication error.");
      return;
    }

    try {
      setUploading(true);
      const safeName = file.name.replace(/\s+/g, "_");
      const filePath = `${uuid}/${Date.now()}_${safeName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("lesson-files").getPublicUrl(filePath);

      // Insert into 'lessons' table
      const { data: insertedData, error: insertError } = await supabase
        .from("lessons")
        .insert([
          {
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileName: file.name,
            filePath: filePath,
            fileUrl: publicUrl,
            courseId: uuid,
            uploadedBy: liveUser.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setLessons((prev) => [insertedData, ...prev]);
      alert("Lesson uploaded!");
    } catch (error: any) {
      console.error("Upload failed:", error.message);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        <div className="animate-pulse font-bold text-zinc-400">
          Loading Course...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1E6]">
        <p className="text-zinc-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-zinc-800">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-lg">
        <div className="mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 transition-transform hover:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <BookOpen size={20} />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              CourseCanvas
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="border-r border-zinc-200 pr-4 text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-zinc-800">
                {user?.name || "User"}
              </p>
            </div>
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white shadow-sm transition-colors hover:bg-zinc-50"
            >
              <Settings
                size={20}
                className="transition-transform hover:rotate-45"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto space-y-8 px-6 py-12">
        <section className="rounded-3xl bg-zinc-900 p-10 text-white shadow-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
            <GraduationCap size={14} /> Active Course
          </div>
          <h1 className="text-2xl font-black sm:text-3xl md:text-4xl lg:text-5xl">
            {course.name}
          </h1>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-xl bg-white/10 p-2">
                <UserCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50">
                  Instructor
                </p>
                <p className="text-sm font-semibold">{course.teacher}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-xl bg-white/10 p-2">
                <CalendarDays size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-50">
                  Schedule
                </p>
                <p className="text-sm font-semibold">
                  {course.startDate} - {course.endDate}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Users size={20} className="text-zinc-400" />
              {isTeacher ? "Class Enrollment" : "About This Course"}
            </h3>
            {isTeacher && (
              <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
                {students.length} Total
              </span>
            )}
          </div>

          {isTeacher ? (
            students.length === 0 ? (
              <p className="py-8 text-center text-zinc-400">
                No students enrolled yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold uppercase text-white">
                      {student.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {student.fullName}
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600">
              {course.description || "No description provided."}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <FileText size={24} /> Lessons
            </h2>
            {isTeacher && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleLessonUpload}
                />
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black disabled:opacity-50"
                >
                  {uploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Plus size={16} /> Upload Lesson
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {lessons.length === 0 ? (
            <p className="py-12 text-center text-zinc-400">
              No lessons uploaded yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <a
                  key={lesson.id}
                  href={lesson.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800">
                        <FileText size={20} />
                      </div>
                      <div className="max-w-[150px] sm:max-w-full">
                        <h3 className="truncate text-lg font-bold group-hover:text-black">
                          {lesson.title}
                        </h3>
                        <p className="truncate text-xs text-zinc-500">
                          {lesson.fileName}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-zinc-300 transition-colors group-hover:text-zinc-800"
                    />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <FileQuestion size={24} /> Quizzes
            </h2>
            {isTeacher && (
              <Link
                href={`/quizCreation?courseId=${uuid}`}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-bold text-[#F5F1E6] transition-all hover:bg-black"
              >
                <Plus size={16} /> Create Quiz
              </Link>
            )}
          </div>

          {quizzes.length === 0 ? (
            <p className="py-12 text-center text-zinc-400">No quizzes yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => {
                const isOpen = quiz.status === "Open";

                const card = (
                  <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isOpen
                            ? "bg-zinc-100 text-zinc-800"
                            : "bg-zinc-50 text-zinc-300"
                        }`}
                      >
                        {isOpen ? (
                          <FileQuestion size={20} />
                        ) : (
                          <Lock size={20} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold group-hover:text-black">
                            {quiz.title}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            {quiz.status}
                          </span>
                        </div>
                        {quiz.dueDate && (
                          <p className="text-sm text-zinc-500">
                            Due {quiz.dueDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <ChevronRight
                        size={20}
                        className="text-zinc-300 transition-colors group-hover:text-zinc-800"
                      />
                    )}
                  </div>
                );

                return isOpen ? (
                  <Link
                    key={quiz.id}
                    href={`/quiz/${quiz.id}`}
                    className="group block"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={quiz.id} className="block">
                    {card}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CoursePage() {
  return (
    <AuthGuard>
      <CourseContent />
    </AuthGuard>
  );
}
