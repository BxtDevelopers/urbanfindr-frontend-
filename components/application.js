'use client';
import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from './providers';
import { Header,Footer,Guard } from './layout';
import HomePage from './home';
import Listings from './listings';
import Details from './details';
import Interiors from './interiors';
import AuthPage from './auth-page';
import PropertyEditor from './property-editor';
import Dashboard from './dashboard';
import Compare from './compare';
import Admin from './admin';
import CityDiscovery from './city-discovery';
import PostProperty from './post-property';
import CategoryComingSoon from './category-coming-soon';
import AllCategoriesPage from './all-categories';
import PropertyDataPreview from './PropertyDataPreview';
import { categories } from '@/lib/catalog';
function Content(){const pathname=usePathname();const [root,id,action]=pathname.split('/').filter(Boolean);if(!root)return <HomePage/>;if(root==='categories'||root==='services'){if(!id)return <AllCategoriesPage/>;return <CategoryComingSoon slug={id}/>;}const category=categories.find(item=>item.path===`/${root}`);if(category)return <Listings key={root} purpose={category.purpose}/>;if(root==='cities')return <CityDiscovery key={id||'all'} slug={id}/>;if(root==='properties'){if(action==='edit')return <Guard roles={['owner','broker','builder','channel_partner','admin']}><PropertyEditor id={id}/></Guard>;return id?<Details id={id}/>:<Listings/>;}if(root==='builder-projects')return id?<Details id={id} project/>:<Listings projects/>;if(root==='home-interiors')return <Interiors id={id}/>;if(root==='projects')return id?<Details id={id} project/>:<Listings projects/>;if(root==='interiors')return <Interiors id={id}/>;if(root==='login'||root==='register')return <AuthPage register={root==='register'}/>;if(root==='admin-login'||(root==='admin'&&id==='login'))return <AuthPage adminLogin={true}/>;if(root==='post-property')return <PostProperty/>;
if(root==='property-model'||root==='property-schema')return <div className="wrap section"><PropertyDataPreview/></div>;if(root==='dashboard')return <Guard><Dashboard section={id}/></Guard>;if(root==='compare')return <Compare/>;if(root==='admin')return <Guard roles={['admin']}><Admin/></Guard>;if(root==='about')return <About/>;if(root==='contact')return <Contact/>;if(root==='privacy')return <Privacy/>;if(root==='terms')return <Terms/>;return <div className="wrap section"><h1>We couldn’t find that page.</h1><Link className="btn mt-6" href="/">Back home</Link></div>;}
export default function Application(){return <><Header/><Suspense fallback={<div className="wrap section">Loading your next chapter…</div>}><Content/></Suspense><Footer/></>;}
function About(){return <div className="wrap section max-w-3xl"><p className="eyebrow">HELLO, WE’RE URBANFINDER</p><h1 className="!text-4xl">A place for every next chapter.</h1><p className="muted leading-8 mt-6">UrbanFinder is an independent demonstration of a direct-owner real estate platform, with property discovery, builder projects and home interior planning. It is not affiliated with NoBroker or any builder. All seeded people, listings, registration references and prices are fictional.</p><div className="panel mt-8 space-y-6"><div><h3>How the platform works</h3><p className="muted leading-7 mt-3">Browse publicly, then register to save homes, contact an owner, message a coordinator or request a visit. Owners submit listings for admin review. Administrators manage users, catalogues, enquiries and progress.</p></div><div><h3>Your information</h3><p className="muted leading-7 mt-3">Your name, email, phone, password hash, favorites, messages, visits, enquiries and notifications are stored in the configured MongoDB database. Uploaded images are stored locally on the app server. Contact phone numbers are available to signed-in users. Consultation details are visible to you, the assigned manager and administrators.</p></div><div><h3>Sessions & storage</h3><p className="muted leading-7 mt-3">A first-party HTTP-only cookie keeps you signed in for up to seven days. Signing out revokes that session. Your comparison shortlist is stored in your browser. No external analytics or payment processing is included.</p></div><div><h3>Before a real transaction</h3><p className="muted leading-7 mt-3">Confirm ownership, project registrations, availability, terms and final prices independently. Visit requests require host confirmation. Interior estimates are indicative and need measurement, scope and material selection. For account deletion, contact the operator of your local installation.</p></div></div></div>;}

function Contact(){
  const { toast } = useApp();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e){
    e.preventDefault();
    setSubmitted(true);
    toast('Thank you for contacting UrbanFinder. Our support team will get back to you shortly.');
  }

  return (
    <div className="wrap section max-w-4xl">
      <p className="eyebrow">GET IN TOUCH</p>
      <h1 className="!text-4xl">We’re here to help you move forward.</h1>
      <p className="muted leading-8 mt-4">Have questions about listings or owner verification? Contact our team anytime.</p>
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="panel space-y-5">
          <h3>Support &amp; Assistance</h3>
          <p className="muted leading-7">Email: <a href="mailto:support@urbanfinder.demo" className="text-forest font-semibold">support@urbanfinder.demo</a></p>
          <p className="muted leading-7">Helpline: <a href="tel:+918000000000" className="text-forest font-semibold">+91 8000 000 000</a> (9 AM – 8 PM)</p>
          <p className="muted leading-7">Head Office: 14th Cross, Indiranagar, Bengaluru, Karnataka 560038</p>
          <div className="border-t border-stone-100 pt-4 text-xs muted space-y-1">
            <p>✓ Direct owner guidance</p>
            <p>✓ Property verification checks</p>
            <p>✓ Technical &amp; account support</p>
          </div>
        </div>
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h3>Send a message</h3>
          {submitted ? (
            <div className="p-4 bg-cream text-forest rounded text-sm">
              Your inquiry has been received! We will respond within 24 hours.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1">Your Name</label>
                <input required className="input" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email Address</label>
                <input required type="email" className="input" placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Topic</label>
                <select className="input">
                  <option>General Inquiry</option>
                  <option>Listing Verification</option>
                  <option>Owner Account &amp; Posting</option>
                  <option>Builder Projects</option>
                  <option>Home Interiors</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Message</label>
                <textarea required rows={4} className="input" placeholder="How can we assist you?"></textarea>
              </div>
              <button type="submit" className="btn w-full">Send Message</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function Privacy(){
  return (
    <div className="wrap section max-w-3xl">
      <p className="eyebrow">PRIVACY &amp; DATA POLICY</p>
      <h1 className="!text-4xl">Your privacy is non-negotiable.</h1>
      <p className="muted leading-8 mt-4">UrbanFinder believes in direct connections without selling, renting, or exploiting personal data.</p>
      <div className="panel mt-8 space-y-6 leading-7">
        <div>
          <h3 className="font-semibold text-lg">1. Information We Collect</h3>
          <p className="muted mt-2">When you create an account, we collect your name, email address, phone number, and account role. For property listings, we store listing details, uploaded photos, and locality information provided by you.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">2. Direct Connection &amp; Privacy</h3>
          <p className="muted mt-2">Your contact phone number is shared only with verified signed-in users who express direct interest in your listing or schedule a visit. We never sell phone numbers to cold-calling agencies or third-party marketers.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">3. Cookie &amp; Session Storage</h3>
          <p className="muted mt-2">We use first-party HTTP-only session cookies to authenticate your account. We do not use third-party tracking pixels or behavioral advertising cookies.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">4. Data Retention &amp; Deletion</h3>
          <p className="muted mt-2">You can request account and listing deletion at any time by contacting our support team. Archiving a property immediately removes it from all public search indexes.</p>
        </div>
      </div>
    </div>
  );
}

function Terms(){
  return (
    <div className="wrap section max-w-3xl">
      <p className="eyebrow">TERMS OF SERVICE</p>
      <h1 className="!text-4xl">Terms and Conditions</h1>
      <p className="muted leading-8 mt-4">Please read these terms carefully before posting or browsing properties on UrbanFinder.</p>
      <div className="panel mt-8 space-y-6 leading-7">
        <div>
          <h3 className="font-semibold text-lg">1. Direct Connection Platform</h3>
          <p className="muted mt-2">UrbanFinder provides a direct connection platform between property owners, prospective buyers, and tenants. No transaction fees are charged by UrbanFinder for listing or discovering properties.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">2. Owner Listing Guidelines</h3>
          <p className="muted mt-2">Listings must represent genuine properties with accurate pricing, specifications, and truthful descriptions. Posting fake inventory or duplicate broker advertisements will lead to immediate listing rejection and account suspension.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">3. Site Visits &amp; Direct Dealing</h3>
          <p className="muted mt-2">Site visit requests are coordinated directly between the visitor and the owner. All parties must independently verify official property documents, title deeds, and RERA approvals before executing any financial transaction.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">4. Limitation of Liability</h3>
          <p className="muted mt-2">UrbanFinder is an informational demo platform. We do not act as an escrow agent or legal guarantor in property lease or purchase agreements.</p>
        </div>
      </div>
    </div>
  );
}
