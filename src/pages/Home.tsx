import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Zap, BarChart3, Bell, CheckCircle2, Clock, Users, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStats, getIssues } from '../lib/api';
import { StatsOverview, Issue } from '../lib/types';
import IssueCard from '../components/IssueCard';

const UNSPLASH = 'https://images.unsplash.com';
const HERO_IMG = `${UNSPLASH}/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80`;
const ABOUT_IMG = `${UNSPLASH}/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80`;
const STATS_IMG = `${UNSPLASH}/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1600&q=80`;

const FEATURE_IMGS = [
  `${UNSPLASH}/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80`,
  `${UNSPLASH}/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80`,
  `${UNSPLASH}/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80`,
  `${UNSPLASH}/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80`,
  `${UNSPLASH}/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80`,
  `${UNSPLASH}/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80`,
];

const CITY_IMGS = [
  { src: `${UNSPLASH}/photo-1772852340517-b11ec88979fc?auto=format&fit=crop&w=600&q=80`,  label: 'Roads & Footpaths' },
  { src: `${UNSPLASH}/photo-1762805543729-361d38e78a37?auto=format&fit=crop&w=600&q=80`, label: 'Sanitation' },
  { src: `${UNSPLASH}/photo-1640101086894-7d70c3e70179?auto=format&fit=crop&w=600&q=80`, label: 'Public Works' },
  { src: `${UNSPLASH}/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80`, label: 'Smart City' },
];

const TESTIMONIALS = [
  {
    name: 'Riya Mehta',
    role: 'Commissioner of Public Works, Pune',
    quote: '"We cut our backlog by 60% in the first quarter. Residents stopped calling hotlines because they could see their issue getting fixed."',
    avatar: `${UNSPLASH}/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80`,
  },
  {
    name: 'David Osei',
    role: 'Head of Smart City, Accra Metropolitan',
    quote: '"The auto-routing alone saved our team 3 hours a day. Issues get to the right department instantly — no more internal email chains."',
    avatar: `${UNSPLASH}/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80`,
  },
  {
    name: 'Sophie Laurent',
    role: 'City Councillor, Lyon Métropole',
    quote: '"Our council now has ward-level data every Monday morning. Policy decisions are finally based on facts, not complaints at town halls."',
    avatar: `${UNSPLASH}/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80`,
  },
];

const CITIES = [
  { name: 'Mumbai', img: `${UNSPLASH}/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80` },
  { name: 'Delhi', img: `${UNSPLASH}/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80` },
  { name: 'Bangalore', img: `${UNSPLASH}/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80` },
  { name: 'Singapore', img: `${UNSPLASH}/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80` },
  { name: 'Amsterdam', img: `${UNSPLASH}/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=400&q=80` },
  { name: 'Toronto', img: `${UNSPLASH}/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=400&q=80` },
];

export default function Home() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [recent, setRecent] = useState<Issue[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    getStats().then(setStats);
    getIssues().then(d => setRecent(d.slice(0, 3)));
  }, []);

  return (
    <div className="bg-white">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img src={HERO_IMG} alt="City" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/75 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/20 border border-white/30 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {t('hero.badge')}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white mb-6">
              {t('hero.title1')}<br />
              <span className="text-blue-300">{t('hero.title2')}</span>
              {t('hero.title3')}
            </h1>
            <p className="text-lg text-blue-100 mb-10 max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/report"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-4 rounded-2xl hover:bg-blue-50 shadow-xl transition-all">
                {t('hero.reportBtn')} <ArrowRight size={18} />
              </Link>
              <Link to="/map"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-4 rounded-2xl hover:bg-white/10 transition-all">
                <MapPin size={18} /> {t('hero.mapBtn')}
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-xs">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      {stats && (
        <section className="bg-blue-600 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: t('stats.resolved'), value: stats.resolved.toLocaleString(), icon: CheckCircle2 },
              { label: t('stats.resolution'), value: `${stats.avg_resolution_days} ${t('common.days')}`, icon: Clock },
              { label: t('stats.satisfaction'), value: `${stats.satisfaction}%`, icon: Users },
              { label: t('stats.municipalities'), value: '200+', icon: MapPin },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <s.icon size={22} className="text-blue-200 mb-2" />
                <span className="text-3xl font-extrabold text-white">{s.value}</span>
                <span className="text-sm text-blue-200">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ ABOUT ═══════════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img src={ABOUT_IMG} alt="Smart city" className="rounded-3xl w-full object-cover h-96 shadow-2xl" />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">2.4M+</p>
                <p className="text-xs text-gray-500">Issues resolved globally</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">{t('about.tag')}</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
              {t('about.title')}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">{t('about.desc1')}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['40%', t('about.stat1')],
                ['94%', t('about.stat2')],
                ['60%', t('about.stat3')],
                ['200+', t('about.stat4')],
              ].map(([num, lbl]) => (
                <div key={lbl} className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-2xl font-extrabold text-blue-600">{num}</p>
                  <p className="text-sm text-gray-600">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">What We Handle</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Every civic problem, one platform</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CITY_IMGS.map((item, i) => (
              <div key={i} className="relative group overflow-hidden rounded-2xl h-52 cursor-pointer">
                <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-bold text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Everything a city needs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin,       title: 'Geo-tagged Reporting',   desc: 'Citizens report issues with location pins and photos from any device, anywhere.',             img: FEATURE_IMGS[0], color: 'from-blue-500 to-blue-700' },
              { icon: Zap,          title: 'Smart Auto-Routing',     desc: 'AI classifies and routes each report to the right department in under 60 seconds.',          img: FEATURE_IMGS[1], color: 'from-orange-500 to-orange-700' },
              { icon: BarChart3,    title: 'Real-Time Analytics',    desc: 'Track resolution rates, hotspots, and department performance with live dashboards.',          img: FEATURE_IMGS[2], color: 'from-green-500 to-green-700' },
              { icon: Bell,         title: 'Resident Notifications', desc: 'Automatic SMS and email updates keep citizens informed at every step.',                       img: FEATURE_IMGS[3], color: 'from-purple-500 to-purple-700' },
              { icon: CheckCircle2, title: 'Department Workflows',   desc: 'Field teams update status from mobile. Supervisors see changes instantly.',                  img: FEATURE_IMGS[4], color: 'from-teal-500 to-teal-700' },
              { icon: Users,        title: 'Council Dashboard',      desc: 'Ward-level data and escalation alerts help leaders make evidence-based decisions.',           img: FEATURE_IMGS[5], color: 'from-red-500 to-red-700' },
            ].map((f, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-60`} />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <f.icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <img src={STATS_IMG} alt="City background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-900/85" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">From report to resolved in days</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Citizen Reports Issue', desc: 'Anyone submits a report via app or web — with photo, location, and AI auto-detection of issue type.', emoji: '📸' },
              { step: '02', title: 'AI Routes to Right Team', desc: 'CityResolve classifies the issue, sets priority, and notifies the responsible department in 60 seconds.', emoji: '🤖' },
              { step: '03', title: 'Resolved & Notified', desc: 'Field teams update status from mobile. The citizen gets notified. Leadership sees it live.', emoji: '✅' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white/10 border border-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
                  {s.emoji}
                </div>
                <div className="text-blue-400 font-extrabold text-sm mb-2">{s.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CITIES GRID ═══════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Trusted Globally</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Cities that use CityResolve</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CITIES.map((city, i) => (
              <div key={i} className="relative group overflow-hidden rounded-2xl h-40 cursor-pointer">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-bold">{city.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ RECENT ISSUES ═══════════════════ */}
      {recent.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Live Feed</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Latest reported issues</h2>
              </div>
              <Link to="/issues" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                {t('common.viewAll')} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recent.map(issue => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Cities love CityResolve</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-gray-100" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <img
          src={`${UNSPLASH}/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80`}
          alt="City at night"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-700/85" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Your city deserves better.
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Join 200+ municipalities resolving issues 40% faster with CityResolve.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/report"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 shadow-xl transition-all">
              {t('hero.reportBtn')} <ArrowRight size={18} />
            </Link>
            <Link to="/auth"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
              {t('nav.getStarted')}
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">Free to use · No credit card · Setup in 30 min</p>
        </div>
      </section>

    </div>
  );
}