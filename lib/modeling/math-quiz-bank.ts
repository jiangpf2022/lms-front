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

function foundationsChapterQuiz(chapterIndex: number): ModelingQuizQuestion[] {
  const id = `lesson-1-chapter-${chapterIndex + 1}`
  const chapters: ModelingQuizQuestion[][] = [
    [
      question(`${id}-1`, { en: 'A city asks whether to add buses during the morning peak. Which statement is a decision-ready modeling objective?', zh: '某城市想判断早高峰是否需要增加公交车。下面哪一项是可以直接用于建模的目标？' }, { en: ['Describe traffic in general', 'Minimize the 95th-percentile passenger wait subject to a fleet budget', 'Collect as much data as possible', 'Use a queueing model'], zh: ['总体描述交通状况', '在车队预算约束下最小化乘客等待时间的 95% 分位数', '收集尽可能多的数据', '使用排队模型'] }, 1, { en: 'It names a decision metric and a constraint. A method is not an objective.', zh: '它同时给出了决策指标与约束；“使用某个模型”只是方法，不是目标。' }),
      question(`${id}-2`, { en: 'Water in a tank obeys S(t+1)=S(t)+inflow−outflow. If S=120 L, inflow=35 L, and outflow=50 L, what is the next state?', zh: '水箱满足 S(t+1)=S(t)+流入−流出。若当前有 120 L，流入 35 L，流出 50 L，下一时刻水量是多少？' }, { en: ['35 L', '85 L', '105 L', '205 L'], zh: ['35 L', '85 L', '105 L', '205 L'] }, 2, { en: '120+35−50=105 L.', zh: '120+35−50=105 L。' }),
      question(`${id}-3`, { en: 'Distance d is modeled by d=v+t, where v is km/h and t is h. What is wrong?', zh: '有人写出距离模型 d=v+t，其中 v 的单位是 km/h，t 的单位是 h。问题在哪里？' }, { en: ['Nothing is wrong', 'The right-hand terms have incompatible units', 'd must be dimensionless', 'Only the numerical values matter'], zh: ['没有问题', '右侧两项量纲不同，不能相加', 'd 必须没有单位', '只要数值正确，单位不重要'] }, 1, { en: 'Terms added together must have the same dimension. A valid simple relation would be d=vt.', zh: '相加的量必须具有相同量纲；一个简单且量纲正确的关系是 d=vt。' }),
      question(`${id}-4`, { en: 'Which observation most directly falsifies a model that assumes a fixed service rate of 30 customers/hour?', zh: '某模型假设服务率恒为 30 人/小时。下面哪项观测最直接说明这一假设不成立？' }, { en: ['The shop has a blue sign', 'Measured service rates repeatedly fall to 12/hour during lunch', 'The fitted curve has three decimals', 'The report contains ten figures'], zh: ['店铺招牌是蓝色的', '午餐时段实测服务率反复降到 12 人/小时', '拟合曲线保留三位小数', '报告中有十张图'] }, 1, { en: 'A repeated, condition-specific violation attacks the assumed mechanism directly.', zh: '这一观测在特定条件下反复违背固定服务率假设，直接否定了模型机制。' }),
      question(`${id}-5`, { en: 'A ski lift delivers 360 skiers/hour. The runs can safely absorb only 240 skiers/hour in steady state. Ignoring other limits, what admission rate is feasible?', zh: '缆车每小时可输送 360 名滑雪者，但雪道在稳态下每小时只能安全消化 240 人。忽略其他限制，可行的最大入场率是多少？' }, { en: ['120/hour', '240/hour', '360/hour', '600/hour'], zh: ['120 人/小时', '240 人/小时', '360 人/小时', '600 人/小时'] }, 1, { en: 'The system throughput is limited by the bottleneck: min(360,240)=240 per hour.', zh: '系统吞吐量由瓶颈决定：min(360,240)=240 人/小时。' }),
    ],
    [
      question(`${id}-1`, { en: 'For a campus-shuttle model, which boundary is best if the decision concerns only waiting at two stops during 8–9 a.m.?', zh: '若研究目标只是分析早上 8–9 点两个站点的候车情况，哪一种系统边界最合适？' }, { en: ['All transportation in the city for a year', 'The two stops, arriving passengers, and shuttle movements during 8–9 a.m.', 'Only the color of each shuttle', 'Every student activity on campus'], zh: ['全市一整年的所有交通', '8–9 点两个站点、到达乘客以及班车运行', '只考虑班车颜色', '校园内所有学生活动'] }, 1, { en: 'A useful boundary contains the flows that can change the target quantity without importing irrelevant systems.', zh: '合理边界应包含会改变目标量的流动，同时排除与决策无关的系统。' }),
      question(`${id}-2`, { en: 'Which variable is a state rather than a flow?', zh: '下面哪个量是“状态量”而不是“流量”？' }, { en: ['Passengers arriving per minute', 'Passengers boarding per minute', 'Passengers currently waiting', 'Bus departures per hour'], zh: ['每分钟到达人数', '每分钟上车人数', '当前正在等待的人数', '每小时发车次数'] }, 2, { en: 'A state is the accumulated condition at an instant; the other quantities are rates.', zh: '状态量描述某一时刻的累积状况，其他三项都是变化率。' }),
      question(`${id}-3`, { en: 'A queue contains 18 people. During the next five minutes, 11 arrive and 20 board. Assuming the queue cannot be negative, how many remain?', zh: '队列中原有 18 人，随后五分钟内到达 11 人、上车 20 人。假设队列人数不能为负，还剩多少人？' }, { en: ['0', '9', '27', '49'], zh: ['0', '9', '27', '49'] }, 1, { en: 'The update is max(0,18+11−20)=9.', zh: '状态更新为 max(0,18+11−20)=9。' }),
      question(`${id}-4`, { en: 'A café serves 24 customers/hour, and an average customer spends 0.5 hour in the system. Under steady conditions, what is the average number in the system?', zh: '某咖啡店每小时服务 24 人，顾客平均在系统中停留 0.5 小时。稳态下系统内平均有多少人？' }, { en: ['12', '24', '36', '48'], zh: ['12', '24', '36', '48'] }, 0, { en: 'Little’s law gives L=λW=24×0.5=12.', zh: '由 Little 定律 L=λW=24×0.5=12。' }),
      question(`${id}-5`, { en: 'Select all quantities sufficient to update a one-step inventory model with known deliveries and demand.', zh: '对于已知下一时段到货量与需求量的单步库存模型，选择所有足以完成状态更新的信息。' }, { en: ['Current inventory', 'Next-period deliveries', 'Next-period demand', 'The warehouse logo'], zh: ['当前库存', '下一时段到货量', '下一时段需求量', '仓库标志'] }, [0, 1, 2], { en: 'The next stock is current stock plus deliveries minus fulfilled demand; the logo has no causal role.', zh: '下一期库存由当前库存、到货量和需求共同决定；仓库标志不参与状态变化。' }),
    ],
    [
      question(`${id}-1`, { en: '“Demand may rise by 20% next week.” What mathematical object should be added first?', zh: '“下周需求可能增加 20%。”首先应在模型中加入什么数学对象？' }, { en: ['A single unchanged average', 'A stressed-demand scenario equal to 1.2 times baseline demand', 'A new font', 'An unconstrained binary variable'], zh: ['一个不变的平均值', '等于基准需求 1.2 倍的压力情景', '一种新字体', '一个没有约束的二元变量'] }, 1, { en: 'The phrase describes uncertainty relative to a baseline, so it naturally becomes a scenario.', zh: '这句话描述了相对于基准值的不确定性，因此最自然的翻译是压力情景。' }),
      question(`${id}-2`, { en: 'A planner chooses the number of buses x and the departure interval h. Which pair are decision variables?', zh: '规划者需要决定公交数量 x 与发车间隔 h。哪一组是决策变量？' }, { en: ['x and h', 'Observed passenger arrivals only', 'Yesterday’s weather and date', 'Predicted waiting time only'], zh: ['x 与 h', '仅观测到的乘客到达量', '昨天的天气与日期', '仅预测等待时间'] }, 0, { en: 'Decision variables are quantities the planner is allowed to choose.', zh: '决策变量是规划者可以主动选择的量。' }),
      question(`${id}-3`, { en: 'Peak waiting times are 4, 5, 5, 6, and 20 minutes. Why is the mean alone a poor objective?', zh: '五个高峰等待时间为 4、5、5、6、20 分钟。为什么只优化均值可能不合适？' }, { en: ['The mean cannot be computed', 'It can hide the severe 20-minute tail', 'Means are always larger than maxima', 'All observations must be equal'], zh: ['均值无法计算', '均值可能掩盖严重的 20 分钟尾部等待', '均值总比最大值大', '所有观测必须相等'] }, 1, { en: 'The mean is 8 minutes, but it does not represent the unusually bad wait that may drive the decision.', zh: '均值为 8 分钟，却无法体现可能真正决定方案的极端等待。' }),
      question(`${id}-4`, { en: 'A fleet has x buses, each with 40 seats, and makes 3 trips/hour. Which capacity constraint is correct for demand D?', zh: '车队有 x 辆公交，每辆 40 座，每小时运行 3 趟。对需求 D，哪个运力约束正确？' }, { en: ['D≤40x', 'D≤3x', 'D≤120x', 'D=120+x'], zh: ['D≤40x', 'D≤3x', 'D≤120x', 'D=120+x'] }, 2, { en: 'Each bus supplies 40×3=120 passenger-trips per hour.', zh: '每辆车每小时提供 40×3=120 个客运位。' }),
      question(`${id}-5`, { en: 'Select all phrases that normally imply explicit constraints rather than objectives.', zh: '选择所有通常应被翻译为“约束”而不是“目标”的表述。' }, { en: ['At most 12 vehicles', 'No route may exceed 40 minutes', 'Minimize total waiting time', 'Every district must receive service'], zh: ['车辆数不超过 12', '任何线路都不能超过 40 分钟', '最小化总等待时间', '每个区域都必须得到服务'] }, [0, 1, 3], { en: '“At most,” “may not,” and “must” define feasibility. “Minimize” defines an objective.', zh: '“不超过”“不能”“必须”规定可行域，而“最小化”规定目标函数。' }),
    ],
    [
      question(`${id}-1`, { en: 'A demand model assumes identical arrival rates every hour. Which test most directly checks that assumption?', zh: '需求模型假设每小时到达率相同。哪种检验最直接？' }, { en: ['Compare estimated arrival rates across hours', 'Increase decimal precision', 'Rename the variables', 'Use a darker plot color'], zh: ['比较不同时段估计的到达率', '增加小数位数', '重新命名变量', '把图画得更深'] }, 0, { en: 'The assumption is about temporal homogeneity, so it must be checked across time.', zh: '这一假设描述的是时间上的一致性，因此应直接比较不同时段。' }),
      question(`${id}-2`, { en: 'A model predicts y=ab. If a is fixed and b has ±10% uncertainty, what relative uncertainty does y inherit?', zh: '模型为 y=ab。若 a 固定、b 存在 ±10% 的不确定性，则 y 的相对不确定性是多少？' }, { en: ['±1%', '±5%', '±10%', '±20%'], zh: ['±1%', '±5%', '±10%', '±20%'] }, 2, { en: 'With a fixed, y changes in direct proportion to b.', zh: '当 a 固定时，y 与 b 成正比，因此相对变化相同。' }),
      question(`${id}-3`, { en: 'Which is a controlled approximation?', zh: '下面哪项属于“受控近似”？' }, { en: ['Ignore travel time without checking its size', 'Treat a 20-second transfer as instantaneous in a two-hour process, then test sensitivity', 'Assume all missing values are zero', 'Delete inconvenient observations'], zh: ['直接忽略行程时间且不检查其大小', '在持续两小时的过程中把 20 秒转移视为瞬时，并做敏感性检验', '假设所有缺失值都等于零', '删除不方便的观测'] }, 1, { en: 'The neglected effect is small relative to the modeled scale, and its influence is checked.', zh: '被忽略的效应相对研究尺度很小，而且还会检验这一近似的影响。' }),
      question(`${id}-4`, { en: 'Output y changes from 50 to 56 when parameter p changes from 10 to 12. What is the finite-difference sensitivity Δy/Δp?', zh: '参数 p 从 10 变到 12 时，输出 y 从 50 变到 56。有限差分敏感度 Δy/Δp 是多少？' }, { en: ['2', '3', '6', '12'], zh: ['2', '3', '6', '12'] }, 1, { en: '(56−50)/(12−10)=3.', zh: '(56−50)/(12−10)=3。' }),
      question(`${id}-5`, { en: 'Select all assumptions that should be treated as high risk in a queue model.', zh: '在排队模型中，选择所有应被视为高风险的假设。' }, { en: ['An assumption strongly changes the decision when perturbed', 'An assumption lacks supporting data', 'An assumption only changes the third decimal place', 'An assumption contradicts observed peak behavior'], zh: ['稍微扰动就会明显改变决策', '缺少数据支持', '只会改变结果第三位小数', '与观测到的高峰行为矛盾'] }, [0, 1, 3], { en: 'Risk comes from decision impact, weak evidence, or contradiction—not merely from being an assumption.', zh: '假设风险来自对决策的影响、证据不足或与事实冲突，而不是因为它只是一个假设。' }),
    ],
    [
      question(`${id}-1`, { en: 'Why build a baseline before adding a complex mechanism?', zh: '为什么应先建立基线模型，再增加复杂机制？' }, { en: ['A baseline is always the final model', 'It provides a checkable reference for measuring whether complexity adds value', 'Complex models cannot use data', 'A baseline removes the need for validation'], zh: ['基线模型永远就是最终模型', '基线提供可核验的参照，用于判断复杂度是否真正带来价值', '复杂模型不能使用数据', '有了基线就不再需要验证'] }, 1, { en: 'Without a baseline, improvement and failure are difficult to attribute.', zh: '没有基线，就很难判断改进来自哪里，也很难定位失败原因。' }),
      question(`${id}-2`, { en: 'Baseline RMSE is 12 and an extended model has RMSE 9. What is the relative reduction?', zh: '基线模型 RMSE 为 12，扩展模型 RMSE 为 9。相对降幅是多少？' }, { en: ['3%', '20%', '25%', '33%'], zh: ['3%', '20%', '25%', '33%'] }, 2, { en: '(12−9)/12=25%.', zh: '(12−9)/12=25%。' }),
      question(`${id}-3`, { en: 'An extension adds 20 parameters, lowers training error, but worsens held-out error. What is the best diagnosis?', zh: '扩展模型增加 20 个参数，训练误差下降，但留出集误差上升。最合理的诊断是什么？' }, { en: ['Guaranteed improvement', 'Likely overfitting', 'A unit conversion', 'Proof that validation is unnecessary'], zh: ['一定得到了改进', '很可能过拟合', '发生了单位换算', '证明不需要验证'] }, 1, { en: 'The extension fits training idiosyncrasies that do not transfer.', zh: '扩展部分很可能拟合了训练数据中的偶然特征，无法推广。' }),
      question(`${id}-4`, { en: 'Model A predicts a constant mean. Model B adds a rush-hour indicator. Which comparison isolates the value of the new mechanism?', zh: '模型 A 只预测常数均值，模型 B 加入高峰时段指示变量。哪种比较最能隔离新机制的价值？' }, { en: ['Evaluate both on the same held-out periods with the same metric', 'Train them on different cities', 'Use a different metric for each', 'Compare only parameter counts'], zh: ['在相同留出时段、使用同一指标评估两者', '分别在不同城市训练', '每个模型使用不同指标', '只比较参数数量'] }, 0, { en: 'A controlled comparison changes the mechanism while holding evaluation conditions fixed.', zh: '受控比较只改变待检验的机制，同时保持评估条件一致。' }),
      question(`${id}-5`, { en: 'Select all valid reasons to retain an extension.', zh: '选择所有保留模型扩展的合理理由。' }, { en: ['It improves out-of-sample decisions materially', 'It repairs a known physical or logical violation', 'It makes the equation longer', 'Its benefit remains under sensitivity checks'], zh: ['显著改善样本外决策', '修复已知的物理或逻辑错误', '让公式变得更长', '在敏感性检验下仍保持收益'] }, [0, 1, 3], { en: 'Useful complexity must improve evidence, mechanism, or decision robustness.', zh: '有价值的复杂度应改善证据、机制正确性或决策稳健性。' }),
    ],
    [
      question(`${id}-1`, { en: 'Residuals on four held-out cases are −2, 1, 3, and −2. What is the mean error?', zh: '四个留出样本的残差为 −2、1、3、−2。平均误差是多少？' }, { en: ['−0.5', '0', '1', '2'], zh: ['−0.5', '0', '1', '2'] }, 1, { en: '(−2+1+3−2)/4=0.', zh: '(−2+1+3−2)/4=0。' }),
      question(`${id}-2`, { en: 'For residuals 1, −2, and 2, what is RMSE?', zh: '残差为 1、−2、2 时，RMSE 是多少？' }, { en: ['√2', '√3', '5/3', '3'], zh: ['√2', '√3', '5/3', '3'] }, 1, { en: 'RMSE=√((1²+2²+2²)/3)=√3.', zh: 'RMSE=√((1²+2²+2²)/3)=√3。' }),
      question(`${id}-3`, { en: 'Which validation design tests temporal generalization without leaking future information?', zh: '哪种验证设计可以检验时间泛化能力，同时避免未来信息泄漏？' }, { en: ['Randomly shuffle all dates', 'Train on earlier periods and test on later periods', 'Fit and test on the full series', 'Choose the best test period after seeing results'], zh: ['随机打乱所有日期', '使用早期数据训练、后期数据测试', '在完整序列上同时训练和测试', '看完结果后再挑最好看的测试期'] }, 1, { en: 'The split respects the information that would have been available at prediction time.', zh: '这种划分符合真实预测时能够获得的信息顺序。' }),
      question(`${id}-4`, { en: 'A 90% prediction interval covers only 55% of held-out observations. What does this indicate?', zh: '一个标称 90% 的预测区间只覆盖了 55% 的留出观测。说明什么？' }, { en: ['The interval is too wide', 'The uncertainty is underestimated', 'The point predictions are necessarily unbiased', 'The sample size must be one'], zh: ['区间太宽', '模型低估了不确定性', '点预测一定无偏', '样本量一定为 1'] }, 1, { en: 'Observed coverage far below nominal coverage means the intervals are overconfident.', zh: '实际覆盖率远低于标称覆盖率，说明区间过于自信。' }),
      question(`${id}-5`, { en: 'Select all independent layers of validation.', zh: '选择所有彼此不同但都重要的验证层次。' }, { en: ['Check equations and units', 'Compare predictions with held-out observations', 'Test decision stability under perturbations', 'Count the number of pages'], zh: ['检查方程与单位', '与留出观测比较', '扰动输入并检验决策稳定性', '统计报告页数'] }, [0, 1, 2], { en: 'Verification, empirical validation, and robustness answer different failure questions.', zh: '公式核验、经验验证与稳健性检验分别针对不同类型的失败。' }),
    ],
    [
      question(`${id}-1`, { en: 'A dining hall has two parallel counters serving 18 meals/minute each. Demand is 30 meals/minute. What is the nominal spare capacity?', zh: '食堂有两个并行窗口，每个每分钟服务 18 份餐，需求为每分钟 30 份。名义剩余能力是多少？' }, { en: ['−6 meals/min', '0 meals/min', '6 meals/min', '36 meals/min'], zh: ['−6 份/分钟', '0 份/分钟', '6 份/分钟', '36 份/分钟'] }, 2, { en: 'Total capacity is 36, so spare capacity is 36−30=6 meals/minute.', zh: '总能力为 36，因此剩余能力为 36−30=6 份/分钟。' }),
      question(`${id}-2`, { en: 'Demand is 34/min and capacity is 36/min. What is utilization?', zh: '需求为 34 份/分钟，能力为 36 份/分钟。利用率是多少？' }, { en: ['0.06', '0.50', '0.94', '1.06'], zh: ['0.06', '0.50', '0.94', '1.06'] }, 2, { en: 'Utilization is 34/36≈0.94.', zh: '利用率为 34/36≈0.94。' }),
      question(`${id}-3`, { en: 'Why can a system with utilization below 1 still experience long queues?', zh: '为什么利用率低于 1 的系统仍可能出现长队？' }, { en: ['Variability and short bursts can temporarily exceed service capacity', 'Queues require utilization above 2', 'Averages determine every minute exactly', 'Service capacity has no effect'], zh: ['随机波动和短时峰值可能暂时超过服务能力', '只有利用率超过 2 才会排队', '平均值会精确决定每一分钟', '服务能力对排队没有影响'] }, 0, { en: 'Average stability does not remove burstiness or waiting caused by variability.', zh: '平均意义上的稳定并不能消除波动和短时拥堵造成的等待。' }),
      question(`${id}-4`, { en: 'If λ<μ in a simple single-server queue, how does utilization ρ=λ/μ change as μ increases with λ fixed?', zh: '在简单单服务台队列中 λ<μ。保持 λ 不变并提高 μ 时，利用率 ρ=λ/μ 如何变化？' }, { en: ['It increases linearly', 'It decreases', 'It remains one', 'It becomes negative'], zh: ['线性增加', '下降', '保持为 1', '变成负数'] }, 1, { en: 'The denominator increases while the numerator is fixed.', zh: '分母增加而分子不变，因此利用率下降。' }),
      question(`${id}-5`, { en: 'Select all quantities worth stress-testing before recommending that one counter be closed.', zh: '在建议关闭一个窗口前，选择所有值得做压力测试的量。' }, { en: ['Peak arrival rate', 'Service-time variability', 'Counter downtime', 'The font used on the menu'], zh: ['高峰到达率', '服务时间波动', '窗口故障停机', '菜单字体'] }, [0, 1, 2], { en: 'Each selected quantity can materially change capacity or queue risk.', zh: '这三项都会实质改变服务能力或排队风险。' }),
    ],
    [
      question(`${id}-1`, { en: 'A study room has 80 seats. Observed occupancies are 62, 75, 84, and 78. In how many periods is the hard capacity violated?', zh: '自习室有 80 个座位，四个时段观测占用人数为 62、75、84、78。多少个时段违反硬容量约束？' }, { en: ['0', '1', '2', '4'], zh: ['0', '1', '2', '4'] }, 1, { en: 'Only the period with 84 occupants exceeds 80.', zh: '只有占用人数为 84 的时段超过容量 80。' }),
      question(`${id}-2`, { en: 'Demand is 100 students and capacity is 80 seats. If seats are allocated proportionally and every student has equal claim, what fraction can be served?', zh: '需求为 100 人，容量为 80 个座位。若所有人权利相同并按比例分配，可服务的比例是多少？' }, { en: ['20%', '50%', '80%', '125%'], zh: ['20%', '50%', '80%', '125%'] }, 2, { en: '80/100=0.8=80%.', zh: '80/100=0.8=80%。' }),
      question(`${id}-3`, { en: 'Which objective best represents fairness across four student groups?', zh: '哪种目标最能表示四个学生群体之间的公平性？' }, { en: ['Minimize the maximum unmet-demand fraction among groups', 'Maximize only the largest group’s allocation', 'Ignore group identities and report total seats', 'Minimize the number of variables'], zh: ['最小化各群体未满足需求比例的最大值', '只最大化最大群体的分配量', '忽略群体差异，只报告总座位数', '最小化变量数量'] }, 0, { en: 'A minimax shortfall objective prevents one group from absorbing a disproportionate burden.', zh: '最小化最大缺口可以防止某一群体承担不成比例的损失。' }),
      question(`${id}-4`, { en: 'Opening an overflow room adds 25 seats but costs 200 dollars. If shortage costs 12 dollars per student and expected shortage without it is 20 students, which option has lower modeled cost?', zh: '开放备用教室可增加 25 个座位，成本 200 美元；若不开启，预计有 20 名学生无座，每人短缺成本为 12 美元。按此模型哪种方案成本更低？' }, { en: ['Open the room: 200 dollars', 'Do not open: 200 dollars', 'Do not open: 240 dollars', 'The two options cost 440 dollars each'], zh: ['开放：成本 200 美元', '不开放：成本 200 美元', '不开放：成本 240 美元', '两种方案成本都为 440 美元'] }, 0, { en: 'Not opening costs 20×12=240 dollars, so opening at 200 dollars is cheaper.', zh: '不开启的成本为 20×12=240 美元，因此支付 200 美元开放备用教室更便宜。' }),
      question(`${id}-5`, { en: 'Select all evidence needed before deploying a reservation policy.', zh: '在实施预约政策之前，选择所有需要收集的证据。' }, { en: ['No-show rate', 'Arrival-time distribution', 'Seat-use duration', 'The developer’s favorite color'], zh: ['爽约率', '到达时间分布', '座位使用时长', '开发者最喜欢的颜色'] }, [0, 1, 2], { en: 'These quantities determine effective capacity, congestion, and whether reservation rules improve access.', zh: '这些量决定有效容量、拥堵程度以及预约规则是否改善使用体验。' }),
    ],
  ]

  return chapters[chapterIndex] ?? chapters[chapterIndex % chapters.length]
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

function domainChapterQuiz(
  lessonNumber: number,
  chapterIndex: number,
  chapterTitle: string,
) {
  if (lessonNumber === 1) return foundationsChapterQuiz(chapterIndex)

  const builder = builders[lessonNumber] ?? generalQuestions
  const focus = mathFocus(lessonNumber, chapterTitle)
  const order = focus === null
    ? [0, 1, 2, 3, 4]
    : [focus, (focus + 1) % 5, (focus + 2) % 5, (focus + 3) % 5, (focus + 4) % 5]

  return order.map((questionIndex, variant) => {
    const seed = chapterIndex * 5 + variant + 1
    const id = `lesson-${lessonNumber}-chapter-${chapterIndex + 1}-question-${variant + 1}`
    return builder(seed, id)[questionIndex]
  })
}

export function buildChapterQuiz(
  lessonNumber: number,
  chapterIndex: number,
  chapterTitle?: string,
) {
  if (chapterTitle) return domainChapterQuiz(lessonNumber, chapterIndex, chapterTitle)

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
  return [0, 1, 2, 3, 4, 5].flatMap((variant) =>
    (builders[lessonNumber] ?? generalQuestions)(variant + 1, `lesson-${lessonNumber}-final-${variant + 1}`)
  )
}
