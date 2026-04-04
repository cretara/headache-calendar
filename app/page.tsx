import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
        <h1 className="text-center text-5xl font-bold tracking-tight sm:text-left">
          Welcome to Headache calendar
        </h1>
        <p className="mt-5 text-center text-2xl sm:text-left">
          Track your headaches and find patterns to better manage them.
        </p>
      </main>
    </div>
  );
}
