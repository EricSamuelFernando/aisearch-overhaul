import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @returns
 * @function
 * @param
 * ? Local & Shared Imports
 */

import {
  APP_PRIVATE_ROUTE,
  APP_PUBLIC_ROUTE,
  AUTH_TOKEN,
  PRIVATE_DYNAMIC_ROUTE,
  USER_ROLE,
} from './shared/constants/env';



function getUserRoleFromCookie(request: NextRequest): string | null {
  const roleCookie = request.cookies.get('__WEB_APP_Ocreal345####user_role');
  if (!roleCookie?.value) return null;

  try {
    return JSON.parse(roleCookie.value)?.toLowerCase(); // because it's stored as '"buyer"'
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { cookies, nextUrl, url } = request;


  const isPublicRoute = APP_PUBLIC_ROUTE.includes(nextUrl.pathname);
  const isPrivateRoute = APP_PRIVATE_ROUTE.includes(nextUrl.pathname);
  const waitlistRoutes = ['/waitlist/subscriber'];
  const isWaitlistNotAllow = waitlistRoutes.includes(nextUrl.pathname)
  const isPrivate = (pathname: string) => {
    return PRIVATE_DYNAMIC_ROUTE.some((route) =>
      typeof route === 'string' ? route === pathname : route.test(pathname)
    );
  };
  const userRole = getUserRoleFromCookie(request);
  const pathname = nextUrl.pathname.includes('/api/auth/logout');
  const token = cookies.get(AUTH_TOKEN);
  const isWaitlistExists: any = cookies.get("waitlist")
  const isHome = ['/'].includes(nextUrl.pathname);
  // if(isWaitlistNotAllow && isWaitlistExists?.value==='false'){    
  //   return NextResponse.redirect(new URL('/waitlist', url));
  // }



  if (isHome && !isPublicRoute) {
    debugger
    // return NextResponse.next();
    return NextResponse.redirect(new URL('/waitlist', url));
  }


  if (isPrivate(nextUrl.pathname) || isPrivateRoute) {

    if (token?.value === undefined) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)

    }
  }

  if (!isPublicRoute && token?.value === undefined && nextUrl.pathname !== "/waitlist/subscriber") {
    debugger
    const loginUrl = new URL('/login', url)
    loginUrl.searchParams.set('redirect', nextUrl.pathname)
    return NextResponse.redirect(new URL('/login', url));
  }

  // if (nextUrl.pathname === '/dashboard') {
  //   console.log('Dash' , userRole)
  //   if (userRole === 'buyer') {
  //     return NextResponse.redirect(new URL('/dashboard/buyer', url));
  //   } 
  //   else if (userRole === 'seller') {
  //     return NextResponse.redirect(new URL('/dashboard', url));
  //   } 
  //   else {
  //     return NextResponse.redirect(new URL('/home', url));
  //   }
  // }

  // const userRole = getUserRole(token?.value);
  
  // if (token?.value) {
  
  //   const path = nextUrl.pathname;
  //   console.log(userRole , path.startsWith('/dashboard/seller') )
  
  //   // 🔒 Restrict access to seller routes
  //   if (path.startsWith('/dashboard/seller') && userRole !== 'seller') {
  //     return NextResponse.redirect(new URL('/home', url));
  //   }
  
  //   // 🔒 Restrict access to buyer routes
  //   if (path.startsWith('/dashboard/buyer') && userRole !== 'buyer') {
  //     return NextResponse.redirect(new URL('/home', url));
  //   }
 // }
  
  // if (isHome && token?.value !== undefined) {
  //   return NextResponse.redirect(new URL('/dashboard', url));
  // }

  if (pathname) {
    return NextResponse.rewrite(new URL('/api/auth/logout', url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/unauthorized',
    '/property/:path*',
    '/start-process/:path*',
    '/waitlist',
    '/waitlist/subscriber',
  ],
};

