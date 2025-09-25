import { WaitlistProvider } from "@/providers/waitlist-providers";

export default async function LandingPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <WaitlistProvider>
            <>{children}</>
        </WaitlistProvider>

    );
}
