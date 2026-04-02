import { Navbar } from '@/components/navbar'

export default function HomePage() {
  return (
    <div className="layout">
      <Navbar />
      <main className="home" id="main-content">
        <div className="hero">
          <h1 className="title">SixDegrees</h1>
          <p className="subtitle">The Bot Free alternative to LinkedIn</p>
        </div>

        <section className="manifesto" aria-labelledby="manifesto-heading">
          <div className="manifesto__box card">
            <h2 id="manifesto-heading" className="manifesto__title">
              Manifesto
            </h2>
            <div className="manifesto__body">
              <p>
                We&apos;re done pretending LinkedIn works. It stopped being a
                professional network years ago. It became a content farm, a bot
                playground, a place where your uncle posts AI-written motivation
                porn and recruiters ghost you after three rounds of interviews.
              </p>
              <p>
                We are building something that should have existed all along. A
                professional network that is free. Open source. Built in the
                open, for everyone. A place where every single person is
                verified, their identity confirmed, their credentials real. No
                bots. No AI slop. No engagement-bait ghostwritten by ChatGPT and
                posted by someone who calls themselves a &quot;thought
                leader.&quot; If you are here, you are a real human being with
                real skills and something real to say.
              </p>
              <p>
                Content creators get professional micro sites they actually own,
                not some algorithm-choked feed that buries their work unless
                they pay to boost it. There is no premium tier. There is no
                &quot;creator mode.&quot; There is no surveillance economy
                running underneath it all, packaging your attention and selling
                it to the highest bidder.
              </p>
              <p>
                The platform is yours. The code is yours. The network serves you
                or it answers to you, because you are not the product here.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p className="site-footer__copy">
          © 2026 SixDegrees &mdash;{' '}
          <a
            href="https://github.com/six-degrees-link/sixdegrees"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__link"
          >
            open source on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
