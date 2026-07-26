import ReactMarkdown from 'react-markdown';

const RULE = 'rgba(237,234,224,0.15)';

// Basic markdown mapped to the writings article prose styles (matches the center
// column of app/writings/[slug]/page.tsx). Blockquote becomes the accent pull style.
export function ArticleMarkdown({ source }: { source: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="font-sans text-lg leading-relaxed mb-6">{children}</p>,
        h2: ({ children }) => <h2 className="font-sans font-medium text-3xl mb-6 mt-10 tracking-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="font-sans font-medium text-2xl mb-4 mt-8 tracking-tight">{children}</h3>,
        ul: ({ children }) => <ul className="font-sans text-lg leading-relaxed mb-6 list-disc pl-6 space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="font-sans text-lg leading-relaxed mb-6 list-decimal pl-6 space-y-2">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ href, children }) => (
          <a href={href} className="underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity" style={{ textDecorationColor: RULE }}>
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-8 pl-5 font-sans text-xl md:text-2xl leading-snug tracking-tight" style={{ borderLeft: '2px solid #2CA152' }}>
            {children}
          </blockquote>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}

const CS_FG = '#EDEAE0';

// Markdown mapped to the case-study prose look (components/case-study/prose.tsx).
// `lead` gives the opening paragraph the pixel drop-cap, matching <P lead>. Only
// the first section should pass it — otherwise every section gets a drop-cap.
const LEAD_DROPCAP = '[&>p:first-of-type]:first-letter:font-pixel [&>p:first-of-type]:first-letter:text-5xl [&>p:first-of-type]:first-letter:mr-2 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:leading-none';
export function CaseStudyMarkdown({ source, lead }: { source: string; lead?: boolean }) {
  return (
    <div className={lead ? LEAD_DROPCAP : undefined} style={{ color: CS_FG }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="font-sans text-[17px] md:text-lg leading-relaxed mb-5 text-pretty">{children}</p>,
          h2: ({ children }) => <h2 className="font-sans font-medium text-2xl md:text-3xl tracking-tight mb-4">{children}</h2>,
          ul: ({ children }) => <ul className="mb-6 space-y-2 pl-5 list-disc font-sans text-[17px] md:text-lg leading-relaxed">{children}</ul>,
          ol: ({ children }) => <ol className="mb-6 space-y-2 pl-6 list-decimal font-sans text-[17px] md:text-lg leading-relaxed">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => <a href={href} className="underline underline-offset-4 decoration-1 hover:opacity-70">{children}</a>,
          blockquote: ({ children }) => (
            <blockquote className="my-8 pl-5 font-sans text-xl md:text-2xl leading-snug tracking-tight" style={{ borderLeft: '2px solid #2CA152' }}>{children}</blockquote>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
