import LoginButton from "@/components/LoginButton";

export default function LoginPage() {
  return (
    // Use flexbox to center the content both vertically and horizontally
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--gradient-background)" }}
    >
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Työharjoittelu Seuranta
          </h1>
        </div>
        <p className="text-secondary text-lg max-w-2xl mx-auto">
          Seuraa päivittäisiä aktiviteettejasi ja edistymistäsi helposti.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md">
        {/* Use the glass-card style for a consistent look */}
        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl">
          <LoginButton />
        </div>
      </div>

      {/* Footer Link (Optional) */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted">
          Tarvitsetko apua? Ota yhteyttä opettajaasi.
        </p>
      </div>
    </div>
  );
}
