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
  { src: 'ppt/ppt-01-slide-3.webp', en: '2020 MCM Problem A: pair a profit trend with a bankruptcy-time distribution so that expected performance and tail risk are read together.', zh: '2020 MCM A 题：把收益趋势与破产时间分布并列，让读者同时看到期望表现与尾部风险。' },
  { src: 'ppt/ppt-02-slide-4.webp', en: '2020 MCM Problem D: several performance indicators share one time axis, making trade-offs and regime changes directly comparable.', zh: '2020 MCM D 题：多个性能指标共享同一时间轴，便于直接比较权衡关系与阶段变化。' },
  { src: 'ppt/ppt-03-slide-5.webp', en: 'Competition-paper composite: three-dimensional summaries and site maps connect numerical patterns to their spatial setting.', zh: '竞赛论文组合图：三维统计与场地图并列，把数值模式重新放回空间情境。' },
  { src: 'ppt/ppt-04-slide-7.webp', en: '2020 MCM Problem A workflow: the figure separates three models, then shows how their outputs support one final decision.', zh: '2020 MCM A 题流程图：先区分三个模型，再说明各模型输出如何共同支持最终决策。' },
  { src: 'ppt/ppt-05-slide-8.webp', en: 'UAV geometry: every coordinate, angle, and displacement used in the equations is made visible in one consistent frame.', zh: '无人机几何示意图：把方程中的坐标、角度和位移放进同一个一致的参考系。' },
  { src: 'ppt/ppt-06-slide-9.webp', en: 'Competition workflow: data, classification, clustering, optimization, and sensitivity analysis are arranged as an evidence chain.', zh: '竞赛建模流程：数据、分类、聚类、优化与敏感性分析被组织成完整证据链。' },
  { src: 'ppt/ppt-07-slide-30.webp', en: 'A policy framework uses arrows only where information or decisions actually move between modules.', zh: '政策框架图只在信息或决策真正流动的位置使用箭头，避免装饰性连线。' },
  { src: 'ppt/ppt-08-slide-32.webp', en: 'A self-supervised vision pipeline distinguishes pretraining, clustering, and iterative refinement by both position and color.', zh: '自监督视觉流程同时利用位置与颜色区分预训练、聚类和迭代更新。' },
  { src: 'ppt/ppt-09-slide-35.webp', en: '2020 MCM Problem D: a soccer formation makes the graph structure interpretable before any network metric is reported.', zh: '2020 MCM D 题：先用足球阵型解释网络结构，再报告网络指标，读者更容易理解节点与边。' },
  { src: 'ppt/ppt-10-slide-37.webp', en: '2023 MCM Problem A: the human–land system is decomposed into coupled subsystems before a strategy-evaluation model is introduced.', zh: '2023 MCM A 题：先把人地系统拆成相互耦合的子系统，再引入策略评价模型。' },
]

const scientificFigures: TeachingFigure[] = [
  { src: 'ppt/ppt-11-slide-13.webp', en: 'A terrain surface uses height, shading, and a restrained color scale to communicate one geometric quantity.', zh: '地形曲面同时使用高度、阴影和克制的色标表达同一个几何量。' },
  { src: 'ppt/ppt-12-slide-14.webp', en: 'A violin plot keeps distribution shape, median, and spread visible instead of collapsing every group to one bar.', zh: '小提琴图保留分布形状、中位数与离散程度，不把每组数据压缩成一根柱子。' },
  { src: 'ppt/ppt-13-slide-21.webp', en: 'A tensor-oriented diagram combines small time-series panels with explicit data-organization axes.', zh: '张量示意图把时间序列小图与明确的数据组织轴结合起来。' },
  { src: 'ppt/ppt-14-slide-40.webp', en: 'A neural-network schematic labels the role of each layer while keeping the computational direction unambiguous.', zh: '神经网络示意图标注每层作用，同时保持计算方向清晰。' },
  { src: 'ppt/ppt-15-slide-41.webp', en: 'A hybrid sequence architecture separates recurrent, convolutional, fully connected, and output modules by structure.', zh: '混合序列模型按结构区分循环、卷积、全连接与输出模块。' },
  { src: 'ppt/ppt-16-slide-46.webp', en: 'Training curves compare both loss trajectories and parameter-space paths, connecting convergence evidence with mechanism.', zh: '训练曲线同时比较损失轨迹与参数空间路径，把收敛证据和算法机制联系起来。' },
  { src: 'ppt/ppt-17-slide-48.webp', en: 'A multi-scale network diagram shows how information travels across resolution levels rather than listing layer names.', zh: '多尺度网络图强调信息如何跨分辨率流动，而不是只罗列层名称。' },
  { src: 'ppt/ppt-18-slide-51.webp', en: 'A dense convolutional architecture remains readable because repeated blocks, dimensions, and skip paths use consistent encoding.', zh: '复杂卷积结构依靠一致的模块、尺寸与跳连编码保持可读性。' },
  { src: 'ppt/ppt-19-slide-56.webp', en: 'A biochemical pathway uses spatial grouping and color families to separate reaction stages without breaking continuity.', zh: '生化通路用空间分组与颜色家族区分反应阶段，同时保持过程连续。' },
  { src: 'ppt/ppt-20-slide-60.webp', en: 'A protein-mechanism plate combines molecular structure with localized callouts so the reader can move from object to mechanism.', zh: '蛋白机制图把分子结构与局部标注结合，使读者能够从对象自然过渡到机制。' },
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
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
