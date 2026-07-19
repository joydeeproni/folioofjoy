import type { ReactNode } from 'react'
import { ArticleToc, type TocSection } from './article-toc'
import { slugify } from '@/lib/writings/slug'

const FG = '#EDEAE0'
const RULE = 'rgba(237,234,224,0.15)'
const MUTED = 'rgba(237,234,224,0.4)'

const MEDIUM = 'https://medium.com/@joydeeproni/ux-of-social-proof-b51a644d1309'
const NIELSEN = 'http://www.nielsen.com/us/en/insights/news/2012/trust-in-advertising--paid-owned-and-earned.html'

const SECTIONS: TocSection[] = [
  { label: 'What is social proof?', level: 1 },
  { label: 'Studies overview', level: 1 },
  { label: '1. Showing numbers', level: 1 },
  { label: '2. Testimonials & reviews', level: 1 },
  { label: '3. Social media metrics', level: 1 },
  { label: '4. Influencers', level: 1 },
  { label: '5. Badges', level: 1 },
  { label: '6. Sharing', level: 1 },
  { label: 'Customer case studies', level: 1 },
  { label: 'Media mentions', level: 1 },
  { label: 'References', level: 1 },
]

function H2({ children }: { children: string }) {
  return (
    <h2 id={slugify(children)} className="font-sans font-medium text-2xl md:text-3xl tracking-tight mt-16 mb-5 scroll-mt-24">
      {children}
    </h2>
  )
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="font-sans font-semibold text-lg mt-8 mb-3" style={{ color: FG }}>{children}</p>
}

function P({ children, lead }: { children: ReactNode; lead?: boolean }) {
  return (
    <p
      className={`font-sans text-[17px] md:text-lg leading-relaxed mb-5 ${
        lead ? 'first-letter:font-pixel first-letter:text-5xl first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''
      }`}
      style={{ color: FG }}
    >
      {children}
    </p>
  )
}

function Pull({ children }: { children: ReactNode }) {
  return (
    <p className="my-10 pl-5 font-sans text-2xl md:text-[2rem] leading-snug tracking-tight"
      style={{ color: FG, borderLeft: '2px solid #2CA152' }}>
      {children}
    </p>
  )
}

function Img({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure role="group" aria-label={caption ?? alt} className="my-10 md:my-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg" />
      {caption && (
        <figcaption className="mt-3 font-mono uppercase tracking-widest text-[11px]" style={{ color: MUTED }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
      style={{ textDecorationColor: RULE }}>
      {children}
    </a>
  )
}

const REFERENCES: { label: string; href: string }[] = [
  { label: 'Originally published on Medium', href: MEDIUM },
  { label: 'Baron, Vandello & Brunsman (1996)', href: 'http://psycnet.apa.org/doiLanding?doi=10.1037%2F0022-3514.71.5.915' },
  { label: 'Luca (2011) — Yelp ratings & sales', href: 'https://www.scribd.com/fullscreen/67460062' },
  { label: 'Nielsen (2012) — Trust in advertising', href: NIELSEN },
  { label: 'Mason, Lee, Wiley & Ames (2013)', href: 'https://www8.gsb.columbia.edu/researcharchive/articles/5957' },
  { label: 'Newman et al. (2012) — photos & credibility', href: 'https://www.ncbi.nlm.nih.gov/pubmed/22869334' },
  { label: 'Pew Research (2016) — online reviews', href: 'http://www.pewinternet.org/2016/12/19/online-reviews/' },
  { label: 'VWO — social buttons experiment', href: 'https://vwo.com/success-stories/taloon/' },
]

export function BetterSocialProof() {
  return (
    <div className="max-w-[760px] mx-auto pt-24 pb-4">
      <ArticleToc sections={SECTIONS} />

      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="font-pixel text-base mt-3" style={{ opacity: 0.5 }}>03</span>
        <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight">Better Social Proof</h1>
      </div>

      <p className="mt-8 font-sans text-xl md:text-2xl leading-snug" style={{ color: FG }}>
        People do what they see others do. A field guide to the templates that turn other people&rsquo;s
        behaviour into trust — backed by research, not fake reviews.
      </p>
      <p className="mt-4 font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Research</p>
      <p className="mt-3 font-sans text-sm">
        <A href={MEDIUM}>Originally published on Medium&nbsp;↗</A>
      </p>

      <hr className="my-12 border-0 border-t" style={{ borderColor: RULE }} />

      <P lead>
        This is generalized secondary research on social proof I did as part of our practice to redesign our
        Insider product&rsquo;s social-proof widget — figuring out what kinds of templates we needed to design,
        based on user psychology and several user-research and psychology studies found online.
      </P>

      <H2>What is social proof?</H2>
      <Pull>&ldquo;When you say it, it&rsquo;s marketing. When your customer says it, it&rsquo;s social proof.&rdquo; — Andy Crestodina</Pull>
      <P>
        People are a lot like animals — we are more likely to do something when shown evidence that others have
        already done it. This is true more than we are willing to admit, and it holds for our shopping apps too.
      </P>
      <P>
        Marketers dubbed this psychology and translated it into something called social proof. Employing best
        practices and industry standards, Insider&rsquo;s product is equipped with a Social Proof module, among
        many others, to power its ecommerce partners. What follows is a comprehensive look at how social proof
        can be used on an ecommerce business to boost growth.
      </P>

      <H2>Studies overview</H2>
      <P>
        A study by{' '}
        <A href="http://psycnet.apa.org/doiLanding?doi=10.1037%2F0022-3514.71.5.915">Baron, Vandello and Brunsman</A>{' '}
        in 1996 asked a group of people to identify a criminal from a line of suspects. They glanced at the photos
        very quickly, so it was hard for them to be confident about their judgements. In the group there were two
        undercover crew members who knowingly gave an incorrect answer so as not to disagree with others — and the
        other participants tended to follow their lead and chose the same person, demonstrating how social anxiety
        influences decision-making and behavior.
      </P>
      <P>
        A study found that a one-star increase in Yelp ratings led to a 5–9% growth in sales
        (<A href="https://www.scribd.com/fullscreen/67460062">Luca, 2011</A>).
      </P>
      <P>
        92% of people trust recommendations from their peers, and 70% of consumers trust a recommendation from
        someone they don&rsquo;t even know (<A href={NIELSEN}>Nielsen, 2012</A>).
      </P>
      <P>
        There are many more studies that show how effective social proof can be. Below I have grouped broad
        categories of social-proof templates and how each one influences user behavior and psychology.
      </P>

      <H2>1. Showing numbers</H2>
      <P>
        Expose your visitors to big numbers — mailing-list size, customer base, downloads, any relevant statistic
        that reminds potential customers that a large crowd is already using your service, so it must be good
        enough for them. WordPress uses this in the headline of their landing page: &ldquo;WordPress powers 28% of
        the internet.&rdquo; Use exact numbers instead of rounded ones to be perceived as even more believable
        (<A href="https://www8.gsb.columbia.edu/researcharchive/articles/5957">Mason, Lee, Wiley &amp; Ames, 2013</A>).
      </P>
      <Lead>Real-time statistics</Lead>
      <P>
        Present real-time data to your visitors — &ldquo;89 people are shopping right now,&rdquo; or &ldquo;The last
        purchase of this course was 7 minutes ago&rdquo; — to build trust and create a sense of urgency.
        Insider&rsquo;s template has been capable of this for years, and it delivers strong results for our partners.
      </P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*spV3fJw2kIrZCyAq_A2-sg.png" alt="Real-time visitor and recent-purchase notifications on a store" />
      <Lead>Mentioning numbers off-site</Lead>
      <P>The numbers don&rsquo;t have to live on your website — any stat about your product or company, including past achievements, can work just as well.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*GySA4YOPgcmsiDc6xSJdHQ.png" alt="Off-site statistics used as social proof" />
      <Lead>Live feed of user activity</Lead>
      <P>Show your visitors that others are purchasing products, publishing posts, or doing something else relevant to your service right now. It adds social proof and also enhances discovery of items on your site.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*zlfPWQINtHyrvKGxm7NOjw.png" alt="Live feed of recent user activity" />
      <Lead>Sold out</Lead>
      <P>
        Ever wondered why some online stores leave sold-out items on their website? It&rsquo;s the combination of
        social proof and loss aversion: what others buy, it&rsquo;s safe for me to buy too — coupled with the fear
        of missing out again. Amazon uses this during Prime Day, keeping out-of-stock deals visible to signal that
        people are running out of time.
      </P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*J44KeQ1GxQJLmipcz2Df6g.png" alt="Sold-out items kept visible on a store page" />
      <P>Xiaomi and OnePlus are notorious for flash sales that go out of stock in seconds after release in South Asian markets, and they advertise those numbers on their website too, causing loss aversion among users.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*9bll1ypf5f4L6pNbVT6iSg.jpeg" alt="Flash-sale stock counts advertised to create urgency" />

      <H2>2. Testimonials &amp; reviews</H2>
      <P>
        Displaying quotes from happy customers is one of the most used and most persuasive forms of social proof
        online. Be sure to add a high-quality photo to boost perceived credibility
        (<A href="https://www.ncbi.nlm.nih.gov/pubmed/22869334">Newman, Garry, Bernstein, Kantner &amp; Lindsay, 2012</A>).
      </P>
      <P>Partners already have reviews from their users on their website, which can be routed and surfaced as toasts at the bottom of the page.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*aOHlW8gQSsd6DXcgfaH-qw.png" alt="Customer testimonial shown as a toast" />
      <Lead>Negative reviews?</Lead>
      <P>
        Controversial, but it does help people make purchase decisions and shows transparency of the brand and
        product. According to the{' '}
        <A href="http://www.pewinternet.org/2016/12/19/online-reviews/">Pew Research Center</A>, 82% of Americans
        read reviews before making a buying decision, and we pay more attention to highly negative reviews than to
        extremely positive ones. Displaying customer reviews can increase conversion rate by 207%, and a healthy
        mix of positive and negative reviews is more trustworthy — it{' '}
        <A href="https://www.crazyegg.com/blog/negative-reviews/">can even improve conversions</A>.
      </P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*O1cWSlhEVgy7_JPW5vPsdg.png" alt="A mix of positive and negative reviews" />
      <Lead>Video testimonials</Lead>
      <P>It&rsquo;s one thing to read about someone&rsquo;s experience with your product; it&rsquo;s another to see and hear them tell others how much they enjoy it. Letting prospects immerse in another customer&rsquo;s world goes much further in building trust.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*Yx-bPOZE2ZgaYZBEO7WjYQ.png" alt="Video testimonial from a customer" />

      <H2>3. Social media metrics</H2>
      <Lead>Social share count</Lead>
      <P>
        Showing the raw number of social shares is a simple form of social proof — people are more likely to read
        an article shared by thousands. But be careful: a low share count creates negative social proof and is
        worse than no count at all.{' '}
        <A href="https://vwo.com/success-stories/taloon/">In an experiment by VWO</A>, removing social sharing
        buttons led to an 11.9% conversion increase.
      </P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*ymO3tKlAUYhKy-RZLqt7BA.png" alt="Social share counts on an article" />
      <Lead>Accumulated share count</Lead>
      <P>Instead of displaying every counter separately, show the total number of shares across networks to expose the user to an even higher number.</P>
      <Lead>Subscriber count</Lead>
      <P>
        Show people how many fans, subscribers, or followers you have. Use the official{' '}
        <A href="https://publish.twitter.com/">Twitter follow button</A>, the{' '}
        <A href="https://developers.facebook.com/docs/plugins/page-plugin">Facebook page plugin</A>, or the plugin
        of your chosen community. Most larger platforms also provide a public API from which the subscriber count
        can be fetched.
      </P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*-_8VfrepqAVVyLMuA2Q3ug.png" alt="Subscriber and follower counts" />
      <Lead>Referrals</Lead>
      <P>
        Attract new customers by offering a referral bonus for sending friends and family to the site.
        Recommendations from people we know personally remain the most trusted source for referrals
        (<A href={NIELSEN}>Nielsen, 2012</A>).
      </P>

      <H2>4. Influencers</H2>
      <Lead>Influencer endorsements</Lead>
      <P>Give your product away to people with high social-media influence in a niche and ask for feedback, sponsor (micro) influencers to post it, or hire them long-term as brand ambassadors. Because they have a positive reputation, people associate that positivity with anything they&rsquo;re involved with — a cognitive bias called the halo effect.</P>
      <P>Pioneer shows that their speakers are designed by Andrew Jones right beside the product details. Some companies quote YouTubers and link to their reviews. Galatasaray Store shows an inline note on the product page that they are an official licensee.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*DdDlGKxnT-LbGLm_2atYDA.png" alt="Kylie's Favorites endorsement badge" caption="A cosmetics brand shows a ‘Kylie’s Favorites’ badge to signal Kylie Jenner’s endorsement." />
      <Img src="https://miro.medium.com/v2/resize:fit:900/1*wDFNq6JfQGbPgAUY6l5sYA.png" alt="Official licensed merchandise badge" caption="Football club Galatasaray shows a badge marking officially licensed merchandise." />
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*-h6Jg-IYiOlF64RABgWrFg.jpeg" alt="Beats endorsement by Billie Eilish" caption="Beats uses Billie Eilish’s photos to promote her endorsement of the brand." />
      <Lead>Quoting celebrities</Lead>
      <P>Instead of having someone talk about your product, find a quote from a celebrity or influencer that supports the bigger picture of your industry. Even if they are not directly associated with your product, a quote with their picture adds social proof through the halo effect. Brands like Beats and Nike do this by showing celebrities using and wearing their products.</P>

      <H2>5. Badges</H2>
      <Lead>Formal standard certifications</Lead>
      <P>If your company operates in regulated industries, add credibility by demonstrating that your business meets the requirements of national or international standards bodies such as ANSI or ISO.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*MoPYAPj-teasdaEyrO6KEw.png" alt="Formal standards certification badges" />
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*WMi6OSByrXF1qdr1CY-3JA.png" alt="Industry certification badges" />
      <Lead>Trust seals and badges</Lead>
      <P>If a stranger asked for your credit-card details, you&rsquo;d feel hesitant, uncomfortable, doubtful — the same feelings your customers may have. Establish credibility and legitimacy by displaying trust seals, security certificates, or association memberships.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:632/1*SE8PqeKSWiewd5u09qf10w.png" alt="Trust seals and security badges" />

      <H2>6. Sharing</H2>
      <Lead>Sharing milestones</Lead>
      <P>Celebrate growth and milestones with your audience and thank them for helping you reach them — a certain number of users, followers, downloads, or an anniversary. Amazon Prime Day is the most popular example: they celebrate their birthday by offering discounts, marketing it as the customers&rsquo; success too.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*ASQn7Nm-YbbGXvffpzzXlg.jpeg" alt="Celebrating a milestone with the audience" />
      <Lead>Thank publicly for received awards</Lead>
      <P>If you&rsquo;ve won an award or been publicly honored by the media, show appreciation for those mentions on your social channels.</P>
      <Lead>Engaging brand advocates</Lead>
      <P>A brand advocate enjoys your product so much they say amazing things about it, repeatedly, with credibility — because money doesn&rsquo;t drive them. Keep them engaged and you&rsquo;ll catch more advocates along the way: give them a branded hashtag for their posts or bio, offer discounts, or send a handwritten note. Nike shows people using their shoes and tagging them on Instagram, then surfaces that feed on the product page.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*V7HwZFMIMOZ7U8cKiGINvg.png" alt="Nike featuring customers' tagged Instagram photos on a product page" />

      <H2>Customer case studies</H2>
      <P>Tell an in-depth story of how some of your customers use your product. This provides social proof and gives other potential clients ideas on how to use your product or service.</P>
      <Lead>Backing it up with studies</Lead>
      <P>Expose your visitors to hard facts and numbers backed by research to leverage expert social proof. Present studies that exhibit the same benefits your product provides.</P>
      <P>Many people think case-study social proof is only valid for B2B or enterprise products, but the biggest advocate of case studies in the B2C space is Apple, which produces a lot of video content showing off customer stories. GoDaddy recently overhauled their visual identity to use photos of real customers and the websites they built on GoDaddy as banners.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1192/1*qZhlw1ynsZR_kk8O2NgUrA.jpeg" alt="GoDaddy banners featuring real customers and their websites" />

      <H2>Media mentions</H2>
      <P>Did a recognized media outlet give you a positive endorsement? Let others know with a classic &ldquo;as seen in&rdquo; showcase, or by quoting the positive things they said. Consumers often trust big publishers, so showing that they mentioned you improves your brand&rsquo;s legitimacy and trustworthiness. Many ecommerce brands show the outlets that covered their products inline on the product details page.</P>
      <P>Similarly, displaying logos from big brands your service integrates with can induce the halo effect and positively influence your credibility.</P>
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*Qc6uPXp2Agd6krH8oiXC7A.jpeg" alt="&quot;As seen in&quot; media-mention logos" />
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*yPdqMA6ATznrFqJ4y3fQvA.png" alt="Media mention logos on a product page" />
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*a8d6XMl4FrFhtE-P72Brlw.png" alt="Integration partner logos" />
      <Img src="https://miro.medium.com/v2/resize:fit:1400/1*gYhJJkP-QJGXVyRLMV9MCA.png" alt="Brand and media logos used as social proof" />
      <Img src="https://miro.medium.com/v2/resize:fit:622/1*RtT4sPvZgSuHvYAlEaagiA.png" alt="Trust badges" />

      <H2>References</H2>
      <ul className="mt-2 space-y-3">
        {REFERENCES.map((ref) => (
          <li key={ref.label} className="font-sans text-[17px] leading-relaxed">
            <A href={ref.href}>{ref.label}</A>
          </li>
        ))}
      </ul>
    </div>
  )
}
