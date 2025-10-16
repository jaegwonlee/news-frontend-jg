// src/components/news/MediaNewsList.tsx

interface MediaNewsListProps {
  mediaName: string;
  articles: { title: string; link: string }[];
}

const MediaNewsList = ({ mediaName, articles }: MediaNewsListProps) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white pb-3 mb-3 border-b border-neutral-700">
        {mediaName}
      </h3>
      <ul className="flex-grow space-y-2">
        {articles.map((article, index) => (
          <li key={index}>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-300 hover:text-white hover:underline transition-colors duration-200 truncate block"
              title={article.title}
            >
              - {article.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MediaNewsList;