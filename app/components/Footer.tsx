
// app/components/Footer.tsx
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-900 text-zinc-400 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">뉴스</h3>
            <ul className="space-y-2">
              <li><Link href="/politics" className="hover:text-red-500">정치</Link></li>
              <li><Link href="/economy" className="hover:text-red-500">경제</Link></li>
              <li><Link href="/social" className="hover:text-red-500">사회</Link></li>
              <li><Link href="/culture" className="hover:text-red-500">문화</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">토론</h3>
            <ul className="space-y-2">
              <li><Link href="/debate" className="hover:text-red-500">토론 목록</Link></li>
              <li><Link href="/debate/new" className="hover:text-red-500">토론 시작하기</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">소셜</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-500">Facebook</a></li>
              <li><a href="#" className="hover:text-red-500">Twitter</a></li>
              <li><a href="#" className="hover:text-red-500">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Gemini News</h3>
            <p>최신 뉴스와 심도 있는 토론을 한 곳에서 만나보세요.</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p>&copy; {new Date().getFullYear()} Gemini News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
