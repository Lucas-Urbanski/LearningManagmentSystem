export default function CourseCard({ courses }: { courses: any[] }) {
  const isActive = true;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.id}
          className="group p-6 bg-gradient-to-br from-white/10 to-white border border-zinc-300 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-200/50 px-2 py-1 rounded">
              Course ID: {course.id}
            </span>
            {isActive === true ? (
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            ) : (
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
            )}
            {/* Status indicator */}
          </div>

          <h2 className="text-xl font-bold text-zinc-800 group-hover:text-blue-900 transition-colors">
            {course.name}
          </h2>

          <p className="text-zinc-600 mt-2 text-sm line-clamp-2">
            {course.description}
          </p>

          <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-between items-center text-sm">
            <span className="text-zinc-700 font-medium italic">
              by {course.teacher}
            </span>
            <span className="text-zinc-500">{course.startDate}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
