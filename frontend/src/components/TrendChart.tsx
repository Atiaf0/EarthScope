import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { AnnualRecord, Metric } from "../types/analysis";

interface TrendChartProps {
  records: AnnualRecord[];
  metric: Metric;
}

export function TrendChart({ records, metric }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const valueKey = metric === "temperature"
      ? "annualMeanTemperatureDegC"
      : "annualTotalPrecipitationMm";
    const unit = metric === "temperature" ? "°C" : "mm";
    const colors = { Jazan: "#f4a261", Riyadh: "#72b7d1" };
    const option: echarts.EChartsOption = {
      animationDuration: 700,
      backgroundColor: "transparent",
      grid: { top: 24, right: 24, bottom: 34, left: 52 },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#102135",
        borderColor: "#28435b",
        textStyle: { color: "#eaf2f8" },
        valueFormatter: (value) => `${Number(value).toFixed(2)} ${unit}`,
      },
      legend: { top: 0, right: 0, textStyle: { color: "#9bb0c2" } },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [...new Set(records.map((record) => record.year))],
        axisLabel: { color: "#71879a" },
        axisLine: { lineStyle: { color: "#294155" } },
      },
      yAxis: {
        type: "value",
        name: unit,
        nameTextStyle: { color: "#71879a" },
        axisLabel: { color: "#71879a" },
        splitLine: { lineStyle: { color: "#1d3144" } },
      },
      series: (["Jazan", "Riyadh"] as const).map((region) => ({
        name: region,
        type: "line",
        smooth: 0.18,
        showSymbol: false,
        lineStyle: { width: 2, color: colors[region] },
        itemStyle: { color: colors[region] },
        data: records.filter((record) => record.region === region).map((record) => record[valueKey]),
      })),
    };
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [metric, records]);
  return <div ref={chartRef} className="trend-chart" role="img" aria-label={`${metric} annual comparison chart`} />;
}
