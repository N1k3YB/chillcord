export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full flex flex-row overflow-hidden">
      {children}
    </div>
  );
} 