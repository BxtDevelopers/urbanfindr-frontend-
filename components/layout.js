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
//           © {new Date().getFullYear()} UrbanFindr. Built for better living.
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
import React, { useState, useRef, useEffect, Fragment } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  House,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { useApp } from './providers';
import { cityGuides } from '@/lib/catalog';
import { serviceCategories } from '@/lib/serviceCategories';
import CategoryIcon from './CategoryIcon';

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
  const { user, roleMeta, logout } = useApp();

  const [open, setOpen] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuTimeoutRef = useRef(null);

  const [servicesLauncherOpen, setServicesLauncherOpen] = useState(false);
  const launcherTimeoutRef = useRef(null);

  const pathname = usePathname();

  function handleUserMouseEnter() {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
      userMenuTimeoutRef.current = null;
    }
    setUserMenuOpen(true);
  }

  function handleUserMouseLeave() {
    userMenuTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 200);
  }

  function handleLauncherMouseEnter() {
    if (launcherTimeoutRef.current) {
      clearTimeout(launcherTimeoutRef.current);
      launcherTimeoutRef.current = null;
    }
    setServicesLauncherOpen(true);
  }

  function handleLauncherMouseLeave() {
    launcherTimeoutRef.current = setTimeout(() => {
      setServicesLauncherOpen(false);
    }, 200);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest?.('.user-menu-wrap')) {
        setUserMenuOpen(false);
      }
      if (!e.target.closest?.('.services-launcher-wrap')) {
        setServicesLauncherOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
      if (launcherTimeoutRef.current) clearTimeout(launcherTimeoutRef.current);
    };
  }, []);

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
        <Link href="/" className="brand flex items-center gap-2.5 group">
          <span className="brand-icon shrink-0">
            <House size={22} />
          </span>
          <div className="flex flex-col justify-center">
            <span className="brand-text leading-none">
              urban<span className="brand-finder">findr</span><span className="brand-dot">.</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-normal text-stone-500 leading-none mt-1">
              Find. Connect. Build Your Life.
            </span>
          </div>
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

        {/* Right-side actions: User Account & Role Badge */}
        <div className="flex gap-3 items-center">
          {user ? (
            <div
              className="relative user-menu-wrap"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-forest text-white font-bold text-base flex items-center justify-center hover:opacity-90 hover:ring-2 hover:ring-forest/30 transition-all cursor-pointer shadow-sm select-none"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                title={user.name}
              >
                <span>{(user.name || 'U').trim().charAt(0).toUpperCase()}</span>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-stone-200/90 z-50 p-2 transition-all duration-150 animate-in fade-in"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  {/* User Profile Info - Only the user's name */}
                  <div className="px-3 py-2.5 bg-stone-50 rounded-xl mb-1 border border-stone-100">
                    <div className="font-bold text-stone-900 text-sm truncate">
                      {user.name}
                    </div>
                  </div>

                  {/* Dashboard Link */}
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-forest" />
                    <span>Dashboard</span>
                  </Link>

                  <div className="h-px bg-stone-100 my-1" />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={16} className="text-red-600" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="account-btn flex items-center gap-1.5 text-sm font-semibold text-forest hover:bg-stone-100 transition-colors"
            >
              <User size={16} />
              <span>Log in</span>
            </Link>
          )}

          <Link className="btn post-btn" href="/post-property">
            Post property{' '}
            <span className="text-xs bg-lime text-forest rounded px-1.5 py-0.5">
              FREE
            </span>
          </Link>

          {/* Google-style 9-Dots (Waffle) Services App Launcher */}
          <div
            className="relative services-launcher-wrap flex items-center"
            onMouseEnter={handleLauncherMouseEnter}
            onMouseLeave={handleLauncherMouseLeave}
          >
            <button
              type="button"
              onClick={() => setServicesLauncherOpen((prev) => !prev)}
              aria-label="UrbanFindr Services & Solutions"
              aria-expanded={servicesLauncherOpen}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                servicesLauncherOpen
                  ? 'bg-stone-200 text-forest shadow-inner'
                  : 'text-stone-600 hover:text-forest hover:bg-stone-100'
              }`}
              title="Services & Directory"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <circle cx="5" cy="5" r="2.4" />
                <circle cx="12" cy="5" r="2.4" />
                <circle cx="19" cy="5" r="2.4" />
                <circle cx="5" cy="12" r="2.4" />
                <circle cx="12" cy="12" r="2.4" />
                <circle cx="19" cy="12" r="2.4" />
                <circle cx="5" cy="19" r="2.4" />
                <circle cx="12" cy="19" r="2.4" />
                <circle cx="19" cy="19" r="2.4" />
              </svg>
            </button>

            {/* Google-style Services Popup Grid */}
            {servicesLauncherOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-2xl border border-stone-200/90 z-50 p-3 sm:p-4 transition-all duration-150 animate-in fade-in"
                onMouseEnter={handleLauncherMouseEnter}
                onMouseLeave={handleLauncherMouseLeave}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2.5 mb-1.5 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 tracking-tight">
                      All Services
                    </span>
                    <span className="text-[10px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full">
                      {serviceCategories.length}
                    </span>
                  </div>
                  <Link
                    href="/categories"
                    onClick={() => setServicesLauncherOpen(false)}
                    className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
                  >
                    <span>Directory</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* 3-Column Apps Grid matching Google Waffle menu */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-h-[380px] overflow-y-auto p-1 pr-1.5">
                  {serviceCategories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      onClick={() => setServicesLauncherOpen(false)}
                      className="flex flex-col items-center p-2 rounded-2xl hover:bg-stone-50 transition-all duration-150 group text-center"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow transition-transform"
                        style={{
                          backgroundColor: cat.bgTint || '#f5f5f5',
                          borderColor: cat.borderTint || '#e5e5e5',
                          borderWidth: '1px',
                          color: cat.accentColor || '#163e35',
                        }}
                      >
                        <CategoryIcon name={cat.iconName} size={22} />
                      </div>
                      <span className="text-[11px] font-medium text-stone-700 group-hover:text-forest mt-1.5 leading-tight line-clamp-1 w-full">
                        {cat.shortTitle || cat.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Bottom Promo Card matching Google Gemini callout */}
                <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-forest/5 via-lime/10 to-transparent border border-forest/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Sparkles size={15} className="text-forest shrink-0" />
                    <span className="font-medium text-[11px] leading-tight">
                      Explore 13+ verified home solutions
                    </span>
                  </div>
                  <Link
                    href="/categories"
                    onClick={() => setServicesLauncherOpen(false)}
                    className="font-bold text-forest text-xs hover:underline whitespace-nowrap ml-2"
                  >
                    View →
                  </Link>
                </div>
              </div>
            )}
          </div>

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
            {user ? `My dashboard (${roleMeta?.shortLabel || 'Account'})` : 'Log in / Register'}
          </Link>

          {user && (
            <button
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                padding: 0,
                fontSize: 16,
                color: '#991b1b',
              }}
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Sign out
            </button>
          )}
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
            <span className="brand-text">urban<span className="brand-finder">findr</span><span className="brand-dot">.</span></span>
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

      {/* Our Services Bar */}
      <div className="wrap border-t border-white/10 py-6 mx-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Our Services</p>
          <Link href="/categories" className="text-xs text-[#C19A6B] hover:underline inline-flex items-center gap-1 font-medium">
            All categories &amp; services
            <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70">
          <Link href="/properties" className="hover:text-lime">Properties</Link>
          <span className="text-white/30">•</span>
          <Link href="/projects" className="hover:text-lime">Builder Projects</Link>
          <span className="text-white/30">•</span>
          <Link href="/interiors" className="hover:text-lime">Home Interiors</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/landscapers" className="hover:text-lime">Landscapers</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/lawyers" className="hover:text-lime">Lawyers &amp; Legal</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/electricians" className="hover:text-lime">Electricians</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/ac-technicians" className="hover:text-lime">AC Technicians</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/pest-control" className="hover:text-lime">Pest Control</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/pool-cleaning" className="hover:text-lime">Pool Cleaning</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/tank-cleaning" className="hover:text-lime">Tank Cleaning</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/inverter-maintenance" className="hover:text-lime">Inverter Maintenance</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/lift-maintenance" className="hover:text-lime">Lift Maintenance</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/office-supplies" className="hover:text-lime">Office Supplies</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/facility-management" className="hover:text-lime">Facility Management</Link>
        </div>
      </div>

      <div className="wrap border-t border-white/20 py-4 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center mx-auto">
        <span>
          © {new Date().getFullYear()} UrbanFindr. Built for better living.
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
  const { user, ready, hasRole } = useApp();

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

  if (roles && !hasRole(roles)) {
    return (
      <div className="wrap py-20">
        <h2>This area requires additional access.</h2>

        <p className="muted my-5">
          This feature requires an account with {Array.isArray(roles) ? roles.join(' or ') : roles} access. Your current account role is &ldquo;{user.role}&rdquo;.
        </p>

        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="btn">
            Your dashboard
          </Link>
          <Link href="/dashboard/profile" className="btn-outline">
            Account settings &amp; roles
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
