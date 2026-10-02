'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordDynamicPage({ params }) {
  // Support React 19 / Next.js 15 async params
  const resolvedParams =
    params && typeof params.then === 'function' ? use(params) : params;
  const router = useRouter();

  useEffect(() => {
    if (resolvedParams?.uid && resolvedParams?.token) {
      router.replace(
        `/reset-password?uid=${encodeURIComponent(resolvedParams.uid)}&token=${encodeURIComponent(resolvedParams.token)}`
      );
    }
  }, [resolvedParams, router]);

  return null;
}
