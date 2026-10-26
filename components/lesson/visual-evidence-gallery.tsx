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
  { src: 'ppt/ppt-01-slide-3.webp', en: '2020 MCM Problem A, Team 2001334: the full modeling workflow turns raw environmental data into a sequence of testable decisions.', zh: '2020 MCM A 题 Team 2001334：完整流程把原始环境数据逐步转化为可检验的决策。' },
  { src: 'ppt/ppt-02-slide-4.webp', en: 'Team 2001334: data cleaning is shown as a reproducible pipeline instead of being hidden in one sentence.', zh: 'Team 2001334：把数据清洗画成可复现的流程，而不是藏在一句“预处理完成”里。' },
  { src: 'ppt/ppt-03-slide-5.webp', en: 'Team 2001334: a shared coordinate system makes every later spatial variable and distance calculation auditable.', zh: 'Team 2001334：统一坐标系让后续空间变量与距离计算都可以回查。' },
  { src: 'ppt/ppt-04-slide-7.webp', en: 'Team 2001334: an ensemble of sea-temperature trajectories reveals agreement, uncertainty, and outliers in one view.', zh: 'Team 2001334：海温轨迹集合在一张图里同时呈现共识、不确定性与离群情形。' },
  { src: 'ppt/ppt-05-slide-8.webp', en: 'Team 2001334: rolling validation for an ARIMA model displays how forecast skill changes across time rather than reporting one score.', zh: 'Team 2001334：ARIMA 滚动验证展示预测能力如何随时间变化，而不是只报告一个分数。' },
  { src: 'ppt/ppt-06-slide-9.webp', en: 'Team 2001334: a globe-scale view establishes geographic context before the paper zooms into local migration cells.', zh: 'Team 2001334：先用全球视图建立地理语境，再进入局部迁移网格。' },
  { src: 'ppt/ppt-07-slide-30.webp', en: 'Team 2001334: the migration grid converts a continuous ocean into discrete states that match the model equations.', zh: 'Team 2001334：迁移网格把连续海域转成与模型方程一致的离散状态。' },
  { src: 'ppt/ppt-08-slide-32.webp', en: 'Team 2001334: a probability surface makes the spatial prediction visible together with its concentration and spread.', zh: 'Team 2001334：概率曲面让空间预测的位置、集中程度与扩散范围同时可见。' },
  { src: 'ppt/ppt-09-slide-35.webp', en: 'Team 2001334: observed and predicted locations share one map, so spatial error can be judged directly.', zh: 'Team 2001334：观测位置与预测位置共用一张地图，使空间误差能够被直接判断。' },
  { src: 'ppt/ppt-10-slide-37.webp', en: 'Team 2001334: the profit trajectory is plotted against time to make the decision consequence, not merely the model output, visible.', zh: 'Team 2001334：收益轨迹沿时间展开，突出决策后果，而不只是展示模型输出。' },
]

const scientificFigures: TeachingFigure[] = [
  { src: 'ppt/ppt-11-slide-13.webp', en: 'Team 2001334: a survival-style distribution of bankruptcy time exposes tail risk that a mean profit cannot show.', zh: 'Team 2001334：破产时间分布揭示平均收益无法表达的尾部风险。' },
  { src: 'ppt/ppt-12-slide-14.webp', en: 'Team 2001334: movement routes are layered on geographic context so that mechanism and location can be read together.', zh: 'Team 2001334：迁移路径叠加地理背景，使机制与位置能够一起阅读。' },
  { src: 'ppt/ppt-13-slide-21.webp', en: 'Team 2001334: the uncertainty band separates the central forecast from the range of plausible outcomes.', zh: 'Team 2001334：不确定性带把中心预测与可能结果范围清楚地区分开。' },
  { src: 'ppt/ppt-14-slide-40.webp', en: 'Team 2001334: a territorial grid links the discretized state space to the physical region it represents.', zh: 'Team 2001334：区域网格把离散状态空间与其代表的真实区域联系起来。' },
  { src: 'ppt/ppt-15-slide-41.webp', en: 'Team 2001334: a trend panel and a distribution panel answer “when” and “how variable” without forcing them into one chart.', zh: 'Team 2001334：趋势图与分布图分别回答“何时变化”和“波动多大”，避免强行塞进一张图。' },
  { src: 'ppt/ppt-16-slide-46.webp', en: 'Team 2001334: the timing distribution presents uncertainty as a shape rather than as an unexplained error bar.', zh: 'Team 2001334：时间分布用完整形状表达不确定性，而不是只给一个缺少解释的误差棒。' },
  { src: 'ppt/ppt-17-slide-48.webp', en: 'Team 2001334: sensitivity results rank influential inputs and make robustness a visible part of the conclusion.', zh: 'Team 2001334：敏感性结果对关键输入排序，让稳健性成为结论中可见的一部分。' },
  { src: 'ppt/ppt-18-slide-51.webp', en: 'Team 2001334: a Q–Q diagnostic turns a distributional assumption into something the reader can inspect.', zh: 'Team 2001334：Q–Q 诊断把分布假设变成读者可以直接检查的证据。' },
  { src: 'ppt/ppt-19-slide-56.webp', en: 'Team 2001334: spatial bootstrap results display both location and sampling uncertainty instead of hiding either one.', zh: 'Team 2001334：空间 Bootstrap 同时表达位置与抽样不确定性，没有把其中一项藏起来。' },
  { src: 'ppt/ppt-20-slide-60.webp', en: '2023 MCM Problem B, Team 2316192: the Masai Mara map orients every later human–land variable in a concrete place.', zh: '2023 MCM B 题 Team 2316192：马赛马拉地图先建立具体空间背景，再引出后续人地变量。' },
]

const awardIds: Record<Exclude<GalleryGroup, 'claim'>, string[]> = {
  comparison: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'],
  time: ['011', '012', '013', '014', '015', '016', '017', '018', '019', '020'],
  distribution: ['021', '022', '023', '024', '025', '026', '027', '028', '029', '030'],
  diagnostics: ['031', '032', '033', '034', '035', '036', '037', '038', '039', '040'],
  maps: ['041', '042', '043', '044', '045', '046', '047', '048', '049', '050'],
  networks: ['051', '052', '053', '054', '055', '056', '057', '058', '059', '060'],
  architecture: ['061', '062', '063', '064', '065', '066', '067', '068', '069', '070'],
  scientific: [],
  'award-pages': ['071', '072', '073', '074', '075', '076', '077', '078', '079', '080'],
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
  if (value <= 49) {
    return language === 'zh'
      ? '2023 MCM B 题（马赛马拉生态系统），Team 2316192，Finalist 论文'
      : '2023 MCM Problem B (Masai Mara Ecosystem), Team 2316192, Finalist paper'
  }
  if (value <= 61) {
    return language === 'zh'
      ? '2023 MCM C 题（Wordle），Team 2309397，Outstanding Winner 论文'
      : '2023 MCM Problem C (Wordle), Team 2309397, Outstanding Winner paper'
  }
  if (value <= 75) {
    return language === 'zh'
      ? '2022 MCM A 题（自行车轮廓），Team 2209812，Outstanding Winner 论文'
      : '2022 MCM Problem A (Bicycle Profiles), Team 2209812, Outstanding Winner paper'
  }
  return language === 'zh'
    ? '2023 MCM B 题（马赛马拉生态系统），Team 2316192，Finalist 论文'
    : '2023 MCM Problem B (Masai Mara Ecosystem), Team 2316192, Finalist paper'
}

const groupLessons: Record<Exclude<GalleryGroup, 'claim' | 'scientific'>, { en: string; zh: string }> = {
  comparison: {
    en: 'The comparison is persuasive because alternatives share a common scale and the visually strongest contrast answers one decision question.',
    zh: '这张比较图有效，是因为各方案共享可比尺度，最强的视觉差异也正好回答一个决策问题。',
  },
  time: {
    en: 'Time is encoded consistently from left to right, while color and annotation are reserved for structural changes rather than decoration.',
    zh: '时间始终从左到右编码，颜色与标注只用于突出结构变化，而不是装饰。',
  },
  distribution: {
    en: 'The figure preserves spread and tail behavior, so a risky option cannot hide behind an attractive average.',
    zh: '图中保留离散程度与尾部形态，因此高风险方案无法躲在一个漂亮的平均值后面。',
  },
  diagnostics: {
    en: 'Observed behavior is placed beside the model implication, turning validation into visible evidence instead of a verbal assurance.',
    zh: '观测行为与模型含义被并置，使验证成为可见证据，而不是一句口头保证。',
  },
  maps: {
    en: 'Geographic context, legend, and model output remain distinguishable, allowing the reader to connect location with magnitude without guessing.',
    zh: '地理背景、图例与模型输出层次分明，读者无需猜测就能把位置与数值联系起来。',
  },
  networks: {
    en: 'Nodes and links encode model meaning rather than ornament; grouping and direction reveal how influence or flow travels through the system.',
    zh: '节点与连线承载模型含义而非装饰，分组和方向清楚地展示影响或流量如何穿过系统。',
  },
  architecture: {
    en: 'The diagram controls reading order with hierarchy, alignment, and restrained color, so a complex model can be reconstructed module by module.',
    zh: '图形用层级、对齐与克制配色控制阅读顺序，使复杂模型能够按模块被重新理解。',
  },
  'award-pages': {
    en: 'The page works as a complete argument: the figure, caption, surrounding prose, and numerical evidence reinforce the same claim.',
    zh: '这一页构成完整论证：图片、图注、正文与数值证据共同支持同一个结论。',
  },
}

const inspectionCues = [
  { en: 'Notice the explicit labels and units.', zh: '注意明确的标签与单位。' },
  { en: 'Notice how the eye reaches the main result before the supporting detail.', zh: '注意视线如何先到达主要结论，再进入支撑细节。' },
  { en: 'Notice that repeated encodings keep the comparison learnable.', zh: '注意重复使用一致编码，使比较更容易学习。' },
  { en: 'Notice how white space separates evidence instead of wasting space.', zh: '注意留白如何分隔证据，而不是浪费版面。' },
  { en: 'Notice that the palette has a semantic job.', zh: '注意颜色承担了明确的语义任务。' },
  { en: 'Notice that the caption states what should be read, not merely what was drawn.', zh: '注意图注说明了应该读出什么，而不只是画了什么。' },
  { en: 'Notice the balance between global pattern and local detail.', zh: '注意整体模式与局部细节之间的平衡。' },
  { en: 'Notice that visual emphasis follows decision importance.', zh: '注意视觉强调与决策重要性保持一致。' },
  { en: 'Notice how uncertainty remains visible beside the central result.', zh: '注意不确定性如何与中心结果同时保留。' },
  { en: 'Notice that every decorative element has been subordinated to evidence.', zh: '注意所有装饰元素都服从于证据表达。' },
]

function FigureCard({
  src,
  caption,
  label,
  language,
  analysis,
}: {
  src: string
  caption: string
  label: string
  language: 'en' | 'zh'
  analysis: string
}) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-950/70">
      {/* The source images have mixed aspect ratios; preserving their intrinsic ratio is essential. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} loading="lazy" className="mx-auto block h-auto max-h-[720px] w-auto max-w-full object-contain" />
      <figcaption className="border-t border-slate-200/80 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:text-slate-300">
        <span className="mb-1 block text-xs font-black uppercase tracking-[0.16em] text-blue-700 dark:text-sky-300">{label}</span>
        <span className="block">{caption}</span>
        <span className="mt-2 block rounded-xl bg-blue-50 px-3 py-2 text-xs leading-6 text-slate-700 dark:bg-sky-400/10 dark:text-slate-200">
          <strong>{language === 'zh' ? '为什么有效：' : 'Why it works: '}</strong>{analysis}
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
          : group === 'scientific'
            ? scientificFigures.map((figure) => ({
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
                analysis={group === 'claim' || group === 'scientific'
                  ? `${language === 'zh' ? '这张图从课件所引用的美赛论文中回溯到原始论文，并重新截取有效内容区域。' : 'This figure was traced from the course deck to its MCM paper and recropped around the evidence-bearing region.'} ${inspectionCues[index % inspectionCues.length][language]}`
                  : `${groupLessons[group][language]} ${inspectionCues[index % inspectionCues.length][language]}`}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
