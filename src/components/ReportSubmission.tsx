import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DEPARTMENTS } from '@/lib/constants';
import type { Department } from '@/lib/types';
import {
  getCurrentPosition,
  reverseGeocode,
  staticMapUrl,
  mapLink,
  generateTicketId,
} from '@/lib/geo';
import CameraCapture from './CameraCapture';
import {
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  X,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface Props {
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function ReportSubmission({ onSubmitted, onCancel }: Props) {
  const { citizenId } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [department, setDepartment] = useState<Department | null>('Electricity');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const captureStepDone = !!photoDataUrl;
  const locationStepDone = !!coords && !!address;

  function handleCapture(dataUrl: string, file: File) {
    setPhotoDataUrl(dataUrl);
    setPhotoFile(file);
    setStep(2);
    fetchLocation();
  }

  const fetchLocation = useCallback(async () => {
    setLocating(true);
    setLocError(null);
    try {
      const pos = await getCurrentPosition();
      setCoords({ lat: pos.latitude, lon: pos.longitude });
      const addr = await reverseGeocode(pos.latitude, pos.longitude);
      setAddress(addr);
    } catch (e) {
      setLocError(e instanceof Error ? e.message : 'Could not get location.');
    } finally {
      setLocating(false);
    }
  }, []);

  async function refreshLocation() {
    setCoords(null);
    setAddress('');
    await fetchLocation();
  }

  function retakePhoto() {
    setPhotoDataUrl(null);
    setPhotoFile(null);
    setStep(1);
  }

  async function submitReport() {
    if (!photoFile || !coords || !address || !department || !citizenId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const ext = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${citizenId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('report-photos')
        .upload(path, photoFile, { contentType: photoFile.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage
        .from('report-photos')
        .getPublicUrl(path);
      const photoUrl = pub.publicUrl;

      const { error: insErr } = await supabase.from('reports').insert({
        citizen_id: citizenId,
        photo_url: photoUrl,
        latitude: coords.lat,
        longitude: coords.lon,
        address,
        department,
        status: 'Pending',
      });
      if (insErr) throw insErr;

      setTicketId(generateTicketId());
      setStep(4);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : 'Failed to submit report.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Success screen ---------- */
  if (step === 4 && ticketId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-60" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Report Submitted!</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Your report has been received by the {department} department.
        </p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Ticket ID
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
            {ticketId}
          </p>
        </div>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={onSubmitted}
            className="w-full rounded-2xl bg-slate-900 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-slate-800"
          >
            View My Reports
          </button>
          <button
            onClick={() => {
              setStep(1);
              setPhotoDataUrl(null);
              setPhotoFile(null);
              setCoords(null);
              setAddress('');
              setLocError(null);
              setSubmitError(null);
              setTicketId(null);
              setDepartment('Electricity');
            }}
            className="w-full rounded-2xl border border-slate-300 bg-white py-4 text-base font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Stepper ---------- */
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-slate-900">
            New Report
          </h1>
          <div className="w-9" />
        </div>
        {/* Progress */}
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-3">
          {[
            { n: 1, label: 'Photo', done: captureStepDone },
            { n: 2, label: 'Location', done: locationStepDone },
            { n: 3, label: 'Department', done: !!department },
          ].map((s) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  step >= s.n
                    ? s.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {s.done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  s.n
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  step >= s.n ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {s.n < 3 && <div className="h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-5">
        {/* STEP 1: Camera */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Take a photo of the issue
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A clear photo helps the department understand the problem
              quickly.
            </p>

            <CameraCapture onCapture={handleCapture} />

            <div className="mt-6 rounded-2xl bg-sky-50 p-4">
              <p className="flex items-start gap-2 text-sm text-sky-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Your location will be captured automatically right after the
                photo is taken.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Confirm your location
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              We detected where you are. Review the pin and refresh if needed.
            </p>

            {/* Photo preview thumbnail */}
            {photoDataUrl && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <img
                  src={photoDataUrl}
                  alt="Report"
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    Photo captured
                  </p>
                  <button
                    onClick={retakePhoto}
                    className="text-xs font-medium text-amber-600 hover:underline"
                  >
                    Retake photo
                  </button>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}

            {/* Map preview */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {coords ? (
                <a
                  href={mapLink(coords.lat, coords.lon)}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <img
                    src={staticMapUrl(coords.lat, coords.lon)}
                    alt="Location map"
                    className="h-48 w-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex h-48 items-center justify-center bg-slate-100">
                  {locating ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">Getting location…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <MapPin className="h-6 w-6" />
                      <span className="text-sm">No location yet</span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                      <MapPin className="h-3.5 w-3.5" /> Detected address
                    </p>
                    {locating ? (
                      <p className="mt-1 text-sm text-slate-400">
                        Locating…
                      </p>
                    ) : address ? (
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {address}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">
                        No address available
                      </p>
                    )}
                    {coords && (
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={refreshLocation}
                    disabled={locating}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                </div>
                {locError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{locError}</span>
                  </div>
                )}
              </div>
            </div>

            {locationStepDone && (
              <button
                onClick={() => setStep(3)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-slate-800"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* STEP 3: Department */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Which department should handle this?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tap the relevant department. Electricity is selected by default.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {DEPARTMENTS.map((d) => {
                const Icon = d.icon;
                const selected = department === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setDepartment(d.key)}
                    className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition active:scale-[0.98] ${
                      selected
                        ? `${d.bgColor} ${d.borderColor} ring-2 ${d.ringColor}`
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${d.bgColor} ${d.textColor}`}
                    >
                      <Icon className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {d.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {submitError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action bar for step 3 */}
      {step === 3 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={submitReport}
              disabled={!department || submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-emerald-400 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
