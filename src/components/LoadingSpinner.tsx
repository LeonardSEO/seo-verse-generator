export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      <span className="ml-2">Analyzing...</span>
    </div>
  );
}