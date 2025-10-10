'use client';
import Link from 'next/link';
import Image from 'next/image';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';

const UnsubscribeSuccessPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-4 md:px-6">
            
            {/* Header */}
            <header className="w-full max-w-5xl flex items-center justify-between py-4 md:py-6 px-4 md:px-6">
                <Link href='/home'>
                    <Image src={SnapHomz} alt='logo' className="w-36 md:w-48 lg:w-56 h-auto" />
                </Link>
            </header>

            {/* Success Message */}
            <main className="text-center max-w-xl md:max-w-2xl mt-12 px-4">
                <h2 className="text-2xl md:text-4xl font-bold text-green-600">
                    You have successfully unsubscribed!
                </h2>
                <p className="mt-3 text-base md:text-lg text-gray-600">
                    We're sorry to see you go. You will no longer receive emails from us.
                </p>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-5xl mt-12 text-gray-500 text-xs md:text-sm text-center md:text-right px-4">
                <p>© SnapHomz Inc. 2025</p>
            </footer>
        </div>
    );
};

export default UnsubscribeSuccessPage;
