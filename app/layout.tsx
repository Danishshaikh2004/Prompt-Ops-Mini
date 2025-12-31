import "./globals.css";

export const metadata = {
  title: "Prompt Ops Dashboard",
  description: "Prompt Migration & Evaluation Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <h2>Prompt Ops Dashboard</h2>
          <nav>
            <a href="/prompt-migration">Prompt Migration</a>
            <a href="/prompt-evaluation">Prompt Evaluation</a>
          </nav>
        </header>

        <main className="app-container">
          {children}
        </main>
      </body>
    </html>
  );
}
