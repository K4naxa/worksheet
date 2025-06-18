export default function manifest() {
  return {
    name: "Työharjoittelu Seuranta",
    short_name: "TyöSeuranta",
    description:
      "Seuraa työharjoittelupäiviäsi, aktiviteettejasi ja edistymistäsi",
    start_url: "/",
    display: "standalone",
    background_color: "#1e1b4b",
    theme_color: "#8b5cf6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
