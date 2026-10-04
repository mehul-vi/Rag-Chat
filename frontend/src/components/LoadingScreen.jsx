export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] text-zinc-700">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="PDF Chat AI Logo" className="h-14 w-14 animate-pulse" />
        <p className="text-xs font-semibold text-zinc-500">Loading PDF Chat AI...</p>
      </div>
    </div>
  );
}
