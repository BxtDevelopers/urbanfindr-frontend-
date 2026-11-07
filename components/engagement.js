'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, CalendarDays, ArrowRight } from 'lucide-react';
import CalendarTimePicker from './CalendarTimePicker';
import { useApp, api } from './providers';
import { Field, Submit } from './ui';
import { cities, money } from '@/lib/format';

export function ConnectPanel({ item, project = false }) {
  const { user, toast } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const ref = project ? { project: item._id } : { property: item._id };

  async function chat() {
    setBusy(true);
    try {
      const thread = await api('threads', { method: 'POST', body: ref });
      router.push(`/dashboard/messages?thread=${thread._id}`);
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function visit(e) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const scheduledAtVal = form.get('scheduledAt');
    if (!scheduledAtVal) {
      toast('Please select a visit date and time.');
      setBusy(false);
      return;
    }
    const noteVal = form.get('note')?.trim() || '';

    try {
      // 1. Submit site visit (which securely registers the visit and automatically syncs the lead for the property/broker)
      await api('visits', {
        method: 'POST',
        body: {
          ...ref,
          scheduledAt: new Date(scheduledAtVal).toISOString(),
          note: noteVal
        }
      });

      e.target?.reset?.();
      toast({
        message: 'Visit requested! Click here to view in your dashboard →',
        href: '/dashboard/customer?section=visits',
        onClick: () => router.push('/dashboard/customer?section=visits')
      });
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel side-sticky space-y-4">
      <div>
        <p className="eyebrow">{project ? 'MAKE YOUR NEXT MOVE' : 'PLAN YOUR VISIT'}</p>
        <h3 className="text-xl font-bold text-stone-900 mt-1">
          {project ? 'Schedule a Project Tour' : 'Book an In-Person Site Visit'}
        </h3>
        <p className="muted text-xs leading-5 mt-2">
          {project
            ? 'Pick a date on the calendar below to tour sample flats with the project coordinator.'
            : `Choose your preferred date and time on the calendar to visit this property directly with ${item.owner?.name || 'the owner'}.`}
        </p>
      </div>

      {user ? (
        <div className="space-y-3">
          {/* Calendar Visit Booking Form */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-stone-800">
              <CalendarDays size={15} className="text-[#163e35]" />
              <span>Select Visit Date &amp; Time</span>
            </div>

            <form onSubmit={visit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Visit Date &amp; Time (Calendar)
                </label>
                <CalendarTimePicker name="scheduledAt" />
              </div>

              <Field label="A note for your host (optional)">
                <textarea
                  name="note"
                  maxLength={1000}
                  rows={2}
                  placeholder="Anything specific you'd like to inspect or ask?"
                  className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-[#163e35]"
                />
              </Field>

              <button
                type="submit"
                disabled={busy}
                className="btn w-full bg-[#163e35] hover:bg-[#24564a] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarDays size={15} />
                <span>{busy ? 'Requesting Visit…' : 'Schedule Site Visit'}</span>
              </button>
            </form>
          </div>

          <button
            type="button"
            className="btn-outline w-full text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors cursor-pointer"
            disabled={busy}
            onClick={chat}
          >
            <MessageCircle size={15} />
            <span>Message {project ? 'Coordinator' : 'Owner'}</span>
          </button>
        </div>
      ) : (
        <Link className="btn w-full text-xs py-2.5 rounded-xl" href={`/login?next=${project ? '/projects/' : '/properties/'}${item._id}`}>
          Log in to schedule visit<ArrowRight size={15} />
        </Link>
      )}

      <p className="text-xs text-stone-400 mt-4 leading-5 text-center">
        Your host will receive this request and update confirmation in your dashboard.
      </p>
    </div>
  );
}
export function EnquiryForm({project,design,estimate,estimateOptions,service='Full home'}){const {user,toast}=useApp();const [busy,setBusy]=useState(false),[success,setSuccess]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);const form=new FormData(e.currentTarget);const input=Object.fromEntries(form);try{await api('leads',{method:'POST',body:{...input,kind:project?'project':'interior',...(project?{project:project._id}:{}),...(design?{design:design._id}:{}),budget:Number(input.budget),...(input.preferredAt?{preferredAt:new Date(input.preferredAt).toISOString()}:{preferredAt:undefined})}});setSuccess(true);toast('Your enquiry has been sent.');}catch(e){toast(e.message);}finally{setBusy(false);}}
 if(success)return <div className="panel bg-cream"><h3>You’re one step closer.</h3><p className="muted my-4 leading-6">Your enquiry is saved. Follow the consultation and project progress in your dashboard.</p><Link className="btn" href="/dashboard/leads">Track your enquiry<ArrowRight size={16}/></Link></div>;
 return <div className="panel scroll-mt-28" id="consultation"><p className="eyebrow">{project?'GET PROJECT DETAILS':'START SOMETHING BEAUTIFUL'}</p><h3>{project?'Interested in this community?':'Book a design consultation'}</h3><p className="muted text-sm mt-3 mb-5">{project?'Request pricing, availability and a call from the coordinator.':'Tell us a little about your home. We’ll help bring your ideas to life.'}</p>{!user?<Link className="btn" href="/login">Log in to send your enquiry</Link>:<form onSubmit={submit} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><Field label="Your name"><input name="name" required minLength={2} maxLength={80} defaultValue={user.name}/></Field><Field label="Phone number"><input name="phone" type="tel" required pattern="\+?[0-9\s-]{10,16}" defaultValue={user.phone}/></Field><Field label="City"><select name="city" defaultValue={project?.city||'Bengaluru'}>{cities.map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Budget (₹)"><input name="budget" type="number" required min="1" max="1000000000000" defaultValue={project?.price||estimate||550000}/></Field>{!project&&<><Field label="Home size"><select name="homeSize" defaultValue={estimateOptions?.homeSize||'2 BHK'}>{['1 BHK','2 BHK','3 BHK','4+ BHK'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Service"><select name="service" defaultValue={design?.category||estimateOptions?.service||service}>{['Full home','Kitchen','Bedroom','Living room','Wardrobe'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Finish"><select name="finish" defaultValue={estimateOptions?.finish||'Essential'}>{['Essential','Premium','Luxe'].map(v=><option key={v}>{v}</option>)}</select></Field></>}<Field label="Preferred consultation time (optional)"><input name="preferredAt" type="datetime-local"/></Field></div><Field label="Tell us what you have in mind"><textarea name="note" maxLength={2000} placeholder={project?'Preferred configuration, move-in timeline…':'Your style, requirements, possession date…'}/></Field><label className="check-label"><input required type="checkbox"/>I agree to be contacted about this enquiry.</label><Submit busy={busy}>{project?'Request a callback':'Book consultation'}</Submit></form>}</div>;
}
