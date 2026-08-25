export interface CalibrationBucket {
  predicted: number;
  observed: number;
  count: number;
}

export interface ScorecardMetric {
  label: string;
  value: string;
  meta: string;
}

export interface AnalyticsData {
  scorecard: ScorecardMetric[];
  calibration: CalibrationBucket[];
  returnHistogram: { bucket: string; count: number }[];
  underwater: number[];
  underwaterLabels: string[];
}

export const analyticsMock: AnalyticsData = {
  scorecard: [],
  calibration: [],
  returnHistogram: [],
  underwater: [],
  underwaterLabels: [],
};
