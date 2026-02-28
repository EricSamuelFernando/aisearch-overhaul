'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Copy, Twitter, Linkedin, Instagram } from 'lucide-react';
import { storeCookie } from '@/lib/storage';
import Image from 'next/image';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
import { useSearchParams } from 'next/navigation';

const ThankYouPage = () => {
    const [copied, setCopied] = useState(false);
    const params = useSearchParams();
    const name = params.get('name') || '';
    const referralLink = "https://snaphomz.com/referral?code=YOURCODE";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        return () => {
            storeCookie({ key: 'waitlist', value: false });
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-4 md:px-6">
            {/* Header */}
            <header className="w-full max-w-5xl flex items-center justify-between py-4 md:py-6 px-4 md:px-6">
                <Link href='/'>
                    <Image src={SnapHomz} alt='logo' className="w-36 md:w-48 lg:w-56 h-auto" />
                </Link>
            </header>

            {/* Thank You Section */}
            <main className="text-center max-w-xl md:max-w-2xl mt-6 md:mt-12 px-4">
                <h2 className="text-2xl md:text-4xl font-bold">Thank you for joining the waitlist!</h2>
                <h2 className="text-2xl md:text-4xl font-bold">Thank you for joining the Snaphomz waitlist, {name}</h2>
                <p className="mt-3 text-base md:text-lg text-gray-600">
                    You are one step closer to experiencing real estate, fully guided.
                </p>
                <p className="mt-2 text-sm md:text-base text-gray-500">
                    We have received your request, and you will be among the first to experience the SnapHomz AI-powered platform. Stay tuned for exclusive updates!
                </p>
            </main>

            {/* Next Steps Section */}
            <section className="mt-6 md:mt-8 max-w-xl md:max-w-2xl px-4">
                <h3 className="text-lg font-semibold text-center">Want early access? Invite your friends!</h3>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="border px-4 py-2 rounded-md text-sm w-full sm:w-80 bg-gray-100 text-center sm:text-left"
                    />
                    <button
                        onClick={handleCopy}
                        className="flex items-center px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 text-sm"
                    >
                        <Copy size={18} className="mr-2" />
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>
            </section>

            {/* Follow Us Section */}
            {/* <section className="mt-6 md:mt-8 text-center">
                <h3 className="text-lg font-semibold">Follow us for updates</h3>
                <div className="flex space-x-4 mt-3 justify-center">
                    <a href="https://twitter.com/SnapHomz" target="_blank" className="text-gray-600 hover:text-black">
                        <Twitter size={24} />
                    </a>
                    <a href="https://linkedin.com/company/SnapHomz" target="_blank" className="text-gray-600 hover:text-black">
                        <Linkedin size={24} />
                    </a>
                    <a href="https://instagram.com/SnapHomz" target="_blank" className="text-gray-600 hover:text-black">
                        <Instagram size={24} />
                    </a>
                </div>
            </section> */}

            {/* Call-to-Action Buttons */}
            {/* <section className="mt-6 md:mt-10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button className="px-6 py-3 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 text-sm md:text-base">
                    Invite Friends
                </button>
                <Link href="/">
                    <button className="px-6 py-3 border border-black text-black rounded-md font-semibold hover:bg-gray-100 text-sm md:text-base">
                        Explore More
                    </button>
                </Link>
            </section> */}

            {/* Horizontal Line */}
            <hr className="w-full max-w-5xl mt-6 md:mt-12 border-gray-300" />

            {/* Footer */}
            <footer className="w-full max-w-5xl mt-6 text-gray-500 text-xs md:text-sm text-center md:text-right px-4">
                <p>© SnapHomz Inc. 2025</p>
            </footer>
        </div>
    );
};

export default ThankYouPage;
