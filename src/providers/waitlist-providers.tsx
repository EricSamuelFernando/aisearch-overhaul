'use client';

import { createContext, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";

interface WaitlistContextType {
    isPrivateRoute: (path?: string) => boolean;
}
const WaitlistPrivate = ["/waitlist/subscriber"]
const Waitlist = createContext<WaitlistContextType | undefined>(undefined);
export const WaitlistProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const waitlistCookie = getCookie('waitlist');
  // console.log("Waitlist : pathname : ",pathname,waitlistCookie);
  const isPrivateRoute = (path: string = pathname): boolean => {
    return WaitlistPrivate.includes(path);
  };
  // console.log("Waitlist :  ",isPrivateRoute())

  if(isPrivateRoute() &&waitlistCookie?.trim()!=="true"){
    router.push('/waitlist')
  }
  return (
    <Waitlist.Provider value={{ isPrivateRoute }}>
      {children}
    </Waitlist.Provider>
  );
};

