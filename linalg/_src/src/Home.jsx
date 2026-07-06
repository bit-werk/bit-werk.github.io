import SpaceDemo from './components/SpaceDemo.jsx'

export default function Home({ onNavigate }) {
  return (
    <div className="module home">
      <header className="hero">
        <h1>An interactive intuition lab for linear algebra</h1>
      </header>

      <SpaceDemo />

      <div className="home-start">
        <button className="cta" onClick={() => onNavigate('vectors')}>
          Start →
        </button>
      </div>
    </div>
  )
}
