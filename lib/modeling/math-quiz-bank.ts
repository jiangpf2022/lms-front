export type ModelingQuizQuestion = {
  id: string
  prompt: { en: string; zh: string }
  options: { en: string[]; zh: string[] }
  correct: number[]
  explanation: { en: string; zh: string }
}

type TextPair = { en: string; zh: string }

function question(
  id: string,
  prompt: TextPair,
  options: { en: string[]; zh: string[] },
  correct: number | number[],
  explanation: TextPair
): ModelingQuizQuestion {
  return { id, prompt, options, correct: Array.isArray(correct) ? correct : [correct], explanation }
}

function fmt(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '')
}

function generalQuestions(seed: number, id: string): ModelingQuizQuestion[] {
  const initial = 28 + seed
  const inflow = 11 + seed
  const outflow = 16 + seed
  const loss = 3
  const balance = initial + inflow - outflow - loss
  return [
    question(`${id}-1`, {
      en: `A stock starts at ${initial}, receives ${inflow}, releases ${outflow}, and loses ${loss}. What is the next state?`,
      zh: `某库存初值为 ${initial}，流入 ${inflow}，流出 ${outflow}，另有损耗 ${loss}。下一时刻状态是多少？`,
    }, { en: [fmt(balance - 4), fmt(balance), fmt(balance + 3), fmt(initial + inflow)], zh: [fmt(balance - 4), fmt(balance), fmt(balance + 3), fmt(initial + inflow)] }, 1, {
      en: `Use the signed balance: ${initial}+${inflow}-${outflow}-${loss}=${balance}.`,
      zh: `按带符号的守恒式计算：${initial}+${inflow}-${outflow}-${loss}=${balance}。`,
    }),
    question(`${id}-2`, {
      en: 'Which expression is dimensionally valid when x is distance, t is time, and v is distance per time?',
      zh: '若 x 是距离、t 是时间、v 是速度，哪个表达式量纲正确？',
    }, { en: ['x+t', 'x-vt', 'exp(-t)', 'v+x'], zh: ['x+t', 'x-vt', 'exp(-t)', 'v+x'] }, 1, {
      en: 'Both x and vt have units of distance, so they may be subtracted.',
      zh: 'x 与 vt 都具有距离量纲，因此可以相减。',
    }),
    question(`${id}-3`, {
      en: 'A prediction changes from 40 to 46 when a parameter changes from 10 to 12. What is the finite-difference sensitivity Δy/Δp?',
      zh: '参数从 10 变为 12 时，预测从 40 变为 46。有限差分敏感度 Δy/Δp 是多少？',
    }, { en: ['1.5', '2', '3', '6'], zh: ['1.5', '2', '3', '6'] }, 2, {
      en: '(46−40)/(12−10)=3.', zh: '(46−40)/(12−10)=3。',
    }),
    question(`${id}-4`, {
      en: 'Residuals on three held-out cases are 1, −2, and 2. What is RMSE?',
      zh: '三个留出样本的残差为 1、−2、2。RMSE 是多少？',
    }, { en: ['√2', '√3', '5/3', '3'], zh: ['√2', '√3', '5/3', '3'] }, 1, {
      en: 'RMSE=√((1²+(-2)²+2²)/3)=√3.', zh: 'RMSE=√((1²+(-2)²+2²)/3)=√3。',
    }),
    question(`${id}-5`, {
      en: 'Which result is strongest evidence that a model generalizes?',
      zh: '哪一项最能证明模型具有泛化能力？',
    }, { en: ['Low training error only', 'A visually smooth fitted curve', 'Stable performance on held-out and stressed cases', 'Many parameters'], zh: ['仅训练误差很低', '拟合曲线很光滑', '在留出样本和压力情景中表现稳定', '参数很多'] }, 2, {
      en: 'Generalization is tested outside the data and conditions used to fit the model.',
      zh: '泛化能力必须在拟合过程未使用的数据与条件上检验。',
    }),
  ]
}

function foundations(seed: number, id: string): ModelingQuizQuestion[] {
  const cycle = 15 + seed
  const seats = 20 + seed
  const capacity = (60 / cycle) * seats
  const service = 280 + 10 * seed
  const trail = (480 + 20 * seed) / 2
  return [
    question(`${id}-1`, { en: `A shuttle carries ${seats} people per ${cycle}-minute cycle. Ignoring losses, what is its hourly capacity?`, zh: `接驳车每 ${cycle} 分钟一班，每班载 ${seats} 人。忽略损耗，每小时运力是多少？` }, { en: [fmt(seats), fmt(capacity), fmt(capacity + seats), fmt(60 * seats)], zh: [fmt(seats), fmt(capacity), fmt(capacity + seats), fmt(60 * seats)] }, 1, { en: `Capacity=(60/${cycle})×${seats}=${fmt(capacity)} people/hour.`, zh: `运力=(60/${cycle})×${seats}=${fmt(capacity)} 人/小时。` }),
    question(`${id}-2`, { en: 'For y=ax² with a>0 and x≠0, what is the elasticity (dy/dx)(x/y)?', zh: '对于 y=ax²（a>0 且 x≠0），弹性 (dy/dx)(x/y) 等于多少？' }, { en: ['1', '2', 'ax', '2ax'], zh: ['1', '2', 'ax', '2ax'] }, 1, { en: '(2ax)(x/(ax²))=2.', zh: '(2ax)(x/(ax²))=2。' }),
    question(`${id}-3`, { en: `A lift can serve ${service} guests/hour. A trail safely holds ${480 + 20 * seed} guests and mean trail residence is 2 hours. What steady admission rate is feasible?`, zh: `缆车运力为 ${service} 人/小时，雪道安全容量为 ${480 + 20 * seed} 人，平均停留 2 小时。稳态下可行的最大入场率是多少？` }, { en: [fmt(service), fmt(trail), fmt(480 + 20 * seed), fmt(service + trail)], zh: [fmt(service), fmt(trail), fmt(480 + 20 * seed), fmt(service + trail)] }, 1, { en: `The trail implies λ≤K/τ=${fmt(trail)}; combine constraints by taking the minimum with lift service.`, zh: `雪道约束给出 λ≤K/τ=${fmt(trail)}；与缆车运力取较小者。` }),
    question(`${id}-4`, { en: 'A parameter rises 10% and the output rises about 20%. What local elasticity is suggested?', zh: '某参数增加 10%，输出约增加 20%。这表明局部弹性约为多少？' }, { en: ['0.5', '1', '2', '10'], zh: ['0.5', '1', '2', '10'] }, 2, { en: 'Elasticity is approximately relative output change divided by relative input change: 20%/10%=2.', zh: '弹性约为输出相对变化除以输入相对变化：20%/10%=2。' }),
    question(`${id}-5`, { en: 'Which pair belongs in a minimal model contract?', zh: '下面哪一组应当写入最小模型契约？' }, { en: ['Purpose and falsifying evidence', 'Only the chosen algorithm', 'Only available data columns', 'A final chart and no assumptions'], zh: ['目的与可推翻模型的证据', '只有所选算法', '只有已有数据列', '只有最终图表且不写假设'] }, 0, { en: 'A defensible model declares what it is for and what observation would show it is inadequate.', zh: '可辩护的模型必须说明用途，以及什么观测会证明它不充分。' }),
  ]
}

function competition(seed: number, id: string): ModelingQuizQuestion[] {
  const n = 16 + 4 * seed
  const sd = 8 + seed
  const se = sd / Math.sqrt(n)
  return [
    question(`${id}-1`, { en: 'Three criteria have weights 0.5, 0.3, 0.2. A proposal scores 80, 60, 90. What is its weighted score?', zh: '三个指标权重为 0.5、0.3、0.2，某方案得分为 80、60、90。加权总分是多少？' }, { en: ['72', '74', '76', '78'], zh: ['72', '74', '76', '78'] }, 2, { en: '0.5×80+0.3×60+0.2×90=76.', zh: '0.5×80+0.3×60+0.2×90=76。' }),
    question(`${id}-2`, { en: `A pilot estimate has sample SD ${sd} from n=${n} independent runs. What is its standard error?`, zh: `一次试验估计来自 n=${n} 次独立运行，样本标准差为 ${sd}。标准误是多少？` }, { en: [fmt(se), fmt(sd / n), fmt(sd * Math.sqrt(n)), fmt(n / sd)], zh: [fmt(se), fmt(sd / n), fmt(sd * Math.sqrt(n)), fmt(n / sd)] }, 0, { en: `SE=s/√n=${sd}/√${n}=${fmt(se)}.`, zh: `SE=s/√n=${sd}/√${n}=${fmt(se)}。` }),
    question(`${id}-3`, { en: 'A model takes 12 minutes to run. Parallelization gives speedup 3, but setup adds 2 minutes. What is total wall time?', zh: '某模型串行运行需 12 分钟，并行加速比为 3，但准备开销为 2 分钟。总墙钟时间是多少？' }, { en: ['4 min', '5 min', '6 min', '8 min'], zh: ['4 分钟', '5 分钟', '6 分钟', '8 分钟'] }, 2, { en: 'Runtime is 12/3+2=6 minutes.', zh: '运行时间为 12/3+2=6 分钟。' }),
    question(`${id}-4`, { en: 'An AI proposes p=exp(−t) where t is measured in hours. What is missing?', zh: 'AI 给出 p=exp(−t)，其中 t 以小时计。这个表达式缺少什么？' }, { en: ['A dimensionless exponent, such as −kt with k in 1/hour', 'A larger dataset only', 'A bar chart', 'An integer decision variable'], zh: ['无量纲指数，例如 −kt，其中 k 的单位为 1/小时', '只需要更大的数据集', '一张柱状图', '一个整数决策变量'] }, 0, { en: 'The argument of an exponential must be dimensionless.', zh: '指数函数的自变量必须无量纲。' }),
    question(`${id}-5`, { en: 'Which practice most directly makes a stochastic result reproducible?', zh: '哪种做法最直接地使随机算法结果可复现？' }, { en: ['Report only the best run', 'Fix and report seeds, code, data version, and environment', 'Round all outputs', 'Increase the number of figures'], zh: ['只报告最好的一次', '固定并报告随机种子、代码、数据版本和环境', '把结果全部取整', '增加图片数量'] }, 1, { en: 'Reproducibility requires enough information to regenerate the computational path.', zh: '可复现性要求他人能够重建完整计算路径。' }),
  ]
}

function visual(seed: number, id: string): ModelingQuizQuestion[] {
  const mean = 40 + seed
  const se = 2 + seed / 5
  const lo = mean - 1.96 * se
  const hi = mean + 1.96 * se
  return [
    question(`${id}-1`, { en: 'A success rate rises from 40% to 52%. What is the change?', zh: '成功率从 40% 上升到 52%。变化是多少？' }, { en: ['12%', '12 percentage points and 30% relative increase', '30 percentage points', '92%'], zh: ['12%', '增加 12 个百分点，相对增幅 30%', '增加 30 个百分点', '92%'] }, 1, { en: 'The absolute change is 12 percentage points; 12/40=30% relative.', zh: '绝对变化为 12 个百分点；相对变化为 12/40=30%。' }),
    question(`${id}-2`, { en: 'A line passes through (2,5) and (6,17). What slope should the graphic communicate?', zh: '一条直线经过 (2,5) 与 (6,17)。图中应体现的斜率是多少？' }, { en: ['2', '3', '4', '12'], zh: ['2', '3', '4', '12'] }, 1, { en: '(17−5)/(6−2)=3.', zh: '(17−5)/(6−2)=3。' }),
    question(`${id}-3`, { en: 'On a base-10 log axis, two equally spaced points are 10 and 100. What is the next equally spaced value?', zh: '在以 10 为底的对数轴上，10 与 100 等距。下一个等距数值是多少？' }, { en: ['190', '200', '1000', '10000'], zh: ['190', '200', '1000', '10000'] }, 2, { en: 'Equal distance means equal ratio; multiply by 10 again.', zh: '对数轴上等距意味着比例相同，因此再次乘以 10。' }),
    question(`${id}-4`, { en: `A mean is ${mean} with standard error ${fmt(se)}. What approximate 95% confidence interval uses mean±1.96SE?`, zh: `均值为 ${mean}，标准误为 ${fmt(se)}。用均值±1.96SE 得到的近似 95% 置信区间是？` }, { en: [`[${fmt(lo)}, ${fmt(hi)}]`, `[${fmt(mean - se)}, ${fmt(mean + se)}]`, `[${fmt(mean - 2)}, ${fmt(mean + 2)}]`, `[0, ${fmt(hi)}]`], zh: [`[${fmt(lo)}, ${fmt(hi)}]`, `[${fmt(mean - se)}, ${fmt(mean + se)}]`, `[${fmt(mean - 2)}, ${fmt(mean + 2)}]`, `[0, ${fmt(hi)}]`] }, 0, { en: `Compute ${mean}±1.96×${fmt(se)}.`, zh: `计算 ${mean}±1.96×${fmt(se)}。` }),
    question(`${id}-5`, { en: 'A classifier has TP=36 and FP=12. What is precision?', zh: '分类器 TP=36、FP=12。精确率 precision 是多少？' }, { en: ['0.60', '0.70', '0.75', '0.80'], zh: ['0.60', '0.70', '0.75', '0.80'] }, 2, { en: 'Precision=TP/(TP+FP)=36/48=0.75.', zh: 'Precision=TP/(TP+FP)=36/48=0.75。' }),
  ]
}

function optimization(seed: number, id: string): ModelingQuizQuestion[] {
  const b = 3 + seed
  return [
    question(`${id}-1`, { en: `Maximize 3x+2y subject to 0≤x≤${b}, 0≤y≤4. What is the optimum value?`, zh: `最大化 3x+2y，约束 0≤x≤${b}、0≤y≤4。最优值是多少？` }, { en: [fmt(3 * b), fmt(2 * 4), fmt(3 * b + 8), fmt(3 * b + 4)], zh: [fmt(3 * b), fmt(8), fmt(3 * b + 8), fmt(3 * b + 4)] }, 2, { en: `Both coefficients are positive, so x=${b}, y=4 and the value is ${3 * b + 8}.`, zh: `两个目标系数都为正，因此取 x=${b}、y=4，目标值为 ${3 * b + 8}。` }),
    question(`${id}-2`, { en: 'A binding resource constraint has optimal dual value 4. If its right-hand side increases by 0.5 within the sensitivity range, what first-order objective improvement is predicted?', zh: '某紧约束的最优对偶变量为 4。若右端项在敏感区间内增加 0.5，目标值一阶近似改善多少？' }, { en: ['0.5', '2', '4', '8'], zh: ['0.5', '2', '4', '8'] }, 1, { en: 'Shadow price × resource change =4×0.5=2.', zh: '影子价格×资源变化量=4×0.5=2。' }),
    question(`${id}-3`, { en: `What minimizes f(x)=0.5x²−${b}x over all real x?`, zh: `在全体实数上，哪个 x 使 f(x)=0.5x²−${b}x 最小？` }, { en: [fmt(-b), '0', fmt(b / 2), fmt(b)], zh: [fmt(-b), '0', fmt(b / 2), fmt(b)] }, 3, { en: `f′(x)=x−${b}=0 and f″(x)=1>0.`, zh: `f′(x)=x−${b}=0，且 f″(x)=1>0。` }),
    question(`${id}-4`, { en: 'At a KKT point, an inequality has slack 3. What must its nonnegative multiplier be?', zh: '在 KKT 点，某不等式约束的松弛量为 3。其非负乘子必须是多少？' }, { en: ['0', '1/3', '3', 'Cannot be inferred'], zh: ['0', '1/3', '3', '无法判断'] }, 0, { en: 'Complementary slackness requires multiplier×slack=0.', zh: '互补松弛要求乘子×松弛量=0。' }),
    question(`${id}-5`, { en: 'Does vector (3,4) satisfy the second-order-cone constraint ‖z‖₂≤5?', zh: '向量 (3,4) 是否满足二阶锥约束 ‖z‖₂≤5？' }, { en: ['No, because 3+4>5', 'Yes, with equality', 'Yes, with slack 2', 'No, because ‖z‖₂=7'], zh: ['不满足，因为 3+4>5', '满足，且取等号', '满足，松弛量为 2', '不满足，因为 ‖z‖₂=7'] }, 1, { en: '√(3²+4²)=5.', zh: '√(3²+4²)=5。' }),
  ]
}

function convex(seed: number, id: string): ModelingQuizQuestion[] {
  const x = 4 + seed
  return [
    question(`${id}-1`, { en: 'Which twice-differentiable scalar function is convex on all real numbers?', zh: '哪个二次可微的一元函数在全体实数上凸？' }, { en: ['−x²', 'x²+3x', 'sin x', '−exp(x)'], zh: ['−x²', 'x²+3x', 'sin x', '−exp(x)'] }, 1, { en: 'Its second derivative is 2≥0 everywhere.', zh: '其二阶导数恒为 2≥0。' }),
    question(`${id}-2`, { en: `For f(x)=0.5x², gradient descent starts at x=${x} with step size 0.25. What is the next iterate?`, zh: `对 f(x)=0.5x²，从 x=${x} 开始，梯度下降步长为 0.25。下一次迭代是多少？` }, { en: [fmt(x - 0.25), fmt(0.75 * x), fmt(0.25 * x), fmt(x + 0.25 * x)], zh: [fmt(x - 0.25), fmt(0.75 * x), fmt(0.25 * x), fmt(x + 0.25 * x)] }, 1, { en: `∇f=x, so x⁺=x−0.25x=0.75x=${fmt(0.75 * x)}.`, zh: `∇f=x，因此 x⁺=x−0.25x=0.75x=${fmt(0.75 * x)}。` }),
    question(`${id}-3`, { en: 'Which set is the subdifferential of |x| at x=0?', zh: '|x| 在 x=0 处的次微分集合是什么？' }, { en: ['{0}', '[−1,1]', '{−1,1}', 'All real numbers'], zh: ['{0}', '[−1,1]', '{−1,1}', '全体实数'] }, 1, { en: 'Every slope between −1 and 1 supports |x| at the origin.', zh: '原点处 −1 到 1 之间的所有斜率都构成支撑线。' }),
    question(`${id}-4`, { en: 'What is the soft-thresholding prox of λ|x| at x=3 with λ=1?', zh: 'λ=1 时，λ|x| 在 x=3 处的软阈值近端算子结果是多少？' }, { en: ['1', '2', '3', '4'], zh: ['1', '2', '3', '4'] }, 1, { en: 'soft(3,1)=sign(3)max(3−1,0)=2.', zh: 'soft(3,1)=sign(3)max(3−1,0)=2。' }),
    question(`${id}-5`, { en: 'Losses are 1, 2, 5, 12 with equal probability. Using the worst 25% tail, what is CVaR?', zh: '损失 1、2、5、12 等概率发生。取最坏 25% 尾部，CVaR 是多少？' }, { en: ['5', '6.5', '8', '12'], zh: ['5', '6.5', '8', '12'] }, 3, { en: 'The worst quarter contains only the loss 12, so its conditional mean is 12.', zh: '最坏四分之一只包含损失 12，因此条件均值为 12。' }),
  ]
}

function robust(seed: number, id: string): ModelingQuizQuestion[] {
  const budget = 100 + 10 * seed
  return [
    question(`${id}-1`, { en: 'For minimization objectives, A=(4,7), B=(5,9), C=(3,10). Which point is dominated?', zh: '对最小化双目标，A=(4,7)、B=(5,9)、C=(3,10)。哪个点被支配？' }, { en: ['A', 'B', 'C', 'None'], zh: ['A', 'B', 'C', '都不被支配'] }, 1, { en: 'A is no worse than B in either objective and strictly better in both.', zh: 'A 在两个目标上都不差于 B，且都严格更优。' }),
    question(`${id}-2`, { en: 'With weights (0.7,0.3), what is the scalarized value of objective vector (20,50)?', zh: '权重为 (0.7,0.3) 时，目标向量 (20,50) 的加权值是多少？' }, { en: ['29', '31', '35', '70'], zh: ['29', '31', '35', '70'] }, 0, { en: '0.7×20+0.3×50=29.', zh: '0.7×20+0.3×50=29。' }),
    question(`${id}-3`, { en: `A unit cost lies in [4,6] and the robust budget is ${budget}. What is the largest nonnegative quantity x satisfying cx≤${budget} for every c in the interval?`, zh: `单位成本 c∈[4,6]，鲁棒预算为 ${budget}。要使所有 c 下都有 cx≤${budget}，最大的非负 x 是多少？` }, { en: [fmt(budget / 4), fmt(budget / 5), fmt(budget / 6), fmt(budget)], zh: [fmt(budget / 4), fmt(budget / 5), fmt(budget / 6), fmt(budget)] }, 2, { en: `The worst cost is 6, hence x≤${budget}/6=${fmt(budget / 6)}.`, zh: `最坏成本为 6，因此 x≤${budget}/6=${fmt(budget / 6)}。` }),
    question(`${id}-4`, { en: 'Regrets of plans P and Q across three scenarios are P=(0,6,3), Q=(2,2,5). Which minimizes maximum regret?', zh: '方案 P、Q 在三个情景下的遗憾值分别为 P=(0,6,3)、Q=(2,2,5)。哪个方案最小化最大遗憾？' }, { en: ['P', 'Q', 'They tie', 'Cannot compare'], zh: ['P', 'Q', '二者相同', '无法比较'] }, 1, { en: 'max regret is 6 for P and 5 for Q.', zh: 'P 的最大遗憾为 6，Q 为 5。' }),
    question(`${id}-5`, { en: 'If demand is Normal(100,10²), approximately what capacity gives a 95% one-sided service probability using z=1.645?', zh: '若需求服从 Normal(100,10²)，使用 z=1.645，约需要多少容量才能达到单侧 95% 服务概率？' }, { en: ['110', '116.45', '119.6', '264.5'], zh: ['110', '116.45', '119.6', '264.5'] }, 1, { en: 'Capacity=μ+zσ=100+1.645×10=116.45.', zh: '容量=μ+zσ=100+1.645×10=116.45。' }),
  ]
}

function metaheuristics(seed: number, id: string): ModelingQuizQuestion[] {
  const t = 2 + seed / 2
  const acceptance = Math.exp(-4 / t)
  return [
    question(`${id}-1`, { en: 'Roulette selection uses fitness values 2, 3, 5. What is the probability of selecting the third individual?', zh: '轮盘赌选择中三个个体适应度为 2、3、5。选中第三个个体的概率是多少？' }, { en: ['0.2', '0.3', '0.5', '0.8'], zh: ['0.2', '0.3', '0.5', '0.8'] }, 2, { en: '5/(2+3+5)=0.5.', zh: '5/(2+3+5)=0.5。' }),
    question(`${id}-2`, { en: 'In one dimension, PSO uses w=0.5, v=2, cognitive term=−1 and social term=3. What is the new velocity?', zh: '一维 PSO 中 w=0.5、v=2，认知项为 −1，社会项为 3。新速度是多少？' }, { en: ['1', '2', '3', '4'], zh: ['1', '2', '3', '4'] }, 2, { en: 'v⁺=0.5×2−1+3=3.', zh: 'v⁺=0.5×2−1+3=3。' }),
    question(`${id}-3`, { en: `Simulated annealing proposes a move with objective increase Δ=4 at temperature T=${fmt(t)}. What is its Metropolis acceptance probability?`, zh: `模拟退火提出一个目标值增加 Δ=4 的移动，温度 T=${fmt(t)}。Metropolis 接受概率是多少？` }, { en: [fmt(acceptance), fmt(acceptance / 2), fmt((1 + acceptance) / 2), fmt(acceptance + 0.15)], zh: [fmt(acceptance), fmt(acceptance / 2), fmt((1 + acceptance) / 2), fmt(acceptance + 0.15)] }, 0, { en: `p=exp(−Δ/T)=exp(−4/${fmt(t)})≈${fmt(acceptance)}.`, zh: `p=exp(−Δ/T)=exp(−4/${fmt(t)})≈${fmt(acceptance)}。` }),
    question(`${id}-4`, { en: 'A candidate has objective 30 and violates a constraint by 2. With quadratic penalty coefficient 5, what penalized objective is minimized?', zh: '某候选解目标值为 30，约束违反量为 2，二次罚系数为 5。最小化的罚后目标是多少？' }, { en: ['32', '35', '40', '50'], zh: ['32', '35', '40', '50'] }, 3, { en: '30+5×2²=50.', zh: '30+5×2²=50。' }),
    question(`${id}-5`, { en: 'For fair algorithm comparison, which statistic is most defensible?', zh: '为了公平比较随机优化算法，哪种统计最有说服力？' }, { en: ['The best run from each algorithm', 'Mean, spread, feasibility rate, and runtime over matched seeds', 'One screenshot of convergence', 'Only final objective rounded to an integer'], zh: ['每种算法最好的一次', '在相同随机种子下报告均值、离散程度、可行率与运行时间', '一张收敛截图', '只报告取整后的最终目标值'] }, 1, { en: 'Stochastic methods require replicated, paired evidence rather than best-run anecdotes.', zh: '随机算法需要重复且配对的证据，不能只讲最好的一次。' }),
  ]
}

function ode(seed: number, id: string): ModelingQuizQuestion[] {
  const y = 2 + seed
  const h = 0.1
  const euler = y + h * (3 - y)
  return [
    question(`${id}-1`, { en: `Use one Euler step of size 0.1 for y′=3−y from y=${y}. What is y_next?`, zh: `对 y′=3−y，从 y=${y} 出发做一步步长 0.1 的 Euler 法。y_next 是多少？` }, { en: [fmt(euler), fmt(y + 0.3), fmt(3 - y), fmt(y / 0.1)], zh: [fmt(euler), fmt(y + 0.3), fmt(3 - y), fmt(y / 0.1)] }, 0, { en: `y⁺=y+0.1(3−y)=${fmt(euler)}.`, zh: `y⁺=y+0.1(3−y)=${fmt(euler)}。` }),
    question(`${id}-2`, { en: 'For y′=6−2y, what is the equilibrium and its local stability?', zh: '对 y′=6−2y，平衡点及其局部稳定性是什么？' }, { en: ['y*=2, unstable', 'y*=3, stable', 'y*=3, unstable', 'y*=6, stable'], zh: ['y*=2，不稳定', 'y*=3，稳定', 'y*=3，不稳定', 'y*=6，稳定'] }, 1, { en: '6−2y*=0 gives 3, and derivative −2<0 gives local asymptotic stability.', zh: '由 6−2y*=0 得 y*=3，导数 −2<0 表明局部渐近稳定。' }),
    question(`${id}-3`, { en: 'For logistic growth N′=rN(1−N/K), which nonnegative equilibrium is stable when r>0?', zh: '对 Logistic 增长 N′=rN(1−N/K)，r>0 时哪个非负平衡点稳定？' }, { en: ['N=0 only', 'N=K only', 'Both', 'Neither'], zh: ['只有 N=0', '只有 N=K', '二者都稳定', '二者都不稳定'] }, 1, { en: 'The derivative is r at 0 (unstable) and −r at K (stable).', zh: '右端导数在 0 处为 r（不稳定），在 K 处为 −r（稳定）。' }),
    question(`${id}-4`, { en: 'The small-angle approximation for a pendulum replaces sin θ by what?', zh: '单摆的小角度近似用什么替代 sin θ？' }, { en: ['0', 'θ', 'θ²/2', '1−θ²/2'], zh: ['0', 'θ', 'θ²/2', '1−θ²/2'] }, 1, { en: 'The first-order Taylor approximation is sin θ≈θ.', zh: '一阶 Taylor 近似为 sin θ≈θ。' }),
    question(`${id}-5`, { en: 'Halving a numerical step reduces error by about a factor of 4. What observed order p satisfies error∝h^p?', zh: '数值步长减半后误差约缩小 4 倍。若 error∝h^p，观测阶 p 是多少？' }, { en: ['1', '2', '3', '4'], zh: ['1', '2', '3', '4'] }, 1, { en: '(1/2)^p=1/4, so p=2.', zh: '(1/2)^p=1/4，因此 p=2。' }),
  ]
}

function coupledOde(seed: number, id: string): ModelingQuizQuestion[] {
  return [
    question(`${id}-1`, { en: 'In the closed SIR model S′=−βSI/N, I′=βSI/N−γI, R′=γI, what is (S+I+R)′?', zh: '闭合 SIR 模型中 S′=−βSI/N、I′=βSI/N−γI、R′=γI，则 (S+I+R)′ 等于多少？' }, { en: ['−γI', 'βSI/N', '0', 'N'], zh: ['−γI', 'βSI/N', '0', 'N'] }, 2, { en: 'The transfer terms cancel exactly, expressing population conservation.', zh: '各转移项严格抵消，体现总人口守恒。' }),
    question(`${id}-2`, { en: 'At the start of an SIR outbreak with S≈N, β=0.6/day and γ=0.2/day. What is R₀?', zh: 'SIR 疫情初期 S≈N，β=0.6/天、γ=0.2/天。R₀ 是多少？' }, { en: ['0.3', '1', '3', '5'], zh: ['0.3', '1', '3', '5'] }, 2, { en: 'R₀=β/γ=3.', zh: 'R₀=β/γ=3。' }),
    question(`${id}-3`, { en: 'A 2×2 Jacobian has trace −5 and determinant 6. Its eigenvalues are −2 and −3. What follows?', zh: '某 2×2 Jacobian 的迹为 −5、行列式为 6，特征值为 −2、−3。可以得出什么结论？' }, { en: ['Locally asymptotically stable', 'Unstable saddle', 'Center', 'Stability is impossible to assess'], zh: ['局部渐近稳定', '不稳定鞍点', '中心', '无法判断稳定性'] }, 0, { en: 'Both eigenvalues have negative real parts.', zh: '两个特征值实部都为负。' }),
    question(`${id}-4`, { en: 'For Lotka–Volterra x′=αx−βxy, y′=δxy−γy, what positive equilibrium is obtained?', zh: '对 Lotka–Volterra 系统 x′=αx−βxy、y′=δxy−γy，正平衡点是什么？' }, { en: ['(α/β,γ/δ)', '(γ/δ,α/β)', '(β/α,δ/γ)', '(0,0) only'], zh: ['(α/β,γ/δ)', '(γ/δ,α/β)', '(β/α,δ/γ)', '只有 (0,0)'] }, 1, { en: 'Set α−βy=0 and δx−γ=0.', zh: '令 α−βy=0、δx−γ=0 即得。' }),
    question(`${id}-5`, { en: 'A compartment contains 120 units and has steady outflow 30 units/day. What is the mean residence time?', zh: '某房室含有 120 个单位，稳态流出率为 30 个单位/天。平均停留时间是多少？' }, { en: ['0.25 day', '4 days', '30 days', '90 days'], zh: ['0.25 天', '4 天', '30 天', '90 天'] }, 1, { en: 'Residence time=stock/flow=120/30=4 days.', zh: '停留时间=存量/流量=120/30=4 天。' }),
  ]
}

function timeSeries(seed: number, id: string): ModelingQuizQuestion[] {
  const alpha = 0.2 + 0.05 * seed
  const forecast = alpha * 120 + (1 - alpha) * 100
  return [
    question(`${id}-1`, { en: 'For observations 4, 7, 10, 13, what is the lag-one sample pattern?', zh: '对观测值 4、7、10、13，其一阶滞后变化模式是什么？' }, { en: ['Constant increment 3', 'Constant ratio 3', 'White noise', 'Seasonal period 2'], zh: ['固定增量 3', '固定比率 3', '白噪声', '周期为 2 的季节性'] }, 0, { en: 'Each first difference is 3, indicating a linear trend over this short window.', zh: '相邻一阶差分均为 3，说明这个短窗口中存在近似线性趋势。' }),
    question(`${id}-2`, { en: `Simple exponential smoothing has previous level 100, current observation 120, and α=${fmt(alpha)}. What is the updated level?`, zh: `简单指数平滑的上一期水平为 100，本期观测为 120，α=${fmt(alpha)}。更新后的水平是多少？` }, { en: [fmt(forecast), fmt(forecast - 3), fmt(forecast + 3), '120'], zh: [fmt(forecast), fmt(forecast - 3), fmt(forecast + 3), '120'] }, 0, { en: `ℓ_t=αy_t+(1−α)ℓ_(t−1)=${fmt(forecast)}.`, zh: `ℓ_t=αy_t+(1−α)ℓ_(t−1)=${fmt(forecast)}。` }),
    question(`${id}-3`, { en: 'Monthly demand has a stable annual seasonal pattern. What seasonal lag should be inspected first?', zh: '月度需求存在稳定的年度季节规律。首先应检查哪个季节滞后？' }, { en: ['1', '4', '7', '12'], zh: ['1', '4', '7', '12'] }, 3, { en: 'Twelve monthly observations form one annual cycle.', zh: '12 个月度观测构成一个年度周期。' }),
    question(`${id}-4`, { en: 'A forecast error vector is (2, −1, 3). What is MAE?', zh: '预测误差向量为 (2, −1, 3)。MAE 是多少？' }, { en: ['1', '2', '√(14/3)', '4'], zh: ['1', '2', '√(14/3)', '4'] }, 1, { en: 'MAE=(|2|+|−1|+|3|)/3=2.', zh: 'MAE=(|2|+|−1|+|3|)/3=2。' }),
    question(`${id}-5`, { en: 'Which validation design prevents future information from entering a time-series model?', zh: '哪种验证设计能够避免未来信息进入时间序列模型？' }, { en: ['Randomly shuffle all rows', 'Rolling-origin evaluation', 'Fit on the entire series', 'Normalize using full-sample extrema'], zh: ['随机打乱所有行', '滚动预测起点评估', '在完整序列上拟合', '使用全样本极值归一化'] }, 1, { en: 'Each rolling-origin training window contains only observations available before its test window.', zh: '滚动起点的每个训练窗口只包含测试窗口之前已经可用的观测。' }),
  ]
}

function dataPreparation(seed: number, id: string): ModelingQuizQuestion[] {
  const mean = 10 + seed
  const sd = 2
  const z = (14 - mean) / sd
  return [
    question(`${id}-1`, { en: 'A dataset has 240 rows, 18 duplicate entity-time pairs, and 7 rows with impossible units. After removing both disjoint groups, how many rows remain?', zh: '数据集有 240 行，其中 18 行实体-时间键重复，另有 7 行单位不可能；两组不重叠。删除后剩多少行？' }, { en: ['215', '222', '229', '233'], zh: ['215', '222', '229', '233'] }, 0, { en: '240−18−7=215.', zh: '240−18−7=215。' }),
    question(`${id}-2`, { en: `A feature has training mean ${mean} and standard deviation ${sd}. What is the training-standardized value of x=14?`, zh: `某特征训练集均值为 ${mean}、标准差为 ${sd}。x=14 的训练标准化值是多少？` }, { en: [fmt(z), fmt(z + 1), fmt(z + 2), fmt(mean)], zh: [fmt(z), fmt(z + 1), fmt(z + 2), fmt(mean)] }, 0, { en: `z=(14−${mean})/${sd}=${fmt(z)}. Test data must use these training statistics.`, zh: `z=(14−${mean})/${sd}=${fmt(z)}；测试集也必须使用训练集统计量。` }),
    question(`${id}-3`, { en: 'Linear interpolation lies between (t,y)=(2,8) and (6,20). What is y at t=5?', zh: '在 (t,y)=(2,8) 与 (6,20) 之间做线性插值，t=5 时 y 是多少？' }, { en: ['14', '16', '17', '18'], zh: ['14', '16', '17', '18'] }, 2, { en: 'The slope is 3 per time unit, so y=8+3(5−2)=17.', zh: '斜率为每单位时间 3，因此 y=8+3(5−2)=17。' }),
    question(`${id}-4`, { en: 'If Q1=20 and Q3=32, which value is above the Tukey upper fence?', zh: '若 Q1=20、Q3=32，哪个数高于 Tukey 上围栏？' }, { en: ['42', '48', '50', '52'], zh: ['42', '48', '50', '52'] }, 3, { en: 'IQR=12 and the upper fence is 32+1.5×12=50; only 52 is strictly above it.', zh: 'IQR=12，上围栏为 32+1.5×12=50；只有 52 严格高于它。' }),
    question(`${id}-5`, { en: 'Which operation is data leakage?', zh: '下面哪项属于数据泄漏？' }, { en: ['Fit an imputer on training rows and apply it to validation rows', 'Compute normalization limits from the full dataset before splitting', 'Record units in the data dictionary', 'Keep an untouched test set'], zh: ['仅用训练行拟合插补器，再应用到验证行', '划分数据前用全数据计算归一化范围', '在数据字典中记录单位', '保留未触碰的测试集'] }, 1, { en: 'Full-data normalization lets validation and test distributions influence training-time transformations.', zh: '用全数据计算归一化参数，会让验证集和测试集分布进入训练阶段。' }),
  ]
}

function evaluation(seed: number, id: string): ModelingQuizQuestion[] {
  const raw = 44 + 3 * seed
  const benefit = (raw - 40) / 40
  return [
    question(`${id}-1`, { en: `A benefit criterion ranges from 40 to 80. What is the min-max normalized value of ${raw}?`, zh: `某效益型指标范围为 40 到 80。${raw} 的极差归一化值是多少？` }, { en: [fmt(benefit), fmt(raw / 100), fmt((80 - raw) / 80), fmt(raw - 40)], zh: [fmt(benefit), fmt(raw / 100), fmt((80 - raw) / 80), fmt(raw - 40)] }, 0, { en: `(${raw}−40)/(80−40)=${fmt(benefit)}.`, zh: `(${raw}−40)/(80−40)=${fmt(benefit)}。` }),
    question(`${id}-2`, { en: 'An AHP pairwise matrix has a_12=4. What must a_21 equal?', zh: 'AHP 判断矩阵中 a_12=4，则 a_21 必须等于多少？' }, { en: ['−4', '0.25', '1', '4'], zh: ['−4', '0.25', '1', '4'] }, 1, { en: 'Reciprocal judgment matrices require a_ji=1/a_ij.', zh: '互反判断矩阵要求 a_ji=1/a_ij。' }),
    question(`${id}-3`, { en: 'Normalized weighted point z=(0.6,0.8), positive ideal z+=(1,1). What is its Euclidean distance to the positive ideal?', zh: '归一化加权点 z=(0.6,0.8)，正理想点 z+=(1,1)。到正理想点的欧氏距离是多少？' }, { en: ['0.2', '√0.2', '0.6', '1'], zh: ['0.2', '√0.2', '0.6', '1'] }, 1, { en: 'd+=√((0.6−1)²+(0.8−1)²)=√0.2.', zh: 'd+=√((0.6−1)²+(0.8−1)²)=√0.2。' }),
    question(`${id}-4`, { en: 'TOPSIS distances are d+=2 and d−=6. What is the closeness coefficient?', zh: 'TOPSIS 中 d+=2、d−=6。贴近度系数是多少？' }, { en: ['0.25', '0.5', '0.75', '3'], zh: ['0.25', '0.5', '0.75', '3'] }, 2, { en: 'C=d−/(d++d−)=6/8=0.75.', zh: 'C=d−/(d++d−)=6/8=0.75。' }),
    question(`${id}-5`, { en: 'A small weight perturbation reverses the top two ranks. What is the defensible conclusion?', zh: '权重发生很小扰动就使前两名互换。最合理的结论是什么？' }, { en: ['The ranking is unquestionably robust', 'The alternatives are practically tied under plausible preferences', 'Delete the second alternative', 'Increase decimal precision'], zh: ['排序无疑非常稳健', '在合理偏好范围内两个方案几乎并列', '删除第二个方案', '增加小数位数'] }, 1, { en: 'Rank instability is substantive evidence about preference sensitivity, not a rounding problem.', zh: '名次不稳定反映偏好敏感性，是实质性证据，不是舍入问题。' }),
  ]
}

function writing(seed: number, id: string): ModelingQuizQuestion[] {
  const reduction = 10 + 2 * seed
  return [
    question(`${id}-1`, { en: `A baseline error is 25 and the proposed error is ${25 - reduction / 2}. What relative reduction is achieved?`, zh: `基线误差为 25，改进模型误差为 ${25 - reduction / 2}。相对降幅是多少？` }, { en: [`${reduction}%`, `${reduction / 2}%`, `${25 - reduction / 2}%`, `${50 - reduction}%`], zh: [`${reduction}%`, `${reduction / 2}%`, `${25 - reduction / 2}%`, `${50 - reduction}%`] }, 0, { en: `Reduction=(25−${25 - reduction / 2})/25=${reduction}%.`, zh: `降幅=(25−${25 - reduction / 2})/25=${reduction}%。` }),
    question(`${id}-2`, { en: 'Which sentence is a quantified, traceable claim?', zh: '哪句话是可量化且可追溯的结论？' }, { en: ['Our model works very well', 'The method is advanced', 'Rolling-origin MAE fell from 8.4 to 6.1 on 12 held-out weeks', 'The figure is beautiful'], zh: ['我们的模型效果很好', '方法十分先进', '在 12 个留出周的滚动起点评估中，MAE 从 8.4 降至 6.1', '这张图很漂亮'] }, 2, { en: 'It names the metric, comparison, evaluation design, and sample scope.', zh: '它明确给出指标、比较对象、评估方式和样本范围。' }),
    question(`${id}-3`, { en: 'A table reports mean 50 with 95% interval [49.8,50.2]. Which interpretation is justified?', zh: '表格报告均值 50、95% 区间 [49.8,50.2]。哪种解释合理？' }, { en: ['Every future observation lies in the interval', 'The estimate is precise under the stated sampling assumptions', 'The model is causally correct', 'No validation is needed'], zh: ['每个未来观测都在区间内', '在给定抽样假设下估计较精确', '模型具有正确因果关系', '不再需要验证'] }, 1, { en: 'A confidence interval describes estimation uncertainty under assumptions; it is not a prediction interval or causal proof.', zh: '置信区间描述假设条件下的估计不确定性，不是预测区间，也不是因果证明。' }),
    question(`${id}-4`, { en: 'A report defines x as kilograms in one section and grams in another without conversion. What fails first?', zh: '报告前文把 x 定义为千克，后文又未经换算地按克使用。最先失效的是什么？' }, { en: ['Typography only', 'Dimensional consistency and reproducibility', 'The bibliography', 'Page numbering'], zh: ['只是排版', '量纲一致性与可复现性', '参考文献', '页码'] }, 1, { en: 'A symbol table and unit audit prevent a thousand-fold silent error.', zh: '符号表与单位审计可以阻止千倍尺度的静默错误。' }),
    question(`${id}-5`, { en: 'What is the strongest final paragraph?', zh: '哪种结尾段落最有说服力？' }, { en: ['Repeat the introduction', 'List every algorithm used', 'State the decision, evidence, sensitivity, and one important limitation', 'Add untested future claims'], zh: ['重复引言', '罗列全部算法', '给出决策、证据、敏感性和一个重要局限', '加入未经检验的未来断言'] }, 2, { en: 'A strong conclusion closes the evidence chain and defines the claim boundary.', zh: '有力的结论会闭合证据链，并明确结论边界。' }),
  ]
}

const builders: Record<number, (seed: number, id: string) => ModelingQuizQuestion[]> = {
  1: foundations,
  2: competition,
  3: visual,
  4: optimization,
  5: convex,
  6: robust,
  7: metaheuristics,
  9: ode,
  10: coupledOde,
  13: timeSeries,
  15: dataPreparation,
  17: evaluation,
  19: writing,
  20: writing,
}

function chapterFocus(title?: string) {
  const value = title?.toLowerCase() ?? ''
  if (!value || /overview|导读/.test(value)) return null
  if (/linear|geometry|comparison|criteria|weight|timeline|grain|purpose|competition format|cumcm/.test(value)) return 0
  if (/dual|kkt|ahp|arima|swarm|dependence|type|architecture|toolchain|well-posed/.test(value)) return 1
  if (/quadratic|distribution|topsis|anneal|missing|pendulum|compartment|method|genetic|pareto/.test(value)) return 2
  if (/cone|uncertainty|outlier|validation|stability|result|assumption|robust|diagnostic/.test(value)) return 3
  if (/solver|case|decision|pipeline|review|audit|claim|evidence|writing|routine|implementation/.test(value)) return 4
  return null
}

const groundedPrompts = [
  {
    en: (title: string) => `Core idea — which statement is supported by the “${title}” chapter?`,
    zh: (title: string) => `核心概念——“${title}”这一章支持下面哪项陈述？`,
  },
  {
    en: (title: string) => `Mechanism — which claim follows the reasoning developed in “${title}”?`,
    zh: (title: string) => `作用机制——哪项结论符合“${title}”这一章的推理？`,
  },
  {
    en: (title: string) => `Boundary — which interpretation stays within the assumptions of “${title}”?`,
    zh: (title: string) => `适用边界——哪种解释没有超出“${title}”中的假设？`,
  },
  {
    en: (title: string) => `Evidence — which statement matches the checks described in “${title}”?`,
    zh: (title: string) => `证据判断——哪项陈述符合“${title}”中介绍的检查方法？`,
  },
  {
    en: (title: string) => `Transfer — which conclusion can be defended using only “${title}” and earlier chapters?`,
    zh: (title: string) => `迁移理解——只利用“${title}”及此前章节，哪项结论可以得到支持？`,
  },
]

function sourceStatements(source?: string) {
  if (!source) return []
  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]+\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`~>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const statements = plain
    .split(/(?<=[.!?。！？])\s+/)
    .map((value) => value.trim())
    .filter((value) => value.length >= 55 && value.length <= 230)
    .filter((value) => !/^(figure|table|source|image|code)\b/i.test(value))

  return [...new Set(statements)]
}

function evenlySpaced<T>(items: T[], count: number) {
  if (items.length <= count) return items
  return Array.from({ length: count }, (_, index) => items[Math.round((index * (items.length - 1)) / (count - 1))])
}

function distortStatement(statement: string, variant: number, chapterTitle: string, language: 'en' | 'zh') {
  if (language === 'zh') {
    const replacements: [RegExp, string][] = [
      [/必须/g, '完全不需要'],
      [/不能/g, '总是可以'],
      [/增加/g, '必然减少'],
      [/减少/g, '必然增加'],
      [/可行/g, '无条件最优'],
      [/局部/g, '无条件全局'],
    ]
    const [pattern, replacement] = replacements[variant % replacements.length]
    const changed = statement.replace(pattern, replacement)
    if (changed !== statement) return changed
    return [
      `“${chapterTitle}”中的结论不需要任何假设、单位或适用范围。`,
      `只要计算结果有很多小数位，就足以证明“${chapterTitle}”中的模型正确。`,
      `在“${chapterTitle}”中，复杂度本身就是选择方法的充分理由。`,
      `“${chapterTitle}”中的所有结论都可以直接推广到任意数据和情景。`,
    ][variant % 4]
  }

  const replacements: [RegExp, string][] = [
    [/\bmust\b/i, 'never needs to'],
    [/\bcannot\b/i, 'can always'],
    [/\bincrease(s|d)?\b/i, 'always decreases'],
    [/\bdecrease(s|d)?\b/i, 'always increases'],
    [/\bfeasible\b/i, 'unconditionally optimal'],
    [/\blocal\b/i, 'unconditionally global'],
  ]
  const [pattern, replacement] = replacements[variant % replacements.length]
  const changed = statement.replace(pattern, replacement)
  if (changed !== statement) return changed
  return [
    `The conclusions in “${chapterTitle}” require no assumptions, units, or scope conditions.`,
    `A result with many decimal places is sufficient proof that the model in “${chapterTitle}” is correct.`,
    `In “${chapterTitle}”, complexity alone is a sufficient reason to choose a method.`,
    `Every conclusion in “${chapterTitle}” transfers unchanged to arbitrary data and scenarios.`,
  ][variant % 4]
}

function mathFocus(lessonNumber: number, chapterTitle: string) {
  const title = chapterTitle.toLowerCase()
  const rules: Record<number, [RegExp, number][]> = {
    1: [[/model foundations|baseline|dining|study|language/, 0], [/assumption|validation/, 3]],
    2: [[/toolchain|worked case/, 2], [/award paper/, 1], [/chatgpt|algorithm library/, 3]],
    3: [[/comparison/, 0], [/time|forecast/, 1], [/distribution|risk/, 3], [/diagnostic/, 4]],
    4: [[/mathematical program|lp geometry|crop/, 0], [/dual/, 1], [/quadratic/, 2], [/kkt/, 3], [/cone/, 4]],
    5: [[/convexity/, 0], [/smooth|condition/, 1], [/subgradient/, 2], [/proximal|splitting/, 3], [/var|cvar|risk/, 4]],
    6: [[/multiple objective/, 1], [/pareto/, 0], [/robust counterpart/, 2], [/robust vs|stochastic/, 4], [/worked case/, 3]],
    7: [[/genetic/, 0], [/particle swarm/, 1], [/anneal/, 2], [/constraint|penalt|crop/, 3], [/fair experiment/, 4]],
    9: [[/well-posed/, 1], [/pendulum/, 3], [/population/, 2], [/numerical/, 4], [/therapy|drainage|scaling/, 0]],
    10: [[/compartment/, 4], [/epidemic|diagnostic/, 1], [/stability/, 2], [/predator|population/, 3], [/diffusion|reflow/, 0]],
    13: [[/pattern|timeline|dependence/, 0], [/smoothing/, 1], [/arima/, 2], [/validation|decision/, 3], [/uncertainty/, 4]],
    15: [[/grain|type|case/, 0], [/transform/, 1], [/missing/, 2], [/outlier/, 3], [/split|pipeline/, 4]],
    17: [[/criteria|weight/, 0], [/ahp/, 1], [/topsis/, 3], [/alternative/, 2], [/sensitivity|validation|case/, 4]],
    19: [[/result/, 0], [/architecture|method/, 1], [/validation/, 2], [/editing|audit/, 3], [/example/, 4]],
    20: [[/problem|argument/, 1], [/assumption|notation/, 3], [/model|solution/, 0], [/evidence|discussion/, 2], [/conclusion|review/, 4]],
  }
  return rules[lessonNumber]?.find(([pattern]) => pattern.test(title))?.[1] ?? null
}

function groundedChapterQuiz(
  lessonNumber: number,
  chapterIndex: number,
  chapterTitle: string,
  sourceEn?: string,
  sourceZh?: string,
) {
  const english = evenlySpaced(sourceStatements(sourceEn), 5)
  const chinese = evenlySpaced(sourceStatements(sourceZh), 5)
  const focus = mathFocus(lessonNumber, chapterTitle)
  const groundedCount = focus === null ? 5 : 4
  const questions = Array.from({ length: groundedCount }, (_, index) => {
    const fallbackEn = `A defensible use of ${chapterTitle} keeps the stated objective, assumptions, units, and validation evidence connected.`
    const fallbackZh = `合理使用“${chapterTitle}”时，必须让目标、假设、单位和验证证据保持一致。`
    const correctEn = english[index % Math.max(english.length, 1)] ?? fallbackEn
    const correctZh = chinese[index % Math.max(chinese.length, 1)] ?? fallbackZh
    const correctPosition = [1, 3, 0, 2, 1][index]
    const distractorsEn = [0, 1, 2].map((variant) => distortStatement(correctEn, index + variant, chapterTitle, 'en'))
    const distractorsZh = [0, 1, 2].map((variant) => distortStatement(correctZh, index + variant, chapterTitle, 'zh'))
    const optionsEn = [...distractorsEn]
    const optionsZh = [...distractorsZh]
    optionsEn.splice(correctPosition, 0, correctEn)
    optionsZh.splice(correctPosition, 0, correctZh)
    const prompt = groundedPrompts[index]

    return question(
      `lesson-${lessonNumber}-chapter-${chapterIndex + 1}-grounded-${index + 1}`,
      { en: prompt.en(chapterTitle), zh: prompt.zh(chapterTitle) },
      { en: optionsEn, zh: optionsZh },
      correctPosition,
      {
        en: `This statement is grounded in the current chapter. The alternatives remove its conditions, reverse its mechanism, or substitute numerical appearance for evidence.`,
        zh: `这项陈述直接来自当前章节；其余选项删除了适用条件、颠倒了作用机制，或把数值形式误当成证据。`,
      },
    )
  })

  if (focus !== null) {
    const id = `lesson-${lessonNumber}-chapter-${chapterIndex + 1}-math`
    const worked = (builders[lessonNumber] ?? generalQuestions)(chapterIndex + 1, id)[focus]
    questions.push({
      ...worked,
      prompt: {
        en: `Worked calculation for “${chapterTitle}” — ${worked.prompt.en}`,
        zh: `“${chapterTitle}”计算题——${worked.prompt.zh}`,
      },
    })
  }

  return questions
}

export function buildChapterQuiz(
  lessonNumber: number,
  chapterIndex: number,
  chapterTitle?: string,
  sourceEn?: string,
  sourceZh?: string,
) {
  if (chapterTitle && sourceEn) {
    return groundedChapterQuiz(lessonNumber, chapterIndex, chapterTitle, sourceEn, sourceZh)
  }

  const builder = builders[lessonNumber] ?? generalQuestions
  const focus = chapterFocus(chapterTitle)
  const questionOrder = focus === null
    ? [0, 1, 2, 3, 4]
    : [focus, focus, (focus + 1) % 5, focus, (focus + 4) % 5]

  return questionOrder.map((questionIndex, variant) => {
    const id = `lesson-${lessonNumber}-chapter-${chapterIndex + 1}-variant-${variant + 1}`
    return builder(chapterIndex + variant + 1, id)[questionIndex]
  })
}

export function buildLessonFinalQuiz(lessonNumber: number) {
  return [0, 1, 2].flatMap((variant) =>
    (builders[lessonNumber] ?? generalQuestions)(variant + 1, `lesson-${lessonNumber}-final-${variant + 1}`)
  )
}
