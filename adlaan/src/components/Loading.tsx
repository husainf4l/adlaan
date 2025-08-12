interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = "md",
  text = "جاري التحميل...",
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const containerClasses = fullScreen
    ? "min-h-screen bg-gray-900 flex items-center justify-center"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4`}
        ></div>
        <p className="text-white text-lg">{text}</p>
      </div>
    </div>
  );
}
