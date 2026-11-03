'use client';

import {  useState  } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Download,
  Printer,
  Eye,
  Check,
  X,
  Layers,
  Camera,
  Award,
  ThumbsUp,
  MessageSquare,
  Phone,
  User,
  Ruler,
  Maximize2,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { money, date } from '@/lib/format';
import { api, useApp } from '@/components/providers';
import { sampleInteriorProject } from '@/lib/interiorData';

export default function InteriorProjectHub({
  initialProject = null,
  compact = false
}) {
  const { user, toast } = useApp();
  const [project, setProject] = useState(initialProject || sampleInteriorProject);
  const [activeTab, setActiveTab] = useState('tracking'); // tracking | proposals | milestones | approvals | quote | invoices | warranty | review
  const [selectedRender, setSelectedRender] = useState(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [newProgressPhoto, setNewProgressPhoto] = useState('');
  const [newProgressTitle, setNewProgressTitle] = useState('');
  const [newProgressDesc, setNewProgressDesc] = useState('');
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // ACTION HANDLERS

  // 9 & 11: Approve Proposal or Request Changes
  const handleApproveProposal = async (proposalId, approved) => {
    try {
      const updatedProposals = project.proposals.map(p => {
        if (p.proposalId === proposalId) {
          return {
            ...p,
            status: approved ? 'approved' : 'revision_requested',
            feedback: approved ? 'Approved by customer' : revisionFeedback || 'Revisions requested',
            reviewedAt: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      });

      const updatedApprovals = [
        ...(project.approvals || []),
        {
          approvalType: '3D Design Proposal',
          title: `Proposal ${proposalId} - ${approved ? 'Customer Approved' : 'Revision Requested'}`,
          status: approved ? 'approved' : 'rejected',
          approvedAt: new Date().toISOString().split('T')[0],
          notes: approved ? 'Customer finalized 3D renders & materials' : revisionFeedback
        }
      ];

      setProject(prev => ({
        ...prev,
        proposals: updatedProposals,
        approvals: updatedApprovals
      }));

      // Call API if real service-request ID exists
      if (project.projectId && project.projectId.startsWith('SR-')) {
        await api(`service-requests/${project.projectId}`, {
          method: 'PATCH',
          body: {
            action: 'interior_approve_proposal',
            proposalId,
            approved,
            feedback: approved ? 'Approved by customer' : revisionFeedback
          }
        });
      }

      toast(approved ? '3D Design Proposal Approved! Moving to factory production.' : 'Revision feedback sent to your design team.');
      setShowRevisionModal(false);
      setRevisionFeedback('');
    } catch (err) {
      toast(err.message || 'Action failed');
    }
  };

  // 10 & 11: Customer Milestone Sign-off
  const handleApproveMilestone = async (milestoneId) => {
    try {
      const updatedMilestones = project.milestones.map(m => {
        if (m.milestoneId === milestoneId) {
          return {
            ...m,
            approvedByCustomer: true,
            approvedAt: new Date().toISOString().split('T')[0],
            status: 'completed'
          };
        }
        return m;
      });

      const updatedApprovals = [
        ...(project.approvals || []),
        {
          approvalType: 'Milestone Sign-off',
          title: `Milestone ${milestoneId} Verified on Site`,
          status: 'approved',
          approvedAt: new Date().toISOString().split('T')[0],
          notes: 'Customer inspected site deliverables and approved stage.'
        }
      ];

      setProject(prev => ({
        ...prev,
        milestones: updatedMilestones,
        approvals: updatedApprovals
      }));

      toast(`Milestone ${milestoneId} signed off successfully!`);
    } catch (err) {
      toast(err.message || 'Action failed');
    }
  };

  // 13: Milestone Invoice Payment Simulation
  const handlePayInvoice = async (invoiceNumber) => {
    setPaymentBusy(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // UI smoothness

      const updatedInvoices = project.invoices.map(inv => {
        if (inv.invoiceNumber === invoiceNumber) {
          return {
            ...inv,
            status: 'paid',
            paidAt: new Date().toISOString().split('T')[0],
            paymentMethod: 'Instant UPI / Card Payment (Verified)'
          };
        }
        return inv;
      });

      const updatedMilestones = project.milestones.map(m => {
        if (m.invoiceNumber === invoiceNumber) {
          return { ...m, paymentStatus: 'paid' };
        }
        return m;
      });

      const invAmount = project.invoices.find(i => i.invoiceNumber === invoiceNumber)?.total || 0;

      setProject(prev => ({
        ...prev,
        invoices: updatedInvoices,
        milestones: updatedMilestones,
        amountPaid: prev.amountPaid + invAmount,
        amountDue: Math.max(0, prev.amountDue - invAmount)
      }));

      toast(`Payment for ${invoiceNumber} completed successfully! Receipt generated.`);
      setShowInvoiceModal(false);
    } catch (err) {
      toast(err.message || 'Payment processing failed');
    } finally {
      setPaymentBusy(false);
    }
  };

  // 12: Add Daily Progress Log
  const handleAddProgressUpdate = (e) => {
    e.preventDefault();
    if (!newProgressTitle) return;

    const newLog = {
      updateId: `UPD-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      percentComplete: Math.min(100, project.percentComplete + 5),
      dayNumber: (project.currentDay || 26) + 1,
      totalDays: project.totalDays || 45,
      title: newProgressTitle,
      description: newProgressDesc || 'Supervisor verified on-site installation and alignment.',
      photos: newProgressPhoto ? [newProgressPhoto] : ['/photos/kitchen-1.jpg'],
      supervisor: user?.name || 'Venkatesh Murthy (On-Site Supervisor)'
    };

    setProject(prev => ({
      ...prev,
      percentComplete: newLog.percentComplete,
      currentDay: newLog.dayNumber,
      progressUpdates: [newLog, ...(prev.progressUpdates || [])]
    }));

    toast('Progress update & site photograph posted.');
    setNewProgressTitle('');
    setNewProgressDesc('');
    setNewProgressPhoto('');
    setShowAddProgressModal(false);
  };

  // 15: Submit Review
  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviewSubmitted(true);
    toast('Thank you for rating your interior project experience!');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
      {/* PROJECT BANNER & HEADER */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#072518] to-stone-900 text-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PROJECT ID: {project.projectId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-stone-200">
                {project.bhk} · {project.carpetAreaSqFt} sq.ft
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Clock size={11} /> Day {project.currentDay} of {project.totalDays} (45-Day Guarantee)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300">
              {project.property} · {project.locality} · Client: <span className="font-semibold text-white">{project.clientName}</span>
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-6 self-start">
            <div className="text-center">
              <p className="text-[10px] text-stone-300 uppercase tracking-wider font-semibold">Overall Progress</p>
              <p className="text-2xl font-black text-emerald-400">{project.percentComplete}%</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-[10px] text-stone-300 uppercase tracking-wider font-semibold">Contract Value</p>
              <p className="text-base font-bold text-white">{money(project.contractValue)}</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-[10px] text-stone-300 uppercase tracking-wider font-semibold">Paid to Date</p>
              <p className="text-base font-bold text-emerald-300">{money(project.amountPaid)}</p>
            </div>
          </div>
        </div>

        {/* FEATURE 12: Progress Tracking Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Current Stage: Milestone 4 (On-site Modular Assembly)
            </span>
            <span className="text-stone-300">
              Target Handover: <strong className="text-white">{date(project.targetCompletionDate)}</strong>
            </span>
          </div>
          <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${project.percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (Covers All 15 Subsystems) */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-8 flex overflow-x-auto gap-1 sm:gap-2 no-scrollbar">
        {[
          { id: 'tracking', label: '12. Progress Tracking', count: `${project.percentComplete}%` },
          { id: 'proposals', label: '9. 3D Proposals', count: project.proposals?.length || 2 },
          { id: 'milestones', label: '10. Project Milestones', count: `${project.milestones?.filter(m => m.status === 'completed').length}/6` },
          { id: 'approvals', label: '11. Customer Approvals', count: project.approvals?.length || 5 },
          { id: 'quote', label: '8. Itemized Quotation', count: money(project.contractValue) },
          { id: 'invoices', label: '13. Milestone Invoices', count: `${project.invoices?.filter(i => i.status === 'paid').length} Paid` },
          { id: 'floorplan', label: '6 & 7. Floor Plan & Site Survey' },
          { id: 'warranty', label: '14. Handover & 10-Yr Warranty' },
          { id: 'review', label: '15. Reviews & Ratings' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3 sm:px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                active
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-sm -mb-px rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="p-6 sm:p-8">
        {/* ================= TAB 1: FEATURE 12 - PROGRESS TRACKING ================= */}
        {activeTab === 'tracking' && (
          <div className="space-y-8 animate-fade-in">
            {/* Lead Designer & PM Ribbon */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-4">
                <img
                  src={project.designer?.avatar || '/photos/avatar-pro.jpg'}
                  alt={project.designer?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Lead Interior Architect
                  </span>
                  <h4 className="text-base font-bold text-stone-900 truncate mt-1">
                    {project.designer?.name} ({project.designer?.studio})
                  </h4>
                  <p className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                    <span>★ {project.designer?.rating} (184 reviews)</span>
                    <span>·</span>
                    <a href={`tel:${project.designer?.phone}`} className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                      <Phone size={11} /> {project.designer?.phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-4">
                <img
                  src={project.projectManager?.avatar || '/photos/avatar-pro.jpg'}
                  alt={project.projectManager?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Dedicated On-Site Supervisor
                  </span>
                  <h4 className="text-base font-bold text-stone-900 truncate mt-1">
                    {project.projectManager?.name}
                  </h4>
                  <p className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                    <span>Daily Site Presence</span>
                    <span>·</span>
                    <a href={`tel:${project.projectManager?.phone}`} className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                      <Phone size={11} /> {project.projectManager?.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Supervisor Site Photo Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Live Site Photo Feed &amp; Daily Supervisor Logs</h3>
                  <p className="text-xs text-stone-500">Real-time execution photos uploaded from your flat</p>
                </div>
                <button
                  onClick={() => setShowAddProgressModal(true)}
                  className="btn btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Camera size={14} className="text-emerald-600" /> + Post Site Update
                </button>
              </div>

              <div className="space-y-6">
                {project.progressUpdates?.map((log, idx) => (
                  <div key={log.updateId || idx} className="panel border-l-4 border-l-emerald-600 p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          D{log.dayNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{log.title}</h4>
                          <p className="text-[11px] text-stone-400">
                            Logged by {log.supervisor} on {date(log.date)}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {log.percentComplete}% Project Complete
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {log.description}
                    </p>

                    {log.photos && log.photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {log.photos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setSelectedRender(photo)}
                            className="relative group rounded-lg overflow-hidden border border-stone-200 aspect-video cursor-pointer"
                          >
                            <img
                              src={photo}
                              alt="Site update"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Maximize2 size={14} /> Enlarge
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FEATURE 9 - DESIGN PROPOSALS ================= */}
        {activeTab === 'proposals' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">3D Photorealistic Design Proposals</h3>
                <p className="text-xs text-stone-500">Virtual walkthroughs, moodboards and material specifications</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                Latest Version: v1.2 (Approved)
              </span>
            </div>

            {project.proposals?.map((prop) => (
              <div key={prop.proposalId} className="border border-stone-200 rounded-xl overflow-hidden p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {prop.proposalId} ({prop.version})
                      </span>
                      <h4 className="text-base font-bold text-stone-900">{prop.title}</h4>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">Submitted: {date(prop.submittedAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {prop.status === 'approved' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Customer Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        Pending Customer Review
                      </span>
                    )}

                    <button
                      onClick={() => handleApproveProposal(prop.proposalId, true)}
                      className="btn btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1"
                    >
                      <Check size={14} /> Approve Design
                    </button>
                    <button
                      onClick={() => {
                        setShowRevisionModal(true);
                      }}
                      className="btn btn-outline text-xs px-3.5 py-1.5 flex items-center gap-1"
                    >
                      <RefreshCw size={14} /> Request Revisions
                    </button>
                  </div>
                </div>

                {/* 3D Renders Grid */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    3D Render Gallery (Click to inspect high-resolution render)
                  </h5>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {prop.renders?.map((renderUrl, rIdx) => (
                      <div
                        key={rIdx}
                        onClick={() => setSelectedRender(renderUrl)}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 aspect-[4/3] cursor-pointer shadow-sm"
                      >
                        <img
                          src={renderUrl}
                          alt={`Render ${rIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 text-white text-xs font-medium">
                          <span className="flex items-center gap-1">
                            <Eye size={13} /> View 3D Angle {rIdx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Swatches & Specs */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Selected Materials &amp; Hardware Specifications
                  </h5>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {prop.materials?.map((mat, mIdx) => (
                      <div key={mIdx} className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-xs space-y-1">
                        <p className="font-bold text-stone-800">{mat.item}</p>
                        <p className="text-stone-600 leading-snug">{mat.specification}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">{mat.brand}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes and Feedback */}
                {prop.feedback && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                    <strong>Customer Signoff Note:</strong> {prop.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 3: FEATURE 10 - PROJECT MILESTONES ================= */}
        {activeTab === 'milestones' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Project Execution Milestones (6 Standard Phases)</h3>
              <p className="text-xs text-stone-500">Every milestone must meet factory quality standards before signoff</p>
            </div>

            <div className="space-y-4">
              {project.milestones?.map((ms) => {
                const isDone = ms.status === 'completed';
                const isCurrent = ms.status === 'in_progress';

                return (
                  <div
                    key={ms.milestoneId}
                    className={`border rounded-xl p-5 transition-all ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isCurrent
                        ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300'
                        : 'border-stone-200 bg-white opacity-80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-stone-200 text-stone-600'
                        }`}>
                          {isDone ? <Check size={16} /> : ms.stage}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                              Stage {ms.stage} ({ms.percentage}%)
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {ms.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-900 mt-0.5">{ms.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <p className="font-bold text-stone-800">{money(ms.amount)}</p>
                          <p className="text-[11px] text-stone-400">Target: {date(ms.targetDate)}</p>
                        </div>

                        {ms.approvedByCustomer ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                            <CheckCircle2 size={13} /> Customer Signed Off
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveMilestone(ms.milestoneId)}
                            className="btn btn-outline text-xs px-3 py-1 flex items-center gap-1"
                          >
                            <Check size={13} /> Sign Off Milestone
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Deliverables List */}
                    <div className="mt-4 pt-3 border-t border-stone-200/60 grid sm:grid-cols-2 gap-2 text-xs text-stone-600">
                      {ms.deliverables?.map((del, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className={isDone ? 'text-emerald-600' : 'text-stone-300'} />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>

                    {/* Inspection Photos if any */}
                    {ms.sitePhotos && ms.sitePhotos.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-stone-500">Inspection Proof:</span>
                        {ms.sitePhotos.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setSelectedRender(p)}
                            className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Camera size={12} /> Photo {pIdx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: FEATURE 11 - CUSTOMER APPROVALS ================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Customer Digital Approval Audit Trail</h3>
                <p className="text-xs text-stone-500">Every design, material, and structural alteration is formally signed off</p>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                100% Transparency Guaranteed
              </span>
            </div>

            <div className="space-y-3">
              {project.approvals?.map((appr, aIdx) => (
                <div key={aIdx} className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      appr.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}>
                      {appr.status === 'approved' ? <Check size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {appr.approvalType}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900">{appr.title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{appr.notes}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      appr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {appr.status.toUpperCase()}
                    </span>
                    {appr.approvedAt && (
                      <p className="text-[11px] text-stone-400 mt-1">Signed on {date(appr.approvedAt)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: FEATURE 8 - CUSTOMIZED QUOTATION ================= */}
        {activeTab === 'quote' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Customized Bill of Quantities &amp; Estimate</h3>
                <p className="text-xs text-stone-500">Quote #{project.customQuote?.quoteNumber} · Zero hidden surcharges</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print Quote
                </button>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Accepted Quote
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Scope &amp; Material Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {project.customQuote?.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-3 font-semibold text-stone-700 whitespace-nowrap">{item.category}</td>
                      <td className="p-3 text-stone-800 max-w-md">{item.item}</td>
                      <td className="p-3 text-center font-mono text-stone-600">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right font-mono text-stone-600">{money(item.rate)}</td>
                      <td className="p-3 text-right font-bold text-stone-900 font-mono">{money(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50 border-t border-stone-200 text-xs font-semibold">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-stone-600">Subtotal:</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-900">{money(project.customQuote?.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-emerald-700">Special Promo Discount:</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">-{money(project.customQuote?.discount)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-stone-600">GST (18%):</td>
                    <td className="p-3 text-right font-mono text-stone-700">{money(project.customQuote?.gst)}</td>
                  </tr>
                  <tr className="bg-emerald-50 text-sm font-bold text-emerald-950">
                    <td colSpan={4} className="p-3 text-right">Total Final Contract Value:</td>
                    <td className="p-3 text-right font-mono text-emerald-800">{money(project.customQuote?.grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: FEATURE 13 - INVOICE MANAGEMENT ================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Milestone-Based Invoice Management</h3>
                <p className="text-xs text-stone-500">Pay only after milestones are verified on site</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-stone-700">Amount Due: </span>
                <span className="text-base font-bold text-amber-700">{money(project.amountDue)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {project.invoices?.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isDue = inv.status === 'unpaid';

                return (
                  <div
                    key={inv.invoiceNumber}
                    className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 transition-all ${
                      isPaid
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isDue
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-stone-200 bg-white opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">{inv.invoiceNumber}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : isDue ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-800 mt-1">{inv.milestone}</h4>
                      <p className="text-[11px] text-stone-500">Issued: {date(inv.issueDate)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-stone-900 font-mono">{money(inv.total)}</p>
                        {isPaid && (
                          <p className="text-[10px] text-emerald-700 font-medium">Paid on {date(inv.paidAt)}</p>
                        )}
                      </div>

                      {isPaid ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowInvoiceModal(true);
                          }}
                          className="btn btn-outline text-xs px-3 py-1 flex items-center gap-1"
                        >
                          <FileText size={13} /> View Receipt
                        </button>
                      ) : isDue ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowInvoiceModal(true);
                          }}
                          className="btn btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1"
                        >
                          <DollarSign size={13} /> Pay Milestone
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 font-medium px-3 py-1">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 7: FEATURE 6 & 7 - FLOOR PLAN & SITE VISIT ================= */}
        {activeTab === 'floorplan' && (
          <div className="space-y-8 animate-fade-in">
            {/* Feature 6: Floor-plan uploads */}
            <div className="border border-stone-200 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Uploaded 2D / 3D Floor Plan Blueprint</h3>
                  <p className="text-xs text-stone-500">Architect validated dimensions and carpet area</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-200">
                  {project.floorPlan?.carpetArea} sq.ft Verified
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div
                  onClick={() => setSelectedRender(project.floorPlan?.url)}
                  className="rounded-xl overflow-hidden border border-stone-200 shadow-sm cursor-pointer aspect-[4/3] relative group"
                >
                  <img
                    src={project.floorPlan?.url || '/photos/apartment-1.jpg'}
                    alt="Floor plan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <Maximize2 size={16} /> Click to Enlarge Floor Plan
                  </div>
                </div>

                <div className="space-y-3 text-xs text-stone-700">
                  <div className="p-3 bg-stone-50 rounded-lg space-y-1.5 border border-stone-200">
                    <p><strong>File Name:</strong> {project.floorPlan?.filename}</p>
                    <p><strong>Carpet Area:</strong> {project.floorPlan?.carpetArea} sq.ft</p>
                    <p><strong>Configuration:</strong> {project.floorPlan?.roomsCount}</p>
                    <p><strong>Uploaded:</strong> {date(project.floorPlan?.uploadedAt)}</p>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    <strong>Site Engineer Notes:</strong> {project.floorPlan?.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 7: Site-visit requests */}
            <div className="border border-stone-200 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-stone-900">In-Person Laser Measurement &amp; Site Survey</h3>
                  <p className="text-xs text-stone-500">Structural wall inspection and MEP electrical rough-in survey</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
                  SURVEY COMPLETED
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-stone-400 font-semibold">Survey Date</p>
                  <p className="text-stone-900 font-bold mt-1">{date(project.siteVisit?.scheduledDate)}</p>
                  <p className="text-stone-500">{project.siteVisit?.timeSlot}</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-stone-400 font-semibold">Assigned Surveyor</p>
                  <p className="text-stone-900 font-bold mt-1">{project.siteVisit?.surveyor}</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-stone-400 font-semibold">Verification Result</p>
                  <p className="text-emerald-700 font-bold mt-1">Zero Obstruction Clearance</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: FEATURE 14 - PROJECT COMPLETION & 10-YR WARRANTY ================= */}
        {activeTab === 'warranty' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-2 border-emerald-600 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-emerald-50/50 to-white relative overflow-hidden shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Official UrbanFindr Certificate
                    </span>
                    <h3 className="text-xl font-bold text-stone-900 mt-1">
                      10-Year Comprehensive Material &amp; Structural Warranty
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-300">
                    {project.warranty?.certificateId}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 my-6 text-xs text-stone-700">
                <div className="space-y-1">
                  <p className="font-bold text-stone-900">Warranty Term:</p>
                  <p className="text-base font-extrabold text-emerald-700">10 Full Years (120 Months)</p>
                  <p className="text-stone-500">Covers BWP Marine Plywood against fungus, termites &amp; delamination.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-stone-900">Hardware Coverage:</p>
                  <p className="text-base font-extrabold text-stone-900">Hafele &amp; Blum Certified</p>
                  <p className="text-stone-500">Replacement warranty on soft-close tandem runners &amp; hinges.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-stone-900">Snag List Status:</p>
                  <p className="text-base font-extrabold text-emerald-700">108-Point Inspection</p>
                  <p className="text-stone-500">Zero open snags at time of preliminary audit.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-stone-600">
                  <p className="font-semibold text-stone-900">Download Formal Handover Certificate &amp; Maintenance Kit</p>
                  <p className="text-[11px] text-stone-500">Includes Acrylic cleaning guide, quartz sealer instructions, and warranty card</p>
                </div>
                <button
                  onClick={() => toast('Warranty Card & Care Manual downloaded.')}
                  className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Download size={14} /> Download 10-Yr Warranty Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 9: FEATURE 15 - CUSTOMER REVIEWS ================= */}
        {activeTab === 'review' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Customer Project Review &amp; Designer Feedback</h3>
              <p className="text-xs text-stone-500">Rate your experience to help future homeowners</p>
            </div>

            {reviewSubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-base font-bold text-stone-900">Review Submitted!</h4>
                <p className="text-xs text-stone-600">
                  Thank you for rating {project.designer?.name} ({project.designer?.studio}). Your verified feedback will appear on the designer’s public showcase.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Overall Experience Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition-colors ${
                          star <= reviewRating ? 'text-amber-400' : 'text-stone-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-700 ml-2">
                      {reviewRating} out of 5 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                    <span className="font-semibold text-stone-700">Design Creativity</span>
                    <p className="text-amber-500 text-sm">★★★★★</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                    <span className="font-semibold text-stone-700">On-Time Move-In</span>
                    <p className="text-amber-500 text-sm">★★★★★</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Your Testimonial &amp; Comments
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Tell other homeowners about the 45-day turnaround, finish quality, and designer responsiveness..."
                    className="w-full text-xs rounded-lg border border-stone-300 p-3"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary text-xs px-6 py-2"
                >
                  Submit Verified Review ✓
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL FOR 3D RENDERS / PHOTOS */}
      {selectedRender && (
        <div
          onClick={() => setSelectedRender(null)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl max-h-[92vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-700 flex flex-col my-auto"
          >
            <button
              type="button"
              onClick={() => setSelectedRender(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <img
              src={selectedRender}
              alt="High resolution inspect"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* REVISION REQUEST MODAL - FULL NON-CLIPPED VIEW */}
      {showRevisionModal && (
        <div 
          onClick={() => setShowRevisionModal(false)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
          >
            <div className="shrink-0 bg-stone-900 text-white p-5 flex justify-between items-center border-b border-stone-800">
              <h3 className="text-base font-bold text-white m-0">Request Design Revisions</h3>
              <button 
                type="button" 
                onClick={() => setShowRevisionModal(false)} 
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-stone-700 overscroll-contain">
              <p className="text-stone-500 leading-relaxed">
                Provide specific feedback on 3D renders, cabinet layouts, or material swatches. Our architect will revise within 48 hours.
              </p>
              <textarea
                rows={4}
                value={revisionFeedback}
                onChange={e => setRevisionFeedback(e.target.value)}
                placeholder="e.g. Please change kitchen shutter shade to darker sage, and add profile lights behind the bed-back."
                className="w-full text-xs rounded-lg border border-stone-300 p-3"
              />
            </div>
            <div className="shrink-0 bg-stone-50 border-t border-stone-200 p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="btn btn-outline text-xs px-3.5 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApproveProposal('PROP-02', false)}
                className="btn btn-primary text-xs px-4 py-1.5 cursor-pointer shadow-sm"
              >
                Submit Revisions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE & PAYMENT MODAL - FULL VIEW */}
      {showInvoiceModal && selectedInvoice && (
        <div 
          onClick={() => setShowInvoiceModal(false)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
          >
            <div className="shrink-0 bg-stone-900 text-white p-5 flex justify-between items-center border-b border-stone-800">
              <div>
                <h3 className="text-base font-bold text-white m-0">Tax Invoice {selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-stone-300 mt-0.5">{selectedInvoice.milestone}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowInvoiceModal(false)} 
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs overscroll-contain">
              <div className="flex justify-between border-b border-stone-100 pb-3">
                <span className="text-stone-500">Invoice Amount:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">{money(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-3">
                <span className="text-stone-500">GST (18%):</span>
                <span className="font-mono text-stone-700">{money(selectedInvoice.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold bg-stone-50 p-3 rounded-lg border border-stone-200">
                <span className="text-stone-800">Total Payable:</span>
                <span className="text-emerald-700 font-mono text-base">{money(selectedInvoice.total)}</span>
              </div>

              {selectedInvoice.status === 'paid' ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Milestone Payment Confirmed
                  </p>
                  <p className="text-[11px] text-stone-600">Paid via {selectedInvoice.paymentMethod} on {date(selectedInvoice.paidAt)}</p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-stone-600 font-medium">Choose payment method to release milestone funds to factory:</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePayInvoice(selectedInvoice.invoiceNumber)}
                      disabled={paymentBusy}
                      className="p-3 border border-emerald-500 bg-emerald-50 text-emerald-900 rounded-xl font-bold hover:bg-emerald-100 transition-colors text-xs text-center cursor-pointer shadow-xs"
                    >
                      Instant UPI / QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePayInvoice(selectedInvoice.invoiceNumber)}
                      disabled={paymentBusy}
                      className="p-3 border border-stone-300 bg-white text-stone-800 rounded-xl font-bold hover:bg-stone-50 transition-colors text-xs text-center cursor-pointer shadow-xs"
                    >
                      NetBanking / Card
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 bg-stone-50 border-t border-stone-200 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="btn btn-outline text-xs px-4 py-2 cursor-pointer"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROGRESS UPDATE MODAL - FULL VIEW */}
      {showAddProgressModal && (
        <div 
          onClick={() => setShowAddProgressModal(false)}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-12"
        >
          <form 
            onSubmit={handleAddProgressUpdate} 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
          >
            <div className="shrink-0 bg-stone-900 text-white p-5 flex justify-between items-center border-b border-stone-800">
              <h3 className="text-base font-bold text-white m-0">Post On-Site Execution Update</h3>
              <button 
                type="button" 
                onClick={() => setShowAddProgressModal(false)} 
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-stone-700 overscroll-contain">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Headline / Work Carried Out *
                </label>
                <input
                  type="text"
                  value={newProgressTitle}
                  onChange={e => setNewProgressTitle(e.target.value)}
                  placeholder="e.g. Master bedroom wardrobe frame anchored and leveled"
                  className="w-full text-xs rounded-lg border border-stone-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Detailed Supervisor Description
                </label>
                <textarea
                  rows={3}
                  value={newProgressDesc}
                  onChange={e => setNewProgressDesc(e.target.value)}
                  placeholder="Explain the alignment check, electrical wiring status, or hardware fitting..."
                  className="w-full text-xs rounded-lg border border-stone-300 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Site Photograph URL / Local Photo
                </label>
                <input
                  type="text"
                  value={newProgressPhoto}
                  onChange={e => setNewProgressPhoto(e.target.value)}
                  placeholder="/photos/wardrobe-1.jpg"
                  className="w-full text-xs rounded-lg border border-stone-300 p-2.5"
                />
              </div>
            </div>

            <div className="shrink-0 bg-stone-50 border-t border-stone-200 p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddProgressModal(false)}
                className="btn btn-outline text-xs px-3.5 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs px-4 py-1.5 cursor-pointer shadow-sm"
              >
                Post Update ✓
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

