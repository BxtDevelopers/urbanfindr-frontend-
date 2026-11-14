'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, CalendarDays, ArrowRight, Send, X, CheckCircle2 } from 'lucide-react';
import CalendarTimePicker from './CalendarTimePicker';
import { useApp, api } from './providers';
import { Field, Submit } from './ui';
import { cities, money } from '@/lib/format';

export function ConnectPanel({ item, project = false }) {
  const { user, toast } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [lastSentThreadId, setLastSentThreadId] = useState(null);
  const ref = project ? { project: item._id } : { property: item._id };

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    const text = messageText.trim();
    if (!text) {
      toast('Please enter a message for the host.');
      return;
    }
    setSendingMessage(true);
    try {
      // 1. Create or get existing thread with the owner/manager
      const thread = await api('threads', { method: 'POST', body: ref });
      // 2. Post the actual message to the thread
      await api(`threads/${thread._id}/messages`, {
        method: 'POST',
        body: { text }
      });
      setMessageText('');
      setShowMessageBox(false);
      setLastSentThreadId(thread._id);
      toast({
        message: `Message sent to ${item.owner?.name || (project ? 'coordinator' : 'owner')}! Click to view chat →`,
        href: `/dashboard/messages?thread=${thread._id}`,
        onClick: () => router.push(`/dashboard/messages?thread=${thread._id}`)
      });
    } catch (err) {
      toast(err.message || 'Could not send message.');
    } finally {
      setSendingMessage(false);
    }
  }

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

          {/* Message Delivered Confirmation Badge */}
          {lastSentThreadId && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-1.5 truncate">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                Message sent to {project ? 'coordinator' : 'owner'}!
              </span>
              <button
                type="button"
                onClick={() => router.push(`/dashboard/messages?thread=${lastSentThreadId}`)}
                className="font-bold underline text-emerald-900 shrink-0 hover:text-emerald-700 cursor-pointer"
              >
                View Chat →
              </button>
            </div>
          )}

          {/* Interactive Message Box */}
          {showMessageBox ? (
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800">
                  <MessageCircle size={14} className="text-[#163e35]" />
                  <span>Message {project ? 'Coordinator' : (item.owner?.name ? `${item.owner.name} (Owner)` : 'Owner')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageBox(false);
                    setMessageText('');
                  }}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer p-0.5"
                  title="Close message box"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-2.5">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder={`Write your message to ${item.owner?.name || (project ? 'the coordinator' : 'the owner')} regarding pricing, questions or visit details…`}
                  className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-[#163e35] focus:ring-1 focus:ring-[#163e35]"
                  autoFocus
                  disabled={sendingMessage}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={sendingMessage || !messageText.trim()}
                    className="btn flex-1 bg-[#163e35] hover:bg-[#24564a] text-white text-xs font-bold py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{sendingMessage ? 'Sending…' : `Message ${project ? 'Coordinator' : 'Owner'}`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={sendingMessage}
                    onClick={() => {
                      setShowMessageBox(false);
                      setMessageText('');
                    }}
                    className="btn-outline text-xs py-2 px-3 rounded-xl cursor-pointer hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              className="btn-outline w-full text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors cursor-pointer"
              disabled={busy || sendingMessage}
              onClick={() => setShowMessageBox(true)}
            >
              <MessageCircle size={15} />
              <span>Message {project ? 'Coordinator' : 'Owner'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Link className="btn w-full text-xs py-2.5 rounded-xl flex items-center justify-center gap-2" href={`/login?next=${project ? '/projects/' : '/properties/'}${item._id}`}>
            <span>Log in to schedule visit</span>
            <ArrowRight size={15} />
          </Link>
          <Link className="btn-outline w-full text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors" href={`/login?next=${project ? '/projects/' : '/properties/'}${item._id}`}>
            <MessageCircle size={15} />
            <span>Log in to message {project ? 'coordinator' : 'owner'}</span>
          </Link>
        </div>
      )}

      <p className="text-xs text-stone-400 mt-4 leading-5 text-center">
        Your host will receive this request and update confirmation in your dashboard.
      </p>
    </div>
  );
}
export function EnquiryForm({project,design,estimate,estimateOptions,service='Full home'}){const {user,toast}=useApp();const [busy,setBusy]=useState(false),[success,setSuccess]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);const form=new FormData(e.currentTarget);const input=Object.fromEntries(form);try{await api('leads',{method:'POST',body:{...input,kind:project?'project':'interior',...(project?{project:project._id}:{}),...(design?{design:design._id}:{}),budget:Number(input.budget),...(input.preferredAt?{preferredAt:new Date(input.preferredAt).toISOString()}:{preferredAt:undefined})}});setSuccess(true);toast('Your enquiry has been sent.');}catch(e){toast(e.message);}finally{setBusy(false);}}
 if(success)return <div className="panel bg-cream max-w-lg !p-5"><h3>You’re one step closer.</h3><p className="muted text-sm my-3 leading-5">Your enquiry is saved. Follow the consultation and project progress in your dashboard.</p><Link className="btn !text-xs" href="/dashboard/leads">Track your enquiry<ArrowRight size={14}/></Link></div>;
 return <div className="panel scroll-mt-28 max-w-lg !p-5" id="consultation"><p className="eyebrow">{project?'GET PROJECT DETAILS':'START SOMETHING BEAUTIFUL'}</p><h3 className="!text-lg font-bold">{project?'Interested in this community?':'Book a design consultation'}</h3><p className="muted text-xs mt-1.5 mb-4">{project?'Request pricing, availability and a call from the coordinator.':'Tell us a little about your home. We’ll help bring your ideas to life.'}</p>{!user?<Link className="btn !text-xs" href="/login">Log in to send your enquiry</Link>:<form onSubmit={submit} className="space-y-3"><div className="grid sm:grid-cols-2 gap-3"><Field label="Your name"><input name="name" required minLength={2} maxLength={80} defaultValue={user.name} className="!py-2 !text-xs"/></Field><Field label="Phone number"><input name="phone" type="tel" required pattern="\+?[0-9\s-]{10,16}" defaultValue={user.phone} className="!py-2 !text-xs"/></Field><Field label="City"><select name="city" defaultValue={project?.city||'Bengaluru'} className="!py-2 !text-xs">{cities.map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Budget (₹)"><input name="budget" type="number" required min="1" max="1000000000000" defaultValue={project?.price||estimate||550000} className="!py-2 !text-xs"/></Field>{!project&&<><Field label="Home size"><select name="homeSize" defaultValue={estimateOptions?.homeSize||'2 BHK'} className="!py-2 !text-xs">{['1 BHK','2 BHK','3 BHK','4+ BHK'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Service"><select name="service" defaultValue={design?.category||estimateOptions?.service||service} className="!py-2 !text-xs">{['Full home','Kitchen','Bedroom','Living room','Wardrobe'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Finish"><select name="finish" defaultValue={estimateOptions?.finish||'Essential'} className="!py-2 !text-xs">{['Essential','Premium','Luxe'].map(v=><option key={v}>{v}</option>)}</select></Field></>}<Field label="Preferred time (optional)"><input name="preferredAt" type="datetime-local" className="!py-2 !text-xs"/></Field></div><Field label="Note (optional)"><textarea name="note" rows={2} maxLength={2000} placeholder={project?'Preferred configuration, move-in timeline…':'Your style, requirements, possession date…'} className="!py-2 !text-xs"/></Field><label className="check-label !text-xs"><input required type="checkbox"/>I agree to be contacted about this enquiry.</label><Submit busy={busy}>{project?'Request a callback':'Book consultation'}</Submit></form>}</div>;
}
