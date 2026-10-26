'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Plus, Save, Trash2 } from 'lucide-react'
import type { MockContest, MockContestPhase, MockContestProblem, MockContestVisibility } from '@/lib/modeling/mock-contests'

type ContestItem = MockContest & { phase: MockContestPhase }

function blankProblem(index: number): MockContestProblem {
  return { id: crypto.randomUUID(), code: String.fromCharCode(65 + index), title: '', titleZh: '', brief: '', briefZh: '' }
}

function localDateTime(iso: string) {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function initialForm() {
  const start = new Date(Date.now() + 7 * 86400_000)
  start.setMinutes(0, 0, 0)
  const end = new Date(start.getTime() + 72 * 3600_000)
  return {
    title: '', titleZh: '', summary: '', summaryZh: '', visibility: 'draft' as MockContestVisibility,
    startsAt: localDateTime(start.toISOString()), endsAt: localDateTime(end.toISOString()),
    problems: [blankProblem(0), blankProblem(1), blankProblem(2)],
  }
}

export function ModelingMockContestManager({ locale }: { locale: string }) {
  const isChinese = locale.startsWith('zh')
  const t = (en: string, zh: string) => isChinese ? zh : en
  const [items, setItems] = useState<ContestItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    const response = await fetch('/api/modeling/mock-contests', { cache: 'no-store' })
    const value = await response.json().catch(() => ({ items: [] })) as { items?: ContestItem[] }
    setItems(value.items ?? [])
  }, [])
  useEffect(() => { queueMicrotask(() => { void load() }) }, [load])

  function updateProblem(id: string, key: keyof MockContestProblem, value: string) {
    setForm((current) => ({ ...current, problems: current.problems.map((problem) => problem.id === id ? { ...problem, [key]: value } : problem) }))
  }

  function edit(item: ContestItem) {
    setEditingId(item.id)
    setForm({
      title: item.title, titleZh: item.titleZh, summary: item.summary, summaryZh: item.summaryZh,
      visibility: item.visibility, startsAt: localDateTime(item.startsAt), endsAt: localDateTime(item.endsAt),
      problems: item.problems.map((problem) => ({ ...problem })),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save() {
    setBusy(true)
    setMessage('')
    const payload = {
      ...(editingId ? { id: editingId } : {}), ...form,
      startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(),
      problems: form.problems.filter((problem) => problem.title.trim() && problem.titleZh.trim()),
    }
    const response = await fetch('/api/modeling/mock-contests', {
      method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const value = await response.json().catch(() => ({})) as { error?: string }
    setBusy(false)
    if (!response.ok) { setMessage(value.error ?? t('Could not save the contest.', '无法保存模拟赛。')); return }
    setMessage(t('Contest saved.', '模拟赛已保存。'))
    setEditingId(null)
    setForm(initialForm())
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm(t('Delete this contest schedule?', '确定删除这场模拟赛吗？'))) return
    const response = await fetch(`/api/modeling/mock-contests?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) await load()
  }

  const inputClass = 'w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm outline-none focus:border-emerald-500'
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <section className="h-fit rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl dark:border-white/10 dark:bg-white/[0.045]">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">{editingId ? t('Edit schedule', '编辑赛程') : t('New schedule', '新建赛程')}</p><h3 className="mt-1 text-xl font-black">{t('Contest settings', '模拟赛设置')}</h3></div>{editingId && <button onClick={() => { setEditingId(null); setForm(initialForm()) }} className="text-xs font-bold text-muted-foreground underline">{t('Cancel edit', '取消编辑')}</button>}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">English title<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={`${inputClass} mt-1.5`} /></label><label className="text-xs font-bold">中文标题<input value={form.titleZh} onChange={(event) => setForm((current) => ({ ...current, titleZh: event.target.value }))} className={`${inputClass} mt-1.5`} /></label><label className="text-xs font-bold">English summary<textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} className={`${inputClass} mt-1.5 min-h-20`} /></label><label className="text-xs font-bold">中文简介<textarea value={form.summaryZh} onChange={(event) => setForm((current) => ({ ...current, summaryZh: event.target.value }))} className={`${inputClass} mt-1.5 min-h-20`} /></label><label className="text-xs font-bold">{t('Start time', '开题时间')}<input type="datetime-local" value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} className={`${inputClass} mt-1.5`} /></label><label className="text-xs font-bold">{t('Deadline', '截止时间')}<input type="datetime-local" value={form.endsAt} onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))} className={`${inputClass} mt-1.5`} /></label></div>
      <label className="mt-3 block text-xs font-bold">{t('Visibility', '公开状态')}<select value={form.visibility} onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value as MockContestVisibility }))} className={`${inputClass} mt-1.5`}><option value="draft">{t('Draft · developer only', '草稿 · 仅开发者可见')}</option><option value="listed">{t('Listed · visible to everyone', '公开展示 · 所有人可见')}</option></select></label>
      <div className="mt-6 flex items-center justify-between"><div><h4 className="text-sm font-black">{t('Problem directions', '题目方向')}</h4><p className="mt-1 text-xs text-muted-foreground">{t('Text only in this phase; no files are stored.', '当前阶段仅保存文字，不保存文件。')}</p></div><button type="button" onClick={() => setForm((current) => ({ ...current, problems: [...current.problems, blankProblem(current.problems.length)] }))} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-black"><Plus className="h-3.5 w-3.5" />{t('Add', '添加')}</button></div>
      <div className="mt-3 space-y-3">{form.problems.map((problem, index) => <div key={problem.id} className="rounded-xl border border-border bg-muted/25 p-3"><div className="grid gap-2 sm:grid-cols-[64px_1fr_1fr]"><input aria-label="Code" value={problem.code} onChange={(event) => updateProblem(problem.id, 'code', event.target.value)} className={inputClass} /><input placeholder="English problem title" value={problem.title} onChange={(event) => updateProblem(problem.id, 'title', event.target.value)} className={inputClass} /><input placeholder="中文题目名称" value={problem.titleZh} onChange={(event) => updateProblem(problem.id, 'titleZh', event.target.value)} className={inputClass} /></div><div className="mt-2 grid gap-2 sm:grid-cols-2"><textarea placeholder="English direction and decision context" value={problem.brief} onChange={(event) => updateProblem(problem.id, 'brief', event.target.value)} className={`${inputClass} min-h-16`} /><textarea placeholder="中文题目方向与决策背景" value={problem.briefZh} onChange={(event) => updateProblem(problem.id, 'briefZh', event.target.value)} className={`${inputClass} min-h-16`} /></div>{form.problems.length > 1 && <button type="button" onClick={() => setForm((current) => ({ ...current, problems: current.problems.filter((entry) => entry.id !== problem.id).map((entry, nextIndex) => ({ ...entry, code: entry.code || String.fromCharCode(65 + nextIndex) })) }))} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700"><Trash2 className="h-3 w-3" />{t(`Remove option ${index + 1}`, `删除选项 ${index + 1}`)}</button>}</div>)}</div>
      {message && <p className="mt-4 text-xs font-bold text-emerald-700 dark:text-emerald-300">{message}</p>}
      <button type="button" onClick={() => { void save() }} disabled={busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#163f2c] px-5 py-3 text-sm font-black text-white disabled:opacity-50"><Save className="h-4 w-4" />{busy ? t('Saving…', '保存中…') : editingId ? t('Update contest', '更新模拟赛') : t('Create contest', '创建模拟赛')}</button>
    </section>

    <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/[0.045]">
      <div className="border-b border-border px-5 py-4"><h3 className="text-xl font-black">{t('Contest schedule', '模拟赛列表')}</h3><p className="mt-1 text-xs text-muted-foreground">{t('Manage timing, problem choices, and visibility. File uploads remain disabled.', '管理时间、题目选项与公开状态；文件上传保持关闭。')}</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[660px] text-sm"><thead className="bg-muted/40 text-left text-[10px] font-black uppercase tracking-[0.13em] text-muted-foreground"><tr><th className="px-4 py-3">{t('Contest', '比赛')}</th><th className="px-4 py-3">{t('Window', '时间')}</th><th className="px-4 py-3">{t('Status', '状态')}</th><th className="px-4 py-3">{t('Problems', '题目')}</th><th className="px-4 py-3 text-right">{t('Actions', '操作')}</th></tr></thead><tbody className="divide-y divide-border">{items.map((item) => <tr key={item.id} className="hover:bg-muted/25"><td className="px-4 py-3 font-bold">{isChinese ? item.titleZh : item.title}</td><td className="px-4 py-3 text-xs text-muted-foreground"><div>{new Date(item.startsAt).toLocaleString()}</div><div>→ {new Date(item.endsAt).toLocaleString()}</div></td><td className="px-4 py-3"><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase">{item.visibility} · {item.phase}</span></td><td className="px-4 py-3 font-mono text-xs">{item.problems.length}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Link href={`/${locale}/mock-contests/${item.id}`} className="grid h-8 w-8 place-items-center rounded-full border border-border" title={t('Preview', '预览')}><ExternalLink className="h-3.5 w-3.5" /></Link><button onClick={() => edit(item)} className="rounded-full border border-border px-3 py-1 text-xs font-black">{t('Edit', '编辑')}</button><button onClick={() => { void remove(item.id) }} className="grid h-8 w-8 place-items-center rounded-full border border-rose-200 text-rose-700" title={t('Delete', '删除')}><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div>
      {items.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">{t('No contests yet. Create the first schedule with the form.', '还没有模拟赛，请使用左侧表单创建第一场。')}</div>}
    </section>
  </div>
}
