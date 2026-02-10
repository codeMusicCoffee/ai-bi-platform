
export enum ChartType {
  Bar = 'chart-bar',
  Line = 'chart-line',
  Pie = 'chart-pie',
  Ring = 'chart-ring',
  WordCloud = 'chart-wordcloud',
  Card = 'card',

}

export const ChartTypeLabels: Record<ChartType, string> = {
  [ChartType.Bar]: '柱状图',
  [ChartType.Line]: '折线图',
  [ChartType.Pie]: '饼图',
  [ChartType.Ring]: '环形图',
  [ChartType.WordCloud]: '词云图',
  [ChartType.Card]: '卡片',
};
