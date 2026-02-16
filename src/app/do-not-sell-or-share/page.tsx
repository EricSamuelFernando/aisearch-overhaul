// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { Instagram, Linkedin, TwitterIcon } from 'lucide-react';
// import { nanoid } from 'nanoid';
// import { Facebook, Rss } from 'lucide-react'; // Imports for missing icons from data/links if needed

// export default function DoNotSellOrShare() {
//     return (
//         <>
//             <header className="w-full bg-[#120500] py-4">
//                 <div className="mx-auto flex items-center justify-center px-6">
//                     <Image
//                         src="/assets/images/logo-01.svg"
//                         alt="Snaphomz logo"
//                         width={200}
//                         height={40}
//                         className="h-10 w-auto filter invert"
//                         priority
//                     />
//                 </div>
//             </header>
//             <main className="mx-auto max-w-4xl px-6 py-16 text-black">
//                 <h1 className="text-3xl font-semibold mb-6">
//                     Do Not Sell or Share My Personal Information
//                 </h1>

//                 <p className="text-black/80 mb-6">
//                     Under applicable privacy laws, including the California Consumer Privacy Act (CCPA)
//                     and the California Privacy Rights Act (CPRA), you have the right to opt out of the sale
//                     or sharing of your personal information.
//                 </p>

//                 <section className="space-y-6 text-black/80">
//                     <p>
//                         Snaphomz may collect personal information such as identifiers, contact information,
//                         and usage data to provide and improve our services. We do not sell personal information
//                         for monetary consideration. However, some data sharing may be considered a “sale” or
//                         “sharing” under California law.
//                     </p>

//                     <p>
//                         You may submit a request to opt out of the sale or sharing of your personal information
//                         by using the form below or by contacting us directly.
//                     </p>
//                 </section>

//                 {/* Divider */}
//                 <div className="my-10 border-t border-black/20" />

//                 {/* Simple Opt-Out Section */}
//                 <section>
//                     <h2 className="text-xl font-semibold mb-4">Submit an Opt-Out Request</h2>

//                     <p className="text-black/80 mb-6">
//                         Please email us with the subject line{" "}
//                         <span className="font-medium text-black">
//                             “Do Not Sell or Share My Personal Information”
//                         </span>
//                         .
//                     </p>

//                     <div className="rounded-xl border border-black/20 p-6 bg-gray-50">
//                         <p className="mb-2">
//                             📧 Email:{" "}
//                             <a
//                                 href="mailto:support@snaphomz.com"
//                                 className="underline text-black"
//                             >
//                                 support@snaphomz.com
//                             </a>
//                         </p>

//                         <p className="text-sm text-black/60">
//                             We will process verified requests within the timeframe required by law.
//                         </p>
//                     </div>
//                 </section>
//             </main>
//             <footer className="mt-auto w-full bg-black py-4">
//                 <div className="mx-auto px-4 md:px-[3.219rem]">
//                     {/* Footer Content */}
//                     <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16 py-8 text-white">
//                         {/* LEFT SIDE: Logo + Socials + Company & Legal */}
//                         <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16 md:flex-1">
//                             {/* Logo + Socials */}
//                             <div>
//                                 <Link href="/">
//                                     <Image
//                                         className="filter invert ml-[12px]"
//                                         src="/assets/images/logo-01.svg"
//                                         alt="Footer Logo"
//                                         height={40}
//                                         width={160}

//                                     />
//                                 </Link>

//                                 <div className="mt-4 flex flex-row items-center justify-between md:flex-col md:items-start md:gap-0 gap-4">
//                                     {/* Left Side: Company Info */}
//                                     <div className="text-left text-white/80 text-sm leading-snug pl-0 md:pl-6">
//                                         <p className="font-semibold text-white">Snaphomz Inc</p>
//                                         <p>NMLS ID: 2790448</p>
//                                     </div>

//                                     {/* Right Side: Social Icons */}
//                                     <nav className="flex items-center gap-4 text-white pl-0 md:pl-6 md:mt-4">
//                                         {socialLinks.map((item, i) => {
//                                             if (!item.icon) return null;
//                                             return (
//                                                 <a
//                                                     key={i}
//                                                     href={item.href!}
//                                                     target={item.external ? "_blank" : undefined}
//                                                     rel={item.external ? "noreferrer" : undefined}
//                                                     className="flex items-center text-white transition hover:opacity-80 [&>svg]:h-5 [&>svg]:w-5"
//                                                 >
//                                                     <item.icon />
//                                                 </a>
//                                             );
//                                         })}

//                                         {/* Twitter X Icon */}
//                                         <a
//                                             href="https://x.com/snaphomz"
//                                             target="_blank"
//                                             rel="noreferrer"
//                                             className="flex items-center text-white transition hover:opacity-80"
//                                         >
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 viewBox="0 0 1668.56 1221.19"
//                                                 fill="currentColor"
//                                                 className="h-5 w-5"
//                                             >
//                                                 <path
//                                                     d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-390.99
//                             h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"
//                                                     transform="translate(52.39 -25.059)"
//                                                 />
//                                             </svg>
//                                         </a>
//                                     </nav>
//                                 </div>
//                             </div>
//                             {/* Company & Legal */}
//                             <div className="flex gap-x-6">
//                                 <FooterCategory {...footerLinks.legal} />
//                             </div>
//                         </div>

//                         {/* RIGHT SIDE: Disclaimer / Privacy */}
//                         <div className="flex-1 pt-3 pb-4 text-sm text-white/80 leading-relaxed">
//                             <p>
//                                 Loan products and services are offered solely by Real-Finity Mortgage, LLC dba Realfinity, a licensed
//                                 mortgage lender (NMLS #2445766), and are subject to credit approval, property appraisal, and verification
//                                 of submitted information. Snaphomz, Inc. is in a marketing and promotional relationship with Realfinity.
//                                 Inclusion of Realfinity's offerings or tools on Snaphomz, Inc's website does not constitute an endorsement
//                                 or recommendation by Snaphomz, Inc. Terms, rates, and programs may change without notice. Realfinity
//                                 maintains its headquarters at 929 Alton Road, Suite 500, Miami Beach, FL 33139. For licensing information, visit{' '}
//                                 <a
//                                     href="https://www.nmlsconsumeraccess.org"
//                                     target="_blank"
//                                     rel="noreferrer noopener"
//                                     className="underline text-white hover:opacity-80 transition-opacity"
//                                 >
//                                     www.nmlsconsumeraccess.org
//                                 </a>.
//                             </p>

//                             <div className="mt-3 text-left">
//                                 <Link
//                                     href="/do-not-sell-or-share"
//                                     className="underline text-white hover:opacity-80 transition-opacity"
//                                 >
//                                     Do Not Sell or Share My Personal Information
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </footer>
//         </>
//     );
// }



// interface NavItem {
//     title: string;
//     href?: string;
//     disabled?: boolean;
//     external?: boolean;
//     icon?: any;
//     label?: string;
// }

// interface IFooterItems {
//     title: string;
//     links: NavItem[];
// }

// const footerLinks: Record<string, IFooterItems> = {
//     company: {
//         title: 'Company',
//         links: [
//             {
//                 title: 'Insight',
//                 href: 'https://www.snaphomz.com/waitlist',
//                 external: true,
//             },
//         ],
//     },

//     legal: {
//         title: 'Legal',
//         links: [
//             {
//                 title: 'Privacy Policy',
//                 href: 'https://snaphomz.com/privacy-policy',
//                 external: true,
//             },
//             {
//                 title: 'Terms and Conditions',
//                 href: 'https://snaphomz.com/terms-condition',
//                 external: true,
//             },
//         ],
//     },
// };

// interface MainNavItem extends NavItem { }

// const socialLinks: MainNavItem[] = [
//     {
//         title: 'twitter',
//         external: true,
//         href: 'https://x.com/snaphomz',
//     },
//     {
//         title: 'linkedin',
//         external: true,
//         href: 'https://www.linkedin.com/company/99047017',
//         icon: Linkedin,
//     },
//     {
//         title: 'instagram',
//         external: true,
//         href: 'https://www.instagram.com/snaphomz/',
//         icon: Instagram,
//     },
// ];


// const FooterCategory = ({ title, links, className }: IFooterItems & { className?: string }) => {
//     return (
//         <div className={className}>
//             <h3 className="text-xl font-bold mt-4">{title}</h3>
//             <ul className="space-y-2 py-2 text-grey-510">
//                 {links?.map((item) => (
//                     <li key={nanoid()}>
//                         <a
//                             href={item.href!}
//                             target={item.external ? "_blank" : undefined}
//                             rel={item.external ? "noreferrer" : undefined}
//                             className="text-white/80 hover:text-white transition-colors"
//                         >
//                             {item.title}
//                         </a>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };



import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Linkedin, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import ContactUsForm from '@/components/forms/ContactUsForm';

export default function DoNotSellOrShare() {
    return (
        <>
            <header className="w-full bg-[#120500] py-4">
                <div className="mx-auto flex items-center justify-center px-6">
                    <Image
                        src="/assets/images/logo-01.svg"
                        alt="Snaphomz logo"
                        width={200}
                        height={40}
                        className="h-10 w-auto filter invert"
                        priority
                    />
                </div>
            </header>
            <main className="mx-auto max-w-4xl px-6 py-16 text-black">
                <h1 className="text-3xl font-semibold mb-6">
                    Do Not Sell or Share My Personal Information
                </h1>

                <p className="text-black/80 mb-6">
                    Under applicable privacy laws, including the California Consumer Privacy Act (CCPA)
                    and the California Privacy Rights Act (CPRA), you have the right to opt out of the sale
                    or sharing of your personal information.
                </p>

                <section className="space-y-6 text-black/80">
                    <p>
                        Snaphomz may collect personal information such as identifiers, contact information,
                        and usage data to provide and improve our services. We do not sell personal information
                        for monetary consideration. However, some data sharing may be considered a “sale” or
                        “sharing” under California law.
                    </p>

                    <p>
                        You may submit a request to opt out of the sale or sharing of your personal information
                        by using the form below or by contacting us directly.
                    </p>
                </section>

                {/* Divider */}
                <div className="my-10 border-t border-white/20" />

                {/* Simple Opt-Out Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Submit an Opt-Out Request</h2>

                    <p className="text-black/80 mb-6">
                        Please email us with the subject line{" "}
                        <span className="font-medium text-white">
                            “Do Not Sell or Share My Personal Information”
                        </span>
                        .
                    </p>

                    <div className="rounded-xl border border-black/20 p-6 bg-white/5">
                        <p className="mb-2">
                            📧 Email:{" "}
                            <a
                                href="mailto:support@snaphomz.com"
                                className="underline text-black"
                            >
                                support@snaphomz.com
                            </a>
                        </p>

                        <p className="text-sm text-black/60">
                            We will process verified requests within the timeframe required by law.
                        </p>
                    </div>
                </section>

                <div className="my-10 border-t border-black/20" />

                <section>
                    <ContactUsForm />
                </section>
            </main>
            <footer className="mt-auto w-full bg-black py-4">
                <div className="mx-auto px-4 md:px-[3.219rem]">
                    {/* Footer Content */}
                    <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16 py-8 text-white">
                        {/* LEFT SIDE: Logo + Socials + Company & Legal */}
                        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16 md:flex-1">
                            {/* Logo + Socials */}
                            <div>
                                <Link href="/">
                                    <Image
                                        className="filter invert ml-[12px]"
                                        src="/assets/images/logo-01.svg"
                                        alt="Footer Logo"
                                        height={40}
                                        width={160}

                                    />
                                </Link>

                                <div className="mt-4 flex flex-row items-center justify-between md:flex-col md:items-start md:gap-0 gap-4">
                                    {/* Left Side: Company Info */}
                                    <div className="text-left text-white/80 text-sm leading-snug pl-0 md:pl-6">
                                        <p className="font-semibold text-white">Snaphomz Inc</p>
                                        <p>NMLS ID: 2790448</p>
                                    </div>

                                    {/* Right Side: Social Icons */}
                                    <nav className="flex items-center gap-4 text-white pl-0 md:pl-6 md:mt-4">
                                        {socialLinks.map((item, i) => {
                                            if (!item.icon) return null;
                                            return (
                                                <a
                                                    key={i}
                                                    href={item.href!}
                                                    target={item.external ? "_blank" : undefined}
                                                    rel={item.external ? "noreferrer" : undefined}
                                                    className="flex items-center text-white transition hover:opacity-80 [&>svg]:h-5 [&>svg]:w-5"
                                                >
                                                    <item.icon />
                                                </a>
                                            );
                                        })}

                                        {/* Twitter X Icon */}
                                        <a
                                            href="https://x.com/snaphomz"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center text-white transition hover:opacity-80"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 1668.56 1221.19"
                                                fill="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-390.99
                            h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"
                                                    transform="translate(52.39 -25.059)"
                                                />
                                            </svg>
                                        </a>
                                    </nav>
                                </div>
                            </div>
                            {/* Company & Legal */}
                            <div className="flex gap-x-6">
                                <FooterCategory {...footerLinks.legal} />
                            </div>
                        </div>

                        {/* RIGHT SIDE: Disclaimer / Privacy */}
                        <div className="flex-1 pt-3 pb-4 text-sm text-white/80 leading-relaxed">
                            <p>
                                Loan products and services are offered solely by Real-Finity Mortgage, LLC dba Realfinity, a licensed
                                mortgage lender (NMLS #2445766), and are subject to credit approval, property appraisal, and verification
                                of submitted information. Snaphomz, Inc. is in a marketing and promotional relationship with Realfinity.
                                Inclusion of Realfinity's offerings or tools on Snaphomz, Inc's website does not constitute an endorsement
                                or recommendation by Snaphomz, Inc. Terms, rates, and programs may change without notice. Realfinity
                                maintains its headquarters at 929 Alton Road, Suite 500, Miami Beach, FL 33139. For licensing information, visit{' '}
                                <a
                                    href="https://www.nmlsconsumeraccess.org"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="underline text-white hover:opacity-80 transition-opacity"
                                >
                                    www.nmlsconsumeraccess.org
                                </a>.
                            </p>

                            <div className="mt-3 text-left">
                                <a
                                    href="https://snaphomz.com/do-not-sell-or-share"
                                    className="underline text-white hover:opacity-80 transition-opacity"
                                >
                                    Do Not Sell or Share My Personal Information
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}



interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: any;
    label?: string;
}

interface IFooterItems {
    title: string;
    links: NavItem[];
}

const footerLinks: Record<string, IFooterItems> = {
    company: {
        title: 'Company',
        links: [
            {
                title: 'Insight',
                href: 'https://www.snaphomz.com/waitlist',
                external: true,
            },
        ],
    },

    legal: {
        title: 'Legal',
        links: [
            {
                title: 'Privacy Policy',
                href: 'https://snaphomz.com/privacy-policy',
                external: true,
            },
            {
                title: 'Terms and Conditions',
                href: 'https://snaphomz.com/terms-condition',
                external: true,
            },
        ],
    },
};

interface MainNavItem extends NavItem { }

const socialLinks: MainNavItem[] = [
    {
        title: 'x',
        external: true,
        href: 'https://x.com/snaphomz',
    },
    {
        title: 'linkedin',
        external: true,
        href: 'https://www.linkedin.com/company/99047017',
        icon: Linkedin,
    },
    {
        title: 'instagram',
        external: true,
        href: 'https://www.instagram.com/snaphomz/',
        icon: Instagram,
    },
];


const FooterCategory = ({ title, links, className }: IFooterItems & { className?: string }) => {
    return (
        <div className={className}>
            <h3 className="text-xl font-bold mt-4">{title}</h3>
            <ul className="space-y-2 py-2 text-grey-510">
                {links?.map((item) => (
                    <li key={nanoid()}>
                        <a
                            href={item.href!}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noreferrer" : undefined}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            {item.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
