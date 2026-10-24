// 'use client';
// import Link from 'next/link';
// import { usePathname,useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { Menu,X,ArrowUpRight,House,GitCompareArrows,Bell } from 'lucide-react';
// import { api,useApp } from './providers';
// import { cityGuides } from '@/lib/catalog';

// function CityPickerModal({ onClose }) {
//   const router = useRouter();
//   function handleCityClick(city) {
//     onClose();
//     router.push(`/projects?city=${encodeURIComponent(city.name)}`);
//   }
//   return (
//     <div className="city-picker-overlay" onClick={onClose}>
//       <div className="city-picker-modal" onClick={e => e.stopPropagation()}>
//         <button className="city-picker-close" onClick={onClose} aria-label="Close"><X size={22}/></button>
//         <div className="city-picker-header">
//           <h2 className="city-picker-title">Choose Your Dream City</h2>
//           <p className="city-picker-subtitle">Select the location of your dream home</p>
//         </div>
//         <div className="city-picker-grid">
//           {cityGuides.map(city => (
//             <button key={city.slug} className="city-picker-item" onClick={() => handleCityClick(city)}>
//               <div className="city-picker-img-wrap">
//                 <img src={city.image} alt={city.name} className="city-picker-img" />
//               </div>
//               <span className="city-picker-name">{city.name}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export function Header(){const {user,setUser,compare,toast}=useApp();const [open,setOpen]=useState(false);
//   const [showProjectsModal, setShowProjectsModal] = useState(false);const pathname=usePathname();const router=useRouter();
//   const links=[['Buy','/buy'],['Rent','/rent'],['PG / Co-living','/pg'],['Commercial','/commercial'],['Home interiors','/interiors']];
//   return <><header className="header"><Link href="/" className="brand"><span className="brand-icon"><House size={22}/></span>urbanfinder<span className="brand-dot">.</span></Link><nav className="desktop-nav">{links.map(([label,href])=><Link key={label} href={href} className={pathname===href.split('?')[0]?'nav-active':''}>{label}</Link>)}<button className={`${pathname==='/projects'?'nav-active':''}`} style={{fontSize:'inherit',background:'none',border:'none',cursor:'pointer',padding:0,font:'inherit',color:'inherit'}} onClick={()=>setShowProjectsModal(true)}>Builder projects</button></nav><div className="flex gap-3 items-center"><Link href="/compare" className="hidden sm:flex items-center gap-1 text-sm" aria-label={`Compare ${compare.length} properties`}><GitCompareArrows size={18}/>{compare.length||''}</Link>{user?<><Link href="/dashboard/notifications" aria-label="Notifications"><Bell size={19}/></Link><Link className="account-btn" href="/dashboard">{user.name.split(' ')[0]}</Link></>:<Link href="/login" className="text-sm font-medium hidden sm:block">Log in</Link>}<Link className="btn post-btn" href="/post-property">Post property <span className="text-xs bg-lime text-forest rounded px-1.5 py-0.5">FREE</span></Link><button className="mobile-menu" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>{open&&<nav className="mobile-nav">{links.map(([label,href])=><Link key={label} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<button style={{textAlign:'left',background:'none',border:'none',cursor:'pointer',font:'inherit',padding:0,fontSize:16}} onClick={()=>{setOpen(false);setShowProjectsModal(true);}}>Builder projects</button><Link href="/properties" onClick={()=>setOpen(false)}>All properties</Link><Link href="/cities" onClick={()=>setOpen(false)}>Explore by city</Link><Link href="/post-property" onClick={()=>setOpen(false)}>Post property — Free</Link><Link href={user?'/dashboard':'/login'} onClick={()=>setOpen(false)}>{user?'My dashboard':'Log in / Register'}</Link></nav>}<nav className="discovery-nav" aria-label="More ways to explore"><Link href="/properties">All properties</Link><Link href="/cities">Explore by city</Link><Link href="/#featured-properties">Featured properties</Link><Link href="/#latest-listings">Latest listings</Link><span>List directly. Find your next match.</span><Link href="/post-property" className="text-forest font-semibold">Post property — Free<ArrowUpRight size={13}/></Link></nav>{showProjectsModal&&<CityPickerModal onClose={()=>setShowProjectsModal(false)}/>}</>;}
// export function Footer(){
//   return (
//     <footer className="bg-forest text-white">
//       <div className="wrap max-w-7xl mx-auto grid md:grid-cols-4 gap-12 py-12">
//         <div className="md:col-span-2">
//           <Link href="/" className="brand !text-white flex items-center gap-2 mb-4">
//             <House size={24} />
//             urbanfinder.
//           </Link>
//           <p className="max-w-sm text-sm text-white/70 mt-4 leading-7">
//             A place for every next chapter. Find a home, meet its owner, and make it yours.
//           </p>
//           <p className="mt-6 text-xs text-white/50">
//             Independent demo platform. Sample listings are fictional; stock photos are illustrative.
//           </p>
//         </div>
//         <div>
//           <h4 className="text-lg font-semibold mb-3">Find your place</h4>
//           <div className="footer-links space-y-2">
//             <Link href="/buy" className="block hover:text-lime">Buy a home</Link>
//             <Link href="/rent" className="block hover:text-lime">Rent a home</Link>
//             <Link href="/pg" className="block hover:text-lime">PG / Co‑living</Link>
//             <Link href="/commercial" className="block hover:text-lime">Commercial</Link>
//             <Link href="/cities" className="block hover:text-lime">Explore by city</Link>
//             <Link href="/projects" className="block hover:text-lime">Builder projects</Link>
//             <Link href="/interiors" className="block hover:text-lime">Home interiors</Link>
//           </div>
//         </div>
//         <div>
//           <h4 className="text-lg font-semibold mb-3">Make it happen</h4>
//           <div className="footer-links space-y-2">
//             <Link href="/post-property" className="block hover:text-lime">List your property</Link>
//             <Link href="/dashboard" className="block hover:text-lime">Your dashboard</Link>
//             <Link href="/compare" className="block hover:text-lime">Compare homes</Link>
//             <Link href="/about" className="block hover:text-lime">About &amp; privacy</Link>
//             <Link href="/PHOTO-SOURCES.md" className="block hover:text-lime">Photo sources</Link>
//           </div>
//         </div>
//       </div>
//       <div className="wrap border-t border-white/20 py-4 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto">
//         <span>© {new Date().getFullYear()} UrbanFinder. Built for better living.</span>
//         <span className="flex items-center">
//           Made for your next move <ArrowUpRight className="inline ml-1" size={13} />
//         </span>
//       </div>
//     </footer>
//   );
// }
// export function Guard({children,roles}){const {user,ready}=useApp();if(!ready)return <div className="wrap py-20">Checking your account…</div>;if(!user)return <div className="wrap py-20"><div className="panel max-w-xl mx-auto p-10 text-center"><h2>Your next chapter starts here</h2><p className="muted my-5">Log in to manage your homes, conversations and appointments.</p><Link className="btn" href="/login">Log in</Link></div></div>;if(roles&&!roles.includes(user.role))return <div className="wrap py-20"><h2>This area requires additional access.</h2><p className="muted my-5">Property posting requires an owner account; administration requires an admin account. Ask an administrator to update your access.</p><Link href="/dashboard" className="btn">Your dashboard</Link></div>;return children;}

// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useState } from 'react';
// import {
//   Menu,
//   X,
//   ArrowUpRight,
//   House,
//   GitCompareArrows,
//   Bell,
// } from 'lucide-react';

// import { useApp } from './providers';
// import { cityGuides } from '@/lib/catalog';

// function CityPickerModal({ onClose }) {
//   const router = useRouter();

//   function handleCityClick(city) {
//     onClose();
//     router.push(`/projects?city=${encodeURIComponent(city.name)}`);
//   }

//   return (
//     <div className="city-picker-overlay" onClick={onClose}>
//       <div
//         className="city-picker-modal"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           className="city-picker-close"
//           onClick={onClose}
//           aria-label="Close"
//         >
//           <X size={22} />
//         </button>

//         <div className="city-picker-header">
//           <h2 className="city-picker-title">Choose Your Dream City</h2>
//           <p className="city-picker-subtitle">
//             Select the location of your dream home
//           </p>
//         </div>

//         <div className="city-picker-grid">
//           {cityGuides.map((city) => (
//             <button
//               key={city.slug}
//               className="city-picker-item"
//               onClick={() => handleCityClick(city)}
//             >
//               <div className="city-picker-img-wrap">
//                 <img
//                   src={city.image}
//                   alt={city.name}
//                   className="city-picker-img"
//                 />
//               </div>
//               <span className="city-picker-name">{city.name}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export function Header() {
//   const { user, compare } = useApp();

//   const [open, setOpen] = useState(false);
//   const [showProjectsModal, setShowProjectsModal] = useState(false);

//   const pathname = usePathname();
//   const router = useRouter();

//   // Buy, Rent, PG and Commercial are removed from the main navbar.
//   // Home Interiors and Builder Projects remain on the right.
//   const links = [
//     ['Home interiors', '/interiors'],
//   ];

//   function handleProjectsClick() {
//     setOpen(false);
//     setShowProjectsModal(true);
//   }

//   return (
//     <>
//       <header className="header">
//         <Link href="/" className="brand">
//           <span className="brand-icon">
//             <House size={22} />
//           </span>
//           urbanfinder<span className="brand-dot">.</span>
//         </Link>

//         {/* Main navigation: aligned to the right */}
//         <nav className="desktop-nav">
//           <div className="flex items-center gap-5">
//             {links.map(([label, href]) => (
//               <Link
//                 key={label}
//                 href={href}
//                 className={
//                   pathname === href.split('?')[0] ? 'nav-active' : ''
//                 }
//               >
//                 {label}
//               </Link>
//             ))}

//             <button
//               className={pathname.startsWith('/projects') ? 'nav-active' : ''}
//               style={{
//                 fontSize: 'inherit',
//                 background: 'none',
//                 border: 'none',
//                 cursor: 'pointer',
//                 padding: 0,
//                 font: 'inherit',
//                 color: 'inherit',
//               }}
//               onClick={handleProjectsClick}
//             >
//               Builder projects
//             </button>
//           </div>
//         </nav>

//         <div className="flex gap-3 items-center">
//           <Link
//             href="/compare"
//             className="hidden sm:flex items-center gap-1 text-sm"
//             aria-label={`Compare ${compare.length} properties`}
//           >
//             <GitCompareArrows size={18} />
//             {compare.length || ''}
//           </Link>

//           {user ? (
//             <>
//               <Link
//                 href="/dashboard/notifications"
//                 aria-label="Notifications"
//               >
//                 <Bell size={19} />
//               </Link>

//               <Link className="account-btn" href="/dashboard">
//                 {user.name.split(' ')[0]}
//               </Link>
//             </>
//           ) : (
//             <Link
//               href="/login"
//               className="text-sm font-medium hidden sm:block"
//             >
//               Log in
//             </Link>
//           )}

//           <Link className="btn post-btn" href="/post-property">
//             Post property{' '}
//             <span className="text-xs bg-lime text-forest rounded px-1.5 py-0.5">
//               FREE
//             </span>
//           </Link>

//           <button
//             className="mobile-menu"
//             aria-label="Toggle navigation"
//             aria-expanded={open}
//             onClick={() => setOpen(!open)}
//           >
//             {open ? <X /> : <Menu />}
//           </button>
//         </div>
//       </header>

//       {/* Mobile navigation */}
//       {open && (
//         <nav className="mobile-nav">
//           {links.map(([label, href]) => (
//             <Link
//               key={label}
//               href={href}
//               onClick={() => setOpen(false)}
//             >
//               {label}
//             </Link>
//           ))}

//           <button
//             style={{
//               textAlign: 'left',
//               background: 'none',
//               border: 'none',
//               cursor: 'pointer',
//               font: 'inherit',
//               padding: 0,
//               fontSize: 16,
//             }}
//             onClick={handleProjectsClick}
//           >
//             Builder projects
//           </button>

//           <Link
//             href="/properties"
//             onClick={() => setOpen(false)}
//           >
//             All properties
//           </Link>

//           <Link
//             href="/cities"
//             onClick={() => setOpen(false)}
//           >
//             Explore by city
//           </Link>

//           <Link
//             href="/post-property"
//             onClick={() => setOpen(false)}
//           >
//             Post property — Free
//           </Link>

//           <Link
//             href={user ? '/dashboard' : '/login'}
//             onClick={() => setOpen(false)}
//           >
//             {user ? 'My dashboard' : 'Log in / Register'}
//           </Link>
//         </nav>
//       )}

//       {/* Existing discovery navbar — unchanged */}
//       <nav
//         className="discovery-nav"
//         aria-label="More ways to explore"
//       >
//         <Link href="/properties">All properties</Link>
//         <Link href="/cities">Explore by city</Link>
//         <Link href="/#featured-properties">Featured properties</Link>
//         <Link href="/#latest-listings">Latest listings</Link>

//         <span>List directly. Find your next match.</span>

//         <Link
//           href="/post-property"
//           className="text-forest font-semibold"
//         >
//           Post property <ArrowUpRight size={13} />
//         </Link>
//       </nav>

//       {showProjectsModal && (
//         <CityPickerModal
//           onClose={() => setShowProjectsModal(false)}
//         />
//       )}
//     </>
//   );
// }

// export function Footer() {
//   return (
//     <footer className="bg-forest text-white">
//       <div className="wrap max-w-7xl mx-auto grid md:grid-cols-4 gap-12 py-12">
//         <div className="md:col-span-2">
//           <Link
//             href="/"
//             className="brand !text-white flex items-center gap-2 mb-4"
//           >
//             <House size={24} />
//             urbanfinder.
//           </Link>

//           <p className="max-w-sm text-sm text-white/70 mt-4 leading-7">
//             A place for every next chapter. Find a home, meet its owner,
//             and make it yours.
//           </p>

//           <p className="mt-6 text-xs text-white/50">
//             Independent demo platform. Sample listings are fictional;
//             stock photos are illustrative.
//           </p>
//         </div>

//         <div>
//           <h4 className="text-lg font-semibold mb-3">Find your place</h4>
//           <div className="footer-links space-y-2">
//             <Link href="/buy" className="block hover:text-lime">
//               Buy a home
//             </Link>
//             <Link href="/rent" className="block hover:text-lime">
//               Rent a home
//             </Link>
//             <Link href="/pg" className="block hover:text-lime">
//               PG / Co-living
//             </Link>
//             <Link href="/commercial" className="block hover:text-lime">
//               Commercial
//             </Link>
//             <Link href="/cities" className="block hover:text-lime">
//               Explore by city
//             </Link>
//             <Link href="/projects" className="block hover:text-lime">
//               Builder projects
//             </Link>
//             <Link href="/interiors" className="block hover:text-lime">
//               Home interiors
//             </Link>
//           </div>
//         </div>

//         <div>
//           <h4 className="text-lg font-semibold mb-3">Make it happen</h4>
//           <div className="footer-links space-y-2">
//             <Link href="/post-property" className="block hover:text-lime">
//               List your property
//             </Link>
//             <Link href="/dashboard" className="block hover:text-lime">
//               Your dashboard
//             </Link>
//             <Link href="/compare" className="block hover:text-lime">
//               Compare homes
//             </Link>
//             <Link href="/about" className="block hover:text-lime">
//               About &amp; privacy
//             </Link>
//             <Link href="/PHOTO-SOURCES.md" className="block hover:text-lime">
//               Photo sources
//             </Link>
//           </div>
//         </div>
//       </div>

//       <div className="wrap border-t border-white/20 py-4 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto">
//         <span>
//           © {new Date().getFullYear()} UrbanFinder. Built for better living.
//         </span>

//         <span className="flex items-center">
//           Made for your next move
//           <ArrowUpRight className="inline ml-1" size={13} />
//         </span>
//       </div>
//     </footer>
//   );
// }

// export function Guard({ children, roles }) {
//   const { user, ready } = useApp();

//   if (!ready) {
//     return <div className="wrap py-20">Checking your account…</div>;
//   }

//   if (!user) {
//     return (
//       <div className="wrap py-20">
//         <div className="panel max-w-xl mx-auto p-10 text-center">
//           <h2>Your next chapter starts here</h2>
//           <p className="muted my-5">
//             Log in to manage your homes, conversations and appointments.
//           </p>
//           <Link className="btn" href="/login">
//             Log in
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (roles && !roles.includes(user.role)) {
//     return (
//       <div className="wrap py-20">
//         <h2>This area requires additional access.</h2>
//         <p className="muted my-5">
//           Property posting requires an owner account; administration
//           requires an admin account. Ask an administrator to update
//           your access.
//         </p>
//         <Link href="/dashboard" className="btn">
//           Your dashboard
//         </Link>
//       </div>
//     );
//   }

//   return children;
// }

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  House,
} from 'lucide-react';

import { useApp } from './providers';
import { cityGuides } from '@/lib/catalog';

function CityPickerModal({ onClose }) {
  const router = useRouter();

  function handleCityClick(city) {
    onClose();
    router.push(`/projects?city=${encodeURIComponent(city.name)}`);
  }

  return (
    <div className="city-picker-overlay" onClick={onClose}>
      <div
        className="city-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="city-picker-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="city-picker-header">
          <h2 className="city-picker-title">
            Choose Your Dream City
          </h2>
          <p className="city-picker-subtitle">
            Select the location of your dream home
          </p>
        </div>

        <div className="city-picker-grid">
          {cityGuides.map((city) => (
            <button
              key={city.slug}
              className="city-picker-item"
              onClick={() => handleCityClick(city)}
            >
              <div className="city-picker-img-wrap">
                <img
                  src={city.image}
                  alt={city.name}
                  className="city-picker-img"
                />
              </div>
              <span className="city-picker-name">
                {city.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { user } = useApp();

  const [open, setOpen] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  const pathname = usePathname();

  // Main navbar links
  const links = [
    ['Home interiors', '/interiors'],
  ];

  function handleProjectsClick() {
    setOpen(false);
    setShowProjectsModal(true);
  }

  return (
    <>
      {/* Main navbar */}
      <header className="header">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <House size={22} />
          </span>
          <span className="brand-text">urban<span className="brand-finder">finder</span><span className="brand-dot">.</span></span>
        </Link>

        <nav className="desktop-nav">
          <div className="flex items-center gap-5">
            {links.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={
                  pathname === href.split('?')[0]
                    ? 'nav-active'
                    : ''
                }
              >
                {label}
              </Link>
            ))}

            <button
              className={
                pathname.startsWith('/projects')
                  ? 'nav-active'
                  : ''
              }
              style={{
                fontSize: 'inherit',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                color: 'inherit',
              }}
              onClick={handleProjectsClick}
            >
              Builder projects
            </button>
          </div>
        </nav>

        {/* Right-side actions: Compare and Notifications removed */}
        <div className="flex gap-3 items-center">
          {user ? (
            <Link className="account-btn" href="/dashboard">
              {user.name.split(' ')[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hidden sm:block"
            >
              Log in
            </Link>
          )}

          <Link className="btn post-btn" href="/post-property">
            Post property{' '}
            <span className="text-xs bg-lime text-forest rounded px-1.5 py-0.5">
              FREE
            </span>
          </Link>

          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile navigation */}
      {open && (
        <nav className="mobile-nav">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          <button
            style={{
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              padding: 0,
              fontSize: 16,
            }}
            onClick={handleProjectsClick}
          >
            Builder projects
          </button>

          <Link
            href="/properties"
            onClick={() => setOpen(false)}
          >
            All properties
          </Link>

          <Link
            href="/cities"
            onClick={() => setOpen(false)}
          >
            Explore by city
          </Link>

          <Link
            href="/post-property"
            onClick={() => setOpen(false)}
          >
            Post property — Free
          </Link>

          <Link
            href={user ? '/dashboard' : '/login'}
            onClick={() => setOpen(false)}
          >
            {user ? 'My dashboard' : 'Log in / Register'}
          </Link>
        </nav>
      )}

      {/* Discovery navbar */}
      <nav
        className="discovery-nav"
        aria-label="More ways to explore"
      >
        <Link href="/properties">
          All properties
        </Link>

        <Link href="/cities">
          Explore by city
        </Link>

        <Link href="/#featured-properties">
          Featured properties
        </Link>

        <Link href="/#latest-listings">
          Latest listings
        </Link>

        <span>
          List directly. Find your next match.
        </span>

        <Link
          href="/post-property"
          className="text-forest font-semibold"
        >
          Post property <ArrowUpRight size={13} />
        </Link>
      </nav>

      {/* Builder projects city picker */}
      {showProjectsModal && (
        <CityPickerModal
          onClose={() => setShowProjectsModal(false)}
        />
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="wrap mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
        <div className="col-span-2">
          <Link
            href="/"
            className="brand !text-white flex items-center gap-2 mb-4"
          >
            <House size={24} />
            <span className="brand-text">urban<span className="brand-finder">finder</span><span className="brand-dot">.</span></span>
          </Link>

          <p className="max-w-sm text-sm text-white/70 mt-4 leading-7">
            A place for every next chapter. Find a home, meet its owner,
            and make it yours — direct and transparent.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
            <span className="bg-white/10 px-2.5 py-1 rounded">100% Direct Owners</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">Verified Listings</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">Instant Site Visits</span>
          </div>

          <p className="mt-6 text-xs text-white/50">
            Independent demonstration real estate platform.
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Find your place
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/buy" className="block hover:text-lime">
              Buy a home
            </Link>
            <Link href="/rent" className="block hover:text-lime">
              Rent a home
            </Link>
            <Link href="/pg" className="block hover:text-lime">
              PG / Co-living
            </Link>
            <Link href="/commercial" className="block hover:text-lime">
              Commercial
            </Link>
            <Link href="/projects" className="block hover:text-lime">
              Builder projects
            </Link>
            <Link href="/interiors" className="block hover:text-lime">
              Home interiors
            </Link>
            <Link href="/categories" className="block hover:text-lime">
              All categories & services
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Popular cities
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/cities/bengaluru" className="block hover:text-lime">
              Bengaluru
            </Link>
            <Link href="/cities/mumbai" className="block hover:text-lime">
              Mumbai
            </Link>
            <Link href="/cities/pune" className="block hover:text-lime">
              Pune
            </Link>
            <Link href="/cities/hyderabad" className="block hover:text-lime">
              Hyderabad
            </Link>
            <Link href="/cities/delhi" className="block hover:text-lime">
              Delhi
            </Link>
            <Link href="/cities/chennai" className="block hover:text-lime">
              Chennai
            </Link>
            <Link href="/cities/gurugram" className="block hover:text-lime">
              Gurugram
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Trust &amp; Legal
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/about" className="block hover:text-lime">
              About us
            </Link>
            <Link href="/contact" className="block hover:text-lime">
              Contact us
            </Link>
            <Link href="/privacy" className="block hover:text-lime">
              Privacy policy
            </Link>
            <Link href="/terms" className="block hover:text-lime">
              Terms &amp; conditions
            </Link>
            <Link href="/post-property" className="block hover:text-lime">
              Post property (Free)
            </Link>
            <Link href="/dashboard" className="block hover:text-lime">
              Your dashboard
            </Link>
            <Link href="/PHOTO-SOURCES.md" className="block hover:text-lime">
              Photo sources
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Localities Bar */}
      <div className="wrap border-t border-white/10 py-6 mx-auto">
        <p className="text-xs font-semibold text-white/60 mb-3 tracking-wider uppercase">Popular Localities</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
          <Link href="/properties?q=Indiranagar" className="hover:text-lime">Indiranagar</Link>
          <span>•</span>
          <Link href="/properties?q=Whitefield" className="hover:text-lime">Whitefield</Link>
          <span>•</span>
          <Link href="/properties?q=HSR Layout" className="hover:text-lime">HSR Layout</Link>
          <span>•</span>
          <Link href="/properties?q=Gachibowli" className="hover:text-lime">Gachibowli</Link>
          <span>•</span>
          <Link href="/properties?q=Kondapur" className="hover:text-lime">Kondapur</Link>
          <span>•</span>
          <Link href="/properties?q=Powai" className="hover:text-lime">Powai</Link>
          <span>•</span>
          <Link href="/properties?q=Andheri West" className="hover:text-lime">Andheri West</Link>
          <span>•</span>
          <Link href="/properties?q=Baner" className="hover:text-lime">Baner</Link>
          <span>•</span>
          <Link href="/properties?q=Wakad" className="hover:text-lime">Wakad</Link>
          <span>•</span>
          <Link href="/properties?q=South Extension" className="hover:text-lime">South Extension</Link>
          <span>•</span>
          <Link href="/properties?q=Golf Course Road" className="hover:text-lime">Golf Course Road</Link>
          <span>•</span>
          <Link href="/properties?q=Adyar" className="hover:text-lime">Adyar</Link>
        </div>
      </div>

      <div className="wrap border-t border-white/20 py-4 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center mx-auto">
        <span>
          © {new Date().getFullYear()} UrbanFinder. Built for better living.
        </span>

        <span className="flex items-center">
          Made for your next move
          <ArrowUpRight className="inline ml-1" size={13} />
        </span>
      </div>
    </footer>
  );
}

export function Guard({ children, roles }) {
  const { user, ready } = useApp();

  if (!ready) {
    return (
      <div className="wrap py-20">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap py-20">
        <div className="panel max-w-xl mx-auto p-10 text-center">
          <h2>Your next chapter starts here</h2>

          <p className="muted my-5">
            Log in to manage your homes, conversations and appointments.
          </p>

          <Link className="btn" href="/login">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="wrap py-20">
        <h2>This area requires additional access.</h2>

        <p className="muted my-5">
          Property posting requires an owner account; administration
          requires an admin account. Ask an administrator to update
          your access.
        </p>

        <Link href="/dashboard" className="btn">
          Your dashboard
        </Link>
      </div>
    );
  }

  return children;
}
