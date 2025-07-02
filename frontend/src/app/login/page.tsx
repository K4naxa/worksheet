import LoginButton from "../../components/LoginButton";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--gradient-background)" }}
    >
      <div className="container mx-auto px-4 py-8 text-primary-50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Työharjoittelu Seuranta
            </h1>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Seuraa päivittäisiä aktiviteettejasi, oppimistasi ja edistymistäsi
            työharjoittelun aikana
          </p>
        </div>

        <div className="flex flex-col items-center  ">
          <div className="glass-card m-6 rounded-2xl p-12">
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
