import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-100 text-neutral-600 py-8 border-t border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} NEWSROUND1. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-white">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-white">이용약관</Link>
        </div>
      </div>
    </footer>
  );
}
