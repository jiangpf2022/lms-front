type GalleryGroup =
  | 'claim'
  | 'comparison'
  | 'time'
  | 'distribution'
  | 'diagnostics'
  | 'maps'
  | 'networks'
  | 'architecture'
  | 'scientific'
  | 'award-pages'

type VisualEvidenceGalleryProps = {
  groups: string
  language?: 'en' | 'zh'
  start?: number
}

type TeachingFigure = {
  src: string
  en: string
  zh: string
}

const teachingFigures: TeachingFigure[] = [
  { src: '001-baseline-before-decoration.svg', en: 'Baseline before decoration: the proposal changes the full distribution, not merely one average.', zh: '先画基线，再谈装饰：新方案改变的是完整分布，而不只是一个平均值。' },
  { src: '002-one-chart-one-question.svg', en: 'One chart, one question: which district has the largest shortage under stress?', zh: '一张图只回答一个核心问题：压力情景下，哪个地区的短缺最严重？' },
  { src: '003-evidence-chain.svg', en: 'Evidence chain: demand estimation feeds simulation, then the staffing decision.', zh: '证据链：需求估计进入仿真，再由仿真支持人员配置决策。' },
  { src: '004-decision-before-method.svg', en: 'Decision before method: a slightly dearer plan stays feasible in every tested disruption.', zh: '先呈现决策，再介绍方法：略贵的方案在所有测试扰动下仍然可行。' },
  { src: '005-caption-as-a-result.svg', en: 'Write the caption as a result: the intervention reduces the held-out evening peak by 18%.', zh: '让图注直接陈述结果：干预使留出周的晚高峰下降了 18%。' },
  { src: '006-a-fair-before-and-after.svg', en: 'A fair before-and-after comparison shows that the policy shifts demand rather than removing it.', zh: '公平的前后对照表明：政策只是转移了需求，并没有让需求消失。' },
  { src: '007-show-the-counterfactual.svg', en: 'Show the counterfactual: without intervention, congestion keeps rising after 17:00.', zh: '画出反事实：如果不采取干预，17:00 后拥堵仍会继续上升。' },
  { src: '008-make-the-constraint-visible.svg', en: 'Make the constraint visible: only three designs satisfy budget and reliability together.', zh: '把约束画出来：只有三个候选设计同时满足预算与可靠性要求。' },
  { src: '009-scale-to-the-decision.svg', en: 'Scale the chart to the decision: errors near the safety threshold matter most.', zh: '尺度应服务于决策：靠近安全阈值的小误差，可能比其他位置的大误差更重要。' },
  { src: '010-close-the-loop.svg', en: 'Close the loop: validation changes the recommendation after an assumption fails.', zh: '闭合证据链：当一项假设失效时，验证结果应当能够改变最终建议。' },
]

const awardIds: Record<Exclude<GalleryGroup, 'claim'>, string[]> = {
  comparison: ['001', '002', '052', '077', '003', '006', '007', '008', '009', '029'],
  time: ['045', '054', '065', '066', '067', '068', '069', '070', '071', '081'],
  distribution: ['046', '047', '087', '088', '089', '090', '022', '023', '024', '043'],
  diagnostics: ['012', '013', '020', '021', '049', '050', '076', '083', '084', '085'],
  maps: ['010', '025', '026', '027', '028', '031', '032', '033', '034', '035'],
  networks: ['004', '005', '014', '015', '016', '017', '018', '019', '037', '038'],
  architecture: ['011', '030', '044', '048', '051', '062', '078', '079', '080', '082'],
  scientific: ['053', '055', '056', '057', '058', '039', '040', '041', '042', '036'],
  'award-pages': ['059', '060', '061', '063', '064', '074', '075', '091', '086', '094'],
}

const groupLabels: Record<GalleryGroup, { en: string; zh: string }> = {
  claim: { en: 'Claim-first teaching diagrams', zh: '命题优先的教学示意图' },
  comparison: { en: 'Comparison', zh: '比较图案例' },
  time: { en: 'Time and forecasts', zh: '时间序列与预测案例' },
  distribution: { en: 'Distribution and risk', zh: '分布与风险案例' },
  diagnostics: { en: 'Diagnostics and validation', zh: '诊断与验证案例' },
  maps: { en: 'Maps and geometry', zh: '地图与几何案例' },
  networks: { en: 'Networks and flows', zh: '网络与流量案例' },
  architecture: { en: 'Model architecture', zh: '模型结构案例' },
  scientific: { en: 'Scientific figures', zh: '科学图形案例' },
  'award-pages': { en: 'Award-level pages', zh: '获奖论文页面案例' },
}

function awardSource(id: string, language: 'en' | 'zh') {
  const value = Number(id)
  if (value <= 29) {
    return language === 'zh'
      ? '2020 MCM D 题（团队组建），Team 2006782，Outstanding Winner 论文'
      : '2020 MCM Problem D (Teaming), Team 2006782, Outstanding Winner paper'
  }
  if (value <= 43) {
    return language === 'zh'
      ? '2016 全国大学生数学建模竞赛 B 题（小区开放道路通行影响），全国一等奖论文'
      : '2016 CUMCM Problem B (Traffic Impact of Opening Gated Communities), National First Prize paper'
  }
  if (value <= 52) {
    return language === 'zh'
      ? '2016 全国大学生数学建模竞赛 D 题（风电场运行状况分析及优化），全国一等奖论文'
      : '2016 CUMCM Problem D (Wind-Farm Operation Analysis and Optimization), National First Prize paper'
  }
  if (value <= 61) {
    return language === 'zh'
      ? '2015 全国大学生数学建模竞赛 A 题（太阳影子定位），全国一等奖论文 A4'
      : '2015 CUMCM Problem A (Solar-Shadow Positioning), National First Prize paper A4'
  }
  if (value <= 71) {
    return language === 'zh'
      ? '2023 MCM A 题（耐旱植物群落），Team 2321860 获奖论文'
      : '2023 MCM Problem A (Drought-Tolerant Plant Communities), Team 2321860 award paper'
  }
  if (value <= 78) {
    return language === 'zh'
      ? '2023 ICM F 题（绿色 GDP），Team 2315018 获奖论文'
      : '2023 ICM Problem F (Green GDP), Team 2315018 award paper'
  }
  return language === 'zh'
    ? '2023 MCM C 题（Wordle），Team 2309397 获奖论文'
    : '2023 MCM Problem C (Wordle), Team 2309397 award paper'
}

function FigureCard({
  src,
  caption,
  label,
  language,
}: {
  src: string
  caption: string
  label: string
  language: 'en' | 'zh'
}) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-950/70">
      {/* The source images have mixed aspect ratios; preserving their intrinsic ratio is essential. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} loading="lazy" className="mx-auto block h-auto max-h-[720px] w-auto max-w-full object-contain" />
      <figcaption className="border-t border-slate-200/80 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:text-slate-300">
        <span className="mb-1 block text-xs font-black uppercase tracking-[0.16em] text-blue-700 dark:text-sky-300">{label}</span>
        <span>{caption}</span>
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {language === 'zh' ? '阅读时先找结论、视觉编码与证据之间的对应关系。' : 'Read the figure by tracing its claim, visual encoding, and evidence.'}
        </span>
      </figcaption>
    </figure>
  )
}

export function VisualEvidenceGallery({ groups, language = 'en', start = 1 }: VisualEvidenceGalleryProps) {
  const selected = groups
    .split(',')
    .map((group) => group.trim())
    .filter((group): group is GalleryGroup => group in groupLabels)

  return (
    <div className="my-8 space-y-12">
      {selected.map((group, groupIndex) => {
        const figures = group === 'claim'
          ? teachingFigures.map((figure) => ({
              src: `/mathematical-modeling/visual-evidence/${figure.src}`,
              caption: figure[language],
            }))
          : awardIds[group].map((id) => ({
              src: `/mathematical-modeling/visual-evidence/award/award-${id}.webp`,
              caption: awardSource(id, language),
            }))
        const groupStart = start + selected
          .slice(0, groupIndex)
          .reduce((total, previousGroup) => total + (previousGroup === 'claim' ? teachingFigures.length : awardIds[previousGroup].length), 0)

        return (
          <section key={group} aria-label={groupLabels[group][language]}>
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white dark:bg-sky-400 dark:text-slate-950">
                {language === 'zh' ? '配套图例' : 'Figure set'}
              </span>
              <strong className="text-base text-slate-900 dark:text-white">{groupLabels[group][language]}</strong>
            </div>
            {figures.map((figure, index) => (
              <FigureCard
                key={figure.src}
                src={figure.src}
                caption={figure.caption}
                label={language === 'zh' ? `图 ${groupStart + index}` : `Figure ${groupStart + index}`}
                language={language}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
