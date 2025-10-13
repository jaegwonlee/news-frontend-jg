export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-[#1c1c1c] p-4 mt-auto border-t border-gray-200 dark:border-neutral-700">
      <div className="container mx-auto text-center text-sm text-gray-600 dark:text-neutral-400">
        <p>&copy; {new Date().getFullYear()} NEWSROUND1. All Rights Reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" className="hover:underline">
            회사소개
          </a>
          <a href="#" className="hover:underline">
            이용약관
          </a>
          <a href="#" className="hover:underline">
            개인정보처리방침
          </a>
        </div>
      </div>
    </footer>
  );
}
