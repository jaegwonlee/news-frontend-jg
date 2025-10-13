const NewsItem = ({ title, date, views }: { title: string; date: string; views: number }) => (
  <li className="border-b border-gray-200 dark:border-neutral-700 py-2.5 text-sm">
    <p className="hover:underline cursor-pointer truncate">{title}</p>
    <div className="text-xs text-gray-500 dark:text-neutral-400 mt-1.5">
      <span>{date}</span> | <span>조회수: {views}</span>
    </div>
  </li>
);

export default function Home() {
  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section>
              <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">최신 뉴스</h2>
              <ul className="space-y-1">
                <NewsItem title="총 120만 관중 돌파한 부산의 비극…" date="2025. 9. 29. 오후 1:45:14" views={0} />
                <NewsItem title="생기자체전, 축제로서 시사한 주민 170명…" date="2025. 9. 29. 오후 1:45:00" views={0} />
                <NewsItem title="'서부 불금 정상'…중복, 큰 혼란 없었지만…" date="2025. 9. 29. 오후 1:44:23" views={0} />
              </ul>
            </section>
            <section className="flex flex-col">
              <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">뉴스톡</h2>
              <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#2e2e2e] rounded-md p-4">
                <div className="flex-grow mb-4 text-center text-gray-500 dark:text-neutral-400 text-sm">
                  <p className="mt-4">[test]님이 입장했습니다.</p>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요."
                    className="w-full p-2 rounded-l-md bg-white dark:bg-neutral-700 text-black dark:text-white border border-gray-300 dark:border-neutral-600 focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md font-bold">전송</button>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">인기 뉴스</h2>
              <ul className="space-y-1">
                <NewsItem title="英 BBC도 경악 '포로 또또 승리 실화!'" date="2025. 9. 25. 오후 2:10:22" views={13} />
                <NewsItem
                  title="한·미 '전작권 전환 조건 충족 상당한 진전'"
                  date="2025. 9. 24. 오후 7:57:56"
                  views={5}
                />
                <NewsItem title="네이버, 앱마켓 저희 사실상 방치…" date="2025. 9. 25. 오후 3:19:00" views={6} />
              </ul>
            </section>
          </div>
        </div>
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-gray-100 dark:bg-[#2e2e2e] p-4 rounded-md">
            <h3 className="font-bold text-lg mb-2">ROUND 2</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400">현재 등록된 토론방이 없습니다.</p>
          </div>
          <div className="bg-gray-100 dark:bg-[#2e2e2e] p-4 rounded-md h-60 flex items-center justify-center">
            <p className="text-gray-400 dark:text-neutral-500">광고</p>
          </div>
        </aside>
      </div>
    </div>
  );
}