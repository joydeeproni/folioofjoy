import type { ReactNode } from 'react'
import {
  ProofGapDiagram,
  HandToMouthLoop,
  EmotionalUniverse,
  AttemptsContrast,
  ClosingProgression,
} from './dfll-diagrams'

const FG = '#EDEAE0'
const RULE = 'rgba(237,234,224,0.15)'

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-sans font-medium text-2xl md:text-3xl tracking-tight mt-16 mb-5">{children}</h2>
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

function List({ items, ordered }: { items: ReactNode[]; ordered?: boolean }) {
  const cls = 'font-sans text-[17px] md:text-lg leading-relaxed marker:text-[rgba(237,234,224,0.4)]'
  const inner = items.map((it, i) => <li key={i} className={cls}>{it}</li>)
  return ordered ? (
    <ol className="mb-6 space-y-3 pl-6 list-decimal" style={{ color: FG }}>{inner}</ol>
  ) : (
    <ul className="mb-6 space-y-2 pl-5 list-disc" style={{ color: FG }}>{inner}</ul>
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

function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure role="group" aria-label={caption} className="my-12 md:my-14">
      <div className="rounded-lg px-4 py-8 md:px-8"
        style={{ border: '1px solid rgba(237,234,224,0.10)', background: 'rgba(237,234,224,0.02)' }}>
        {children}
      </div>
      <figcaption className="mt-3 text-center font-mono uppercase tracking-widest text-[11px]"
        style={{ color: 'rgba(237,234,224,0.4)' }}>
        {caption}
      </figcaption>
    </figure>
  )
}

export function DesigningForLowLiteracy() {
  return (
    <div className="max-w-[760px] mx-auto pt-24 pb-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="font-pixel text-base mt-3" style={{ opacity: 0.5 }}>02</span>
        <h1 className="font-sans font-medium text-5xl md:text-7xl leading-[0.95] tracking-tight">Designing For Low Literacy</h1>
      </div>

      <p className="mt-8 font-sans text-xl md:text-2xl leading-snug" style={{ color: FG }}>
        How do you design an accounting app for people who do not think of themselves as businesses, do not
        trust finance apps, and whose main tech literacy comes from WhatsApp, TikTok, and UPI?
      </p>
      <p className="mt-4 font-mono uppercase tracking-widest text-[11px]" style={{ opacity: 0.5 }}>Case Study</p>

      <hr className="my-12 border-0 border-t" style={{ borderColor: RULE }} />

      <H2>Why this problem is worth solving</H2>
      <P lead>
        There are millions of small businesses in India that do not look like “startups,” but they are
        businesses in every real sense.
      </P>
      <P>
        A tuition teacher. A grocery shop. A food stall. A street vendor. A home baker. A small trader. A woman
        running a tiny business through an NGO. A mechanic. A local service provider.
      </P>
      <P>They earn. They spend. They lend. They borrow. They have customers. They have demand. They have stress. They have ambition.</P>
      <P>What they often do not have is proof.</P>
      <P>
        Their business lives in notebooks, memory, WhatsApp chats, UPI screenshots, and one very confident
        mental calculation that may or may not survive till evening.
      </P>
      <P>And without proof, growth becomes almost impossible.</P>

      <Figure caption="records scatter — institutions see risk">
        <ProofGapDiagram />
      </Figure>

      <P>
        If you want capital, you need records. If you want a loan, you need to show what you earn, what you
        spend, who owes you money, and what your business actually does. But if all of that is scattered across
        paper and memory, banks and institutions do not see a business. They see risk.
      </P>
      <P>So people stay stuck.</P>
      <P>Same customers. Same income. Same monthly panic. Same hand-to-mouth loop.</P>
      <P>
        Not because they are lazy. Not because they lack ambition. But because the systems that help businesses
        grow were never designed for them.
      </P>
      <P>This is why the problem matters.</P>
      <P>
        A simple accounting record is not just “finance hygiene.” For these users, it can become a way to be
        visible. It can become proof that their work exists. And proof, in the real world, is often the first
        step toward opportunity.
      </P>

      <H2>Why this problem matters to me</H2>
      <P>This problem is also personal.</P>
      <P>
        I have seen my mom do small business-like work as a teacher. I have seen people around me run classes,
        services, shops, and small local businesses for years. They were good at what they did. People trusted
        them. They had customers. They had work.
      </P>
      <P>But the business never really grew beyond the person doing it.</P>
      <P>Everything stayed manual, informal, and fragile.</P>

      <Figure caption="the hand-to-mouth loop">
        <HandToMouthLoop />
      </Figure>

      <P>
        Earn today. Spend today. Remember who paid. Forget who did not. Write something in a notebook. Misplace
        the notebook. Start again. Repeat until retirement or back pain, whichever comes first.
      </P>
      <P>
        It always felt unfair because the problem was not capability. These people were capable. They were
        hardworking. They were useful. They were already creating value.
      </P>
      <P>But they did not have the boring infrastructure that formal businesses take for granted.</P>
      <P>
        Records. Accounting. Credit history. Proof of income. Proof of expenses. Proof that there is a business
        here, not just someone working very hard and hoping everyone believes them.
      </P>
      <P>And asking them to “just do accounting” is ridiculous.</P>
      <P>
        Many of our users had not passed high school. Many came from villages or small towns. Many were not
        comfortable with English. Some were not confident readers. Their phone was mostly for WhatsApp, TikTok,
        calls, UPI, and entertainment. Designing an accounting app for them is already hard. Designing an
        accounting app that is not addictive, not entertainment, and not something they naturally want to open
        is even harder.
      </P>
      <Pull>Nobody is doomscrolling a ledger. Sadly.</Pull>
      <P>So the question became: can we make business records so simple and familiar that people can use them without feeling like they are doing paperwork or studying for a banking exam?</P>
      <P>That felt worth trying.</P>

      <H2>What we were trying to solve</H2>
      <P>We were not trying to build a fancy accounting system.</P>
      <P>We were trying to help people record the most basic truth of their business:</P>
      <List items={[
        'Money came in',
        'Money went out',
        'Someone paid',
        'Someone did not',
        'I owe someone',
        'Someone owes me',
      ]} />

      <Figure caption="the whole emotional universe">
        <EmotionalUniverse />
      </Figure>

      <P>
        That is the whole emotional universe of small business accounting. Not debit. Not credit. Not
        receivables. Not payables. Not “financial management solution for MSMEs,” which sounds like a LinkedIn
        post wearing a blazer.
      </P>
      <P>Just money in and money out.</P>
      <P>
        The long-term hope was that if users could keep these records consistently, they could understand their
        business better, make better decisions, and eventually use those records to access loans or financial
        support without getting destroyed by paperwork.
      </P>
      <P>But first, we had to solve the most boring and difficult problem in the world: getting people to enter transactions.</P>

      <H2>Why transaction entry is brutally hard</H2>
      <P>
        The biggest design challenge was not the dashboard. It was not the colors. It was not typography. It was
        not whether the button should have 8px or 12px radius, although I am sure I still suffered over that like
        a responsible designer.
      </P>
      <P>The real challenge was: how do you make someone write down every transaction in an app?</P>
      <P>
        Because people already had a system. They wrote things in notebooks. They used calculators. They
        remembered things. They asked customers later. It was messy, but it was theirs.
      </P>
      <P>We were asking them to move that behavior into an app. And this is hard even for people who love apps.</P>
      <P>
        Think about calorie tracking. Or personal finance tracking. Or habit tracking. The UI can be beautiful.
        The app can send reminders. The charts can be gorgeous. Still, after three days, most of us are like:
        “I ate something round, please leave me alone.”
      </P>
      <P>Manual tracking is hard because life happens faster than the app.</P>
      <P>
        Now imagine that problem for a shopkeeper or vendor who is working all day, talking to customers,
        handling cash, using UPI, managing family, and not fully trusting a finance app yet.
      </P>
      <P>
        They do not want to connect their bank account. They are not confident about where their data is going.
        They do not want something complicated. They already have a notebook.
      </P>
      <P>
        So our job was not just to design a screen. Our job was to build trust, reduce fear, and make
        transaction entry feel close enough to something they already understood.
      </P>

      <H2>Our approach</H2>
      <P>We had two big problems to solve.</P>
      <h3 className="font-sans font-medium text-xl mt-8 mb-3" style={{ color: FG }}>1. Trust</h3>
      <P>
        Before users would put financial information into the app, they had to believe the app was safe, useful,
        and not some new way for the universe to scam them.
      </P>
      <P>
        This was not solved only through UI. A lot of the trust came from outside the product. We collaborated
        with NGOs and local organizations. Some users tried the app. Then they told friends. That mattered more
        than any onboarding illustration could.
      </P>
      <P>
        Trust for this audience does not come from a polished screen saying “100% secure.” It comes from a person
        they know saying, “I used this. It is okay.” Very advanced technology. Human beings.
      </P>
      <h3 className="font-sans font-medium text-xl mt-8 mb-3" style={{ color: FG }}>2. Habit</h3>
      <P>Once trust started forming, the next problem was habit.</P>
      <P>Could we make transaction entry feel natural enough that people would actually do it?</P>
      <P>
        Not once during training. Not once when someone from an NGO is standing nearby. But every day, in the
        middle of real work, when there is no designer dramatically observing from the corner.
      </P>
      <P>That was the real product challenge.</P>

      <H2>Attempt 1: make it feel like a calculator</H2>
      <P>My first idea was to mimic a calculator.</P>
      <P>
        This made sense because many shopkeepers and local vendors constantly use calculators. Even basic
        addition and multiplication often happens on a calculator, especially for users with limited schooling.
        Earlier it was a physical calculator sitting on the counter. Now it is often a calculator app on the
        phone.
      </P>
      <P>
        So we thought: what if transaction entry starts like a calculator? Show the numpad upfront. Let users
        enter the amount quickly. Let them calculate if needed. Then save that as a transaction.
      </P>
      <P>It sounded logical. It even sounded elegant, which is usually the first warning sign.</P>
      <P>
        The problem was that users did not think of our app as a calculator. They already had a calculator. They
        opened calculator apps for calculation. They opened our app for something else, and that “something else”
        was still not clear enough.
      </P>
      <P>The jump from “I calculated an amount” to “I saved this as a business transaction” was harder to explain than expected.</P>
      <P>
        To us, it felt familiar. To users, it felt like a calculator had suddenly developed career ambitions. So
        we dropped it.
      </P>
      <P><em style={{ color: 'rgba(237,234,224,0.7)' }}>Lesson learned: familiarity is not enough. The familiar pattern has to match the user’s intent.</em></P>

      <H2>Attempt 2: make it feel like payments</H2>
      <P>The second approach worked better. Instead of borrowing from calculators, we borrowed from payment apps.</P>
      <P>
        Users already understood apps like Google Pay, Paytm, and BHIM UPI. BHIM was especially interesting
        because people trusted it as a government-backed UPI app. These apps had already taught users a useful
        flow: choose a person, enter an amount, confirm, see success, and feel like the thing happened.
      </P>
      <P>That pattern was much closer to transaction entry.</P>

      <Figure caption="two borrowed metaphors">
        <AttemptsContrast />
      </Figure>

      <P>So we started designing the app more like a payment flow than an accounting flow. Not “create ledger entry.” More like: money came in, money went out, add amount, choose person, save, done.</P>
      <P>This worked better because it connected to something users already trusted and understood.</P>
      <P>
        It still needed a lot of iteration. Labels had to be simplified. The flow needed handholding. Feedback
        had to be reassuring. We had to polish the experience without making it feel too clever or too modern.
      </P>
      <P>But it gave us a direction. The app should not feel like accounting software. It should feel like a familiar money action.</P>

      <H2>What we deliberately avoided</H2>
      <P>We did not want to over-design or over-engineer the app.</P>
      <P>
        This was not the audience for a giant dashboard with charts, reports, filters, percentages, graphs, and
        all the other things we add when we want a product to look serious in a case study.
      </P>
      <P>Most users did not need that at the beginning. They needed the app to be:</P>
      <List items={[
        'Fast', 'Snappy', 'Simple', 'Familiar', 'Forgiving',
        'Clear on cheap Android phones',
        'Comfortable for people who are not confident with technology',
      ]} />
      <P>
        Performance mattered a lot. If the app was slow or heavy, users would go back to paper immediately. Paper
        has many flaws, but it does not show a loading spinner.
      </P>
      <P>
        So we kept the product lightweight. We let people use it. We watched what confused them. We improved the
        flow. We resisted adding too much too early. The product had to earn complexity later.
      </P>

      <H2>Where we got to</H2>
      <P>We did not solve the whole problem.</P>
      <P>And I do not want to pretend we did, because that would be very case-study behaviour and I am trying to recover from that.</P>
      <P>
        This is a hard problem because the real problem is not just UX. It is trust, habit, literacy, language,
        confidence, social proof, device quality, internet quality, and the daily chaos of running a small
        business with very little cushion.
      </P>
      <P>But we made progress.</P>
      <P>
        We worked with NGOs, local government bodies, and partner organizations to reach users. We tested with
        small business owners, freelancers, home bakers, doctors, women entrepreneurs, and village-level
        entrepreneurs. The app eventually reached more than 2,000 users, with around 1,000–1,500 active users
        managing their finances better through it.
      </P>
      <P>That is not “mission accomplished.” It is signal.</P>
      <P>
        Signal that the need exists. Signal that people are willing to try if the product feels trustworthy.
        Signal that transaction entry is the core challenge. Signal that small businesses need tools that start
        from their reality, not from the imagination of urban fintech people with MacBooks and oat milk.
      </P>

      <H2>Current state: the problem got bigger</H2>
      <P>Once users could input their accounts, we ran into the next, deeper problem. What if there is nothing to input?</P>
      <P>
        A lot of small businesses do not only struggle with accounting. They struggle with not having enough
        business in the first place.
      </P>
      <P>
        If someone does not have customers, daily transactions, orders, or repeat work, then a ledger becomes a
        very polite empty room. You can make the transaction flow fast, simple, and beautiful, but if no money is
        coming in, there is nothing to record.
      </P>
      <P>
        That changed the question. The app could not only be a place where people record business. It also had
        to help them get more business.
      </P>
      <P>
        So the product started to slowly pivot from a pure accounting app into a broader business manager app.
        Still simple. Still lightweight. Still designed for people who may not be comfortable with business
        software. But now the job was bigger: how do we help someone not only track their business, but also grow
        it?
      </P>
      <P>That meant exploring features like:</P>
      <List items={[
        'Creating a simple product or service catalog',
        'Helping users list what they sell',
        'Making an easy-to-share online store or website',
        'Letting users share their business with customers on WhatsApp',
        'Helping users promote services without needing design, marketing, or technical skills',
        'Giving small businesses a basic digital presence',
        'Making the business look more legitimate and shareable',
      ]} />
      <P>Because for many users, “business management” does not start with dashboards. It starts with:</P>
      <List items={[
        '“Can people find me?”',
        '“Can I show what I sell?”',
        '“Can I send my services to someone on WhatsApp?”',
        '“Can I look trustworthy enough for a new customer to try me?”',
      ]} />
      <P>This is still work in progress. And honestly, it makes the problem even harder, which is probably why it is worth solving.</P>

      <H2>Future: from accounting to opportunity</H2>
      <P>The future of the app is not just better ledgers. Better ledgers matter, but they are only one part of the journey.</P>
      <P>The bigger opportunity is to help small businesses move through a ladder:</P>
      <List ordered items={[
        <><strong>Record the business.</strong> Help users track money in, money out, customers, payments, and dues.</>,
        <><strong>Understand the business.</strong> Help users see what is working, what is not, who pays, who delays, and where money disappears.</>,
        <><strong>Present the business.</strong> Help users create a simple catalog, service list, or shareable online page that makes their work visible.</>,
        <><strong>Promote the business.</strong> Help users share their store, products, or services through channels they already use, especially WhatsApp.</>,
        <><strong>Grow the business.</strong> Help users build enough activity, proof, and confidence to access capital, partnerships, and more customers.</>,
      ]} />
      <P>This is where the app could become much more than accounting. It could become a small business operating system for people who were never given one.</P>
      <P>Not a bloated “SMB SaaS platform.” Please no. Nobody needs a village vendor opening a settings page with 43 toggles.</P>
      <P>More like a practical business companion:</P>
      <List items={[
        'Add what happened today',
        'Know who owes what',
        'Show what you sell',
        'Share your business',
        'Get more customers',
        'Build proof over time',
      ]} />
      <P>
        The challenge is to do all this without making the app heavy, confusing, or too “business-y.” Because the
        moment it starts feeling like paperwork, people leave. The moment it starts feeling useful, familiar, and
        slightly magical, they might stay.
      </P>

      <H2>Current version and results</H2>
      <P>The current version focuses on the basics:</P>
      <List items={[
        'Recording money in and money out',
        'Tracking customers and payments',
        'Making transaction entry feel familiar',
        'Keeping the app fast and lightweight',
        'Avoiding accounting jargon',
        'Supporting adoption through trusted communities and training',
        'Exploring catalogs, shareable stores, service listings, and promotion tools',
      ]} />
      <P>
        The result was not a perfect accounting app. It was an honest attempt to make financial record-keeping
        accessible to people who are usually ignored by software.
      </P>
      <P>
        We helped some users move from memory and notebooks into a more structured system. We learned that trust
        cannot be designed only inside the interface. We learned that transaction entry is the hardest and most
        important part. We also learned that accounting alone is not enough if the business itself is not growing.
      </P>
      <P>The bigger vision is still ahead.</P>
      <P>
        If small business owners can build a simple, reliable record of what they earn, spend, owe, and are owed,
        that record can become proof. If they can also show what they sell and reach more customers, that proof
        can become progress.
      </P>
      <P>That is why this problem is worth solving.</P>
      <P>
        Because sometimes opportunity does not start with a pitch deck, a dashboard, or a financial product with
        17 tabs. Sometimes it starts with a boring little transaction entry.
      </P>
      <Pull>Money came in. Money went out. Saved.</Pull>
      <P>And sometimes, before even that, it starts with something even more basic: here is what I sell. Here is how to reach me. Please give me business.</P>
      <P>And maybe, slowly, that becomes a record. And maybe that record becomes proof. And maybe that proof becomes a way out.</P>

      <Figure caption="a boring little transaction becomes a way out">
        <ClosingProgression />
      </Figure>
    </div>
  )
}
