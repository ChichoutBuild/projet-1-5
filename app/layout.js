import "./globals.css";

export const metadata = {
  title: "Projet 1.5",
  description: "Projet 1.5",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B2021",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
