import { useState } from 'react'
import { unzipSync } from 'fflate'
import { buildVo2Report, filterLastNWeeks, parseHealthExportXml, type RawVo2Reading } from '../lib/healthExport'
import { todayISO } from '../lib/date'
import { Sheet } from './Sheet'

interface Props {
  onClose: () => void
  onImport: (readings: RawVo2Reading[]) => void
}

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; readings: RawVo2Reading[] }

async function extractXmlText(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith('.zip')) {
    const buf = new Uint8Array(await file.arrayBuffer())
    const files = unzipSync(buf, {
      filter: (entry) => entry.name.toLowerCase().endsWith('export.xml'),
    })
    const key = Object.keys(files)[0]
    if (!key) throw new Error("Couldn't find export.xml inside that zip.")
    return new TextDecoder('utf-8').decode(files[key])
  }
  return file.text()
}

export function ImportHealthSheet({ onClose, onImport }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    setBusy(true)
    setStatus({ kind: 'idle' })
    try {
      const xml = await extractXmlText(file)
      const all = parseHealthExportXml(xml)
      if (all.length === 0) {
        setStatus({ kind: 'error', message: 'No VO2 Max records found in that export.' })
      } else {
        const last8Weeks = filterLastNWeeks(all, 8, todayISO())
        setStatus({ kind: 'ready', readings: last8Weeks.length > 0 ? last8Weeks : all })
      }
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'Could not read that file.' })
    } finally {
      setBusy(false)
    }
  }

  const report = status.kind === 'ready' ? buildVo2Report(status.readings) : null
  const workoutDays = status.kind === 'ready' ? status.readings.filter((r) => r.workoutType !== 'Rest Day').length : 0

  return (
    <Sheet title="Import Apple Health" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
        On your iPhone: Health app → tap your profile picture → <b>Export All Health Data</b>. AirDrop
        or save the resulting <code>export.zip</code> to this device, then choose it below (you can
        pick the .zip directly, or export.xml if you've already unzipped it). This all happens in your
        browser — the file isn't uploaded anywhere.
      </p>

      <div className="field">
        <label>Health export file</label>
        <input
          type="file"
          accept=".zip,.xml,application/zip,text/xml"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </div>

      {busy && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Reading file…</p>}

      {status.kind === 'error' && (
        <p style={{ fontSize: 13.5, color: 'var(--miss)', fontWeight: 600 }}>{status.message}</p>
      )}

      {status.kind === 'ready' && report && (
        <>
          <div className="card" style={{ background: 'var(--page-bg)', boxShadow: 'none', padding: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Found <b style={{ color: 'var(--text-primary)' }}>{status.readings.length}</b> readings over
              the last 8 weeks · <b style={{ color: 'var(--text-primary)' }}>{workoutDays}</b> linked to a
              workout
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Current <b style={{ color: 'var(--accent)' }}>{report.trendSummary.currentValue}</b> mL/kg/min
              {' · '}
              {report.trendSummary.changeFromWeek1 >= 0 ? '+' : ''}
              {report.trendSummary.changeFromWeek1} since week 1 (
              {report.trendSummary.percentageGain >= 0 ? '+' : ''}
              {report.trendSummary.percentageGain}%)
            </div>
          </div>
          <div style={{ height: 12 }} />
          <button
            className="btn-primary"
            onClick={() => {
              onImport(status.readings)
              onClose()
            }}
          >
            Import {status.readings.length} Readings
          </button>
        </>
      )}
    </Sheet>
  )
}
