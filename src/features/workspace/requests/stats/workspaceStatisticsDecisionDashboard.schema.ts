import { z } from 'zod';

const rangeSchema = z.enum(['24h', '7d', '30d', '90d']);
const toneSchema = z.enum(['positive', 'neutral', 'warning']);

const selectedFilterSchema = z.object({
  value: z.string().nullable(),
  label: z.string(),
});

const filterOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
});

const contextHealthSchema = z.object({
  key: z.enum(['demand', 'competition', 'activity']),
  value: z.enum(['rising', 'stable', 'limited', 'high', 'balanced', 'low']),
  tone: toneSchema,
});

const cityDemandSchema = z.object({
  citySlug: z.string(),
  cityName: z.string(),
  cityId: z.string().nullable(),
  requestCount: z.number(),
  auftragSuchenCount: z.number().nullable().optional(),
  anbieterSuchenCount: z.number().nullable().optional(),
  marketBalanceRatio: z.number().nullable().optional(),
  signal: z.enum(['high', 'medium', 'low', 'none']).optional(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});

const categoryDemandSchema = z.object({
  categoryKey: z.string().nullable(),
  categoryName: z.string(),
  requestCount: z.number(),
  sharePercent: z.number(),
});

const opportunitySchema = z.object({
  rank: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  cityId: z.string().nullable(),
  city: z.string(),
  categoryKey: z.string().nullable(),
  category: z.string().nullable(),
  demand: z.number(),
  providers: z.number().nullable(),
  marketBalanceRatio: z.number().nullable(),
  score: z.number(),
  demandScore: z.number(),
  competitionScore: z.number(),
  growthScore: z.number(),
  activityScore: z.number(),
  status: z.enum(['very_high', 'good', 'balanced', 'competitive', 'low']),
  tone: z.enum(['very-high', 'high', 'balanced', 'supply-heavy']),
  summaryKey: z.enum(['very_high', 'good', 'balanced_competitive', 'balanced', 'competitive', 'low_demand', 'low']),
  metrics: z.array(z.object({
    key: z.enum(['demand', 'competition', 'growth', 'activity']),
    value: z.number(),
    semanticTone: z.enum(['very-high', 'high', 'medium', 'low']),
    semanticKey: z.enum(['very_high', 'high', 'noticeable', 'medium', 'low']),
  })),
  peerContext: z.object({
    role: z.enum(['focus', 'competitor']),
    distanceKm: z.number().nullable(),
    reason: z.enum(['selected_city', 'nearby_competitor', 'top_ranked']),
  }).nullable().optional(),
  priceIntelligence: z.object({
    citySlug: z.string().nullable(),
    city: z.string().nullable(),
    categoryKey: z.string().nullable(),
    category: z.string().nullable(),
    recommendedMin: z.number().nullable(),
    recommendedMax: z.number().nullable(),
    marketAverage: z.number().nullable(),
    optimalMin: z.number().nullable(),
    optimalMax: z.number().nullable(),
    smartRecommendedPrice: z.number().nullable(),
    smartSignalTone: z.enum(['visibility', 'balanced', 'premium']).nullable(),
    analyzedRequestsCount: z.number().nullable(),
    confidenceLevel: z.enum(['high', 'medium', 'low']).nullable(),
    recommendation: z.string().nullable(),
    profitPotentialScore: z.number().nullable(),
    profitPotentialStatus: z.enum(['high', 'medium', 'low']).nullable(),
  }).nullable().optional(),
});

const userComparisonMetricSchema = z.object({
  key: z.enum(['offer_rate', 'response_time', 'unanswered']),
  unit: z.enum(['percent', 'minutes', 'count']),
  userValue: z.number().nullable(),
  marketValue: z.number().nullable(),
  direction: z.enum(['up', 'down', 'flat']),
  tone: toneSchema,
  status: z.enum(['high', 'medium', 'low']).nullable(),
});

const userFormulaMetricSchema = z.object({
  key: z.enum([
    'offer_rate',
    'response_rate',
    'conversion_rate',
    'completion_rate',
    'cancellation_rate',
    'avg_response_time',
    'revenue',
    'avg_order_value',
  ]),
  formula: z.enum([
    'offers / requests',
    'responses / offers',
    'contracts / requests',
    'completed / contracts',
    'cancellations / contracts',
    'sum(response_time) / responses',
    'sum(order_price * platform_fee)',
    'total_revenue / completed_orders',
  ]),
  unit: z.enum(['percent', 'minutes', 'currency']),
  userValue: z.number().nullable(),
  marketValue: z.number().nullable(),
  gap: z.number().nullable(),
  direction: z.enum(['up', 'down', 'flat']),
  tone: toneSchema,
});

const userSignalSchema = z.object({
  id: z.string(),
  type: z.enum(['risk', 'opportunity', 'performance', 'growth']),
  code: z.enum([
    'high_unanswered',
    'slow_response',
    'overpriced',
    'underpriced',
    'high_demand_city',
    'growing_category',
    'low_visibility',
    'strong_position',
    'low_competition_segment',
    'price_above_market',
    'price_below_market',
  ]),
  severity: z.enum(['high', 'medium', 'low']),
  metricKey: z.enum([
    'offer_rate',
    'response_rate',
    'conversion_rate',
    'completion_rate',
    'cancellation_rate',
    'avg_response_time',
    'revenue',
    'avg_order_value',
    'response_time',
    'unanswered',
  ]).nullable().optional(),
  actionCode: z.enum([
    'respond_faster',
    'adjust_price',
    'focus_market',
    'complete_profile',
    'follow_up_unanswered',
    'follow_up_requests',
  ]).nullable().optional(),
});

const funnelStageStatusSchema = z.enum([
  'good',
  'warning',
  'critical',
  'neutral',
  'at_market',
  'above_market',
  'below_market',
  'insufficient_data',
]);

const userPerformancePositionSchema = z.object({
  percentile: z.number().nullable(),
  categoryPercentile: z.number().nullable(),
  cityPercentile: z.number().nullable(),
  bucket: z.enum(['top', 'average', 'below']),
  categoryLabel: z.string().nullable().optional(),
  cityLabel: z.string().nullable().optional(),
});

const userProfileGapSchema = z.object({
  fromStage: z.literal('offers'),
  toStage: z.literal('confirmations'),
  lossPercent: z.number().nullable(),
  lostCount: z.number().nullable(),
  tone: toneSchema,
});

const userPriorityItemSchema = z.object({
  id: z.string(),
  code: z.enum([
    'slow_response',
    'high_unanswered',
    'low_visibility',
    'high_demand_city',
    'growing_category',
    'low_competition_segment',
    'price_above_market',
    'price_below_market',
    'strong_position',
  ]),
  severity: z.enum(['high', 'medium', 'low']),
  cityLabel: z.string().nullable().optional(),
  categoryLabel: z.string().nullable().optional(),
  value: z.number().nullable().optional(),
  secondaryValue: z.number().nullable().optional(),
});

const userPricingSchema = z.object({
  currentPrice: z.number().nullable(),
  recommendedMin: z.number().nullable(),
  recommendedMax: z.number().nullable(),
  marketAverage: z.number().nullable(),
  status: z.enum(['below', 'within', 'above', 'unknown']),
  conversionImpact: toneSchema,
});

const userActionStepSchema = z.object({
  id: z.string(),
  code: z.enum([
    'respond_faster',
    'adjust_price',
    'focus_market',
    'complete_profile',
    'follow_up_unanswered',
    'follow_up_requests',
  ]),
  priority: z.enum(['high', 'medium', 'low']),
  targetValue: z.number().nullable().optional(),
  cityLabel: z.string().nullable().optional(),
  categoryLabel: z.string().nullable().optional(),
});

const decisionLayerMetricSchema = z.object({
  id: z.enum(['offer_rate', 'avg_response_time', 'unanswered_over_24h', 'completed_jobs', 'revenue', 'average_order_value']),
  label: z.string(),
  marketValue: z.number().nullable(),
  userValue: z.number().nullable(),
  gapAbsolute: z.number().nullable(),
  gapPercent: z.number().nullable(),
  unit: z.enum(['percent', 'minutes', 'currency', 'count']),
  direction: z.enum(['better', 'worse', 'neutral']),
  status: funnelStageStatusSchema,
  signalCodes: z.array(z.string()),
  primaryActionCode: userActionStepSchema.shape.code.nullable(),
  summary: z.string().nullable(),
});

const personalizedPricingSchema = z.object({
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  contextLabel: z.string().nullable(),
  marketAverage: z.number().nullable(),
  recommendedMin: z.number().nullable(),
  recommendedMax: z.number().nullable(),
  userPrice: z.number().nullable(),
  gapAbsolute: z.number().nullable(),
  comparisonReliability: z.enum(['high', 'medium', 'low', 'unavailable']),
  position: z.enum(['below', 'within', 'above', 'unknown']),
  effect: toneSchema,
  actionCode: userActionStepSchema.shape.code.nullable(),
  summary: z.string().nullable(),
});

const categoryFitItemSchema = z.object({
  categoryKey: z.string().nullable(),
  label: z.string(),
  marketDemandShare: z.number().nullable(),
  reliability: z.enum(['high', 'medium', 'low', 'unknown']),
  userFit: z.enum(['high', 'medium', 'low', 'unknown']),
  opportunity: z.enum(['high', 'medium', 'low', 'unknown']),
  actionCode: userActionStepSchema.shape.code.nullable(),
  summary: z.string().nullable(),
});

const cityComparisonItemSchema = z.object({
  cityId: z.string().nullable(),
  city: z.string(),
  marketRequests: z.number().nullable(),
  reliability: z.enum(['high', 'medium', 'low', 'unknown']),
  userActivity: z.enum(['high', 'medium', 'low', 'unknown']),
  userConversion: z.number().nullable(),
  actionCode: userActionStepSchema.shape.code.nullable(),
  recommendation: z.string().nullable(),
});

const activityComparisonPointSchema = z.object({
  timestamp: z.string(),
  clientActivity: z.number().nullable(),
  providerActivity: z.number().nullable(),
});

const recommendationItemSchema = z.object({
  code: z.string(),
  type: z.enum(['risk', 'opportunity', 'performance', 'growth', 'promotion', 'demand']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  confidence: z.number(),
  reliability: z.enum(['high', 'medium', 'low']),
  context: z.string().nullable(),
  actionCode: z.string().nullable(),
  action: z.object({
    code: z.string(),
    label: z.string(),
    target: z.string().nullable(),
  }).nullable(),
});

const recommendationSectionSchema = z.object({
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  hasReliableItems: z.boolean(),
  items: z.array(recommendationItemSchema),
});

const funnelComparisonStageSchema = z.object({
  key: z.enum(['requests', 'offers', 'responses', 'contracts', 'completed']),
  label: z.string(),
  marketCount: z.number().nullable(),
  userCount: z.number().nullable(),
  marketRateFromPrev: z.number().nullable(),
  userRateFromPrev: z.number().nullable(),
  gapRate: z.number().nullable(),
  status: funnelStageStatusSchema,
  dropOffSeverity: z.enum(['low', 'medium', 'high', 'critical']).nullable().optional(),
  recommendation: z.string().nullable(),
});

export const workspaceStatisticsDecisionDashboardSchema = z.object({
  __source: z.enum(['bff', 'fallback']),
  updatedAt: z.string(),
  mode: z.enum(['platform', 'personalized']),
  range: rangeSchema,
  viewerMode: z.enum(['provider', 'customer']).nullable().optional(),
  decisionContext: z.object({
    mode: z.enum(['global', 'focus']),
    period: rangeSchema,
    city: selectedFilterSchema,
    region: selectedFilterSchema.nullable().optional(),
    category: selectedFilterSchema,
    service: selectedFilterSchema.nullable().optional(),
    scopeLabel: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    stickyLabel: z.string().nullable().optional(),
    health: z.array(contextHealthSchema),
    lowData: z.object({
      isLowData: z.boolean(),
      title: z.string().nullable().optional(),
      body: z.string().nullable().optional(),
    }).optional(),
  }),
  filterOptions: z.object({
    cities: z.array(filterOptionSchema),
    categories: z.array(filterOptionSchema),
    services: z.array(filterOptionSchema),
  }),
  sectionMeta: z.object({
    decisionSubtitle: z.string().nullable().optional(),
    demandSubtitle: z.string().nullable().optional(),
    citiesSubtitle: z.string().nullable().optional(),
    opportunityTitle: z.string().nullable().optional(),
    priceTitle: z.string().nullable().optional(),
    insightsSubtitle: z.string().nullable().optional(),
    growthSubtitle: z.string().nullable().optional(),
  }),
  exportMeta: z.object({
    filename: z.string().nullable().optional(),
  }),
  summary: z.object({
    totalPublishedRequests: z.number(),
    totalActiveProviders: z.number(),
    totalActiveCities: z.number(),
    platformRatingAvg: z.number(),
    platformRatingCount: z.number(),
  }),
  kpis: z.object({
    requestsTotal: z.number(),
    offersTotal: z.number(),
    completedJobsTotal: z.number(),
    successRate: z.number(),
    avgResponseMinutes: z.number().nullable(),
    profileCompleteness: z.number().nullable(),
    openRequests: z.number().nullable(),
    recentOffers7d: z.number().nullable(),
  }),
  demand: z.object({
    categories: z.array(categoryDemandSchema),
    cities: z.array(cityDemandSchema),
  }),
  opportunityRadar: z.array(opportunitySchema),
  profileFunnel: z.object({
    periodLabel: z.string(),
    stages: z.array(z.object({
      id: z.enum(['requests', 'offers', 'confirmations', 'contracts', 'completed', 'revenue']),
      label: z.string(),
      value: z.number(),
      displayValue: z.string(),
      widthPercent: z.number(),
      rateLabel: z.string().nullable(),
      ratePercent: z.number().nullable(),
      helperText: z.string().nullable(),
    })),
    summaryText: z.string(),
    totalConversionPercent: z.number(),
    conversionRate: z.number(),
    profitAmount: z.number(),
  }).passthrough(),
  insights: z.array(z.object({
    code: z.string(),
    level: z.enum(['info', 'trend', 'warning']),
    context: z.string().nullable(),
  }).passthrough()),
  growthCards: z.array(z.object({
    key: z.string(),
    href: z.string(),
    title: z.string().optional(),
    body: z.string().optional(),
    benefit: z.string().optional(),
    tone: z.enum(['primary', 'default']).optional(),
    badge: z.string().optional(),
    recommendedFor: z.string().optional(),
  })),
  activity: z.object({
    range: rangeSchema,
    interval: z.enum(['hour', 'day']),
    points: z.array(z.object({
      timestamp: z.string(),
      requests: z.number(),
      offers: z.number(),
    })),
    totals: z.object({
      requestsTotal: z.number(),
      offersTotal: z.number(),
      latestRequests: z.number(),
      latestOffers: z.number(),
      previousRequests: z.number(),
      previousOffers: z.number(),
      peakTimestamp: z.string().nullable(),
      bestWindowTimestamp: z.string().nullable(),
    }),
    metrics: z.object({
      offerRatePercent: z.number(),
      responseMedianMinutes: z.number().nullable(),
      unansweredRequests24h: z.number(),
      cancellationRatePercent: z.number(),
      completedJobs: z.number(),
      gmvAmount: z.number(),
      platformRevenueAmount: z.number(),
      takeRatePercent: z.number(),
      offerRateTone: toneSchema,
      responseMedianTone: toneSchema,
      unansweredTone: toneSchema,
      cancellationTone: toneSchema,
      completedTone: toneSchema,
      revenueTone: toneSchema,
    }),
  }),
  priceIntelligence: z.object({
    citySlug: z.string().nullable(),
    city: z.string().nullable(),
    categoryKey: z.string().nullable(),
    category: z.string().nullable(),
    recommendedMin: z.number().nullable(),
    recommendedMax: z.number().nullable(),
    marketAverage: z.number().nullable(),
    optimalMin: z.number().nullable(),
    optimalMax: z.number().nullable(),
    smartRecommendedPrice: z.number().nullable(),
    smartSignalTone: z.enum(['visibility', 'balanced', 'premium']).nullable(),
    analyzedRequestsCount: z.number().nullable(),
    confidenceLevel: z.enum(['high', 'medium', 'low']).nullable(),
    recommendation: z.string().nullable(),
    profitPotentialScore: z.number().nullable(),
    profitPotentialStatus: z.enum(['high', 'medium', 'low']).nullable(),
  }).optional(),
  decisionInsight: z.string().nullable().optional(),
  decisionLayer: z.object({
    title: z.string().nullable(),
    subtitle: z.string().nullable(),
    metrics: z.array(decisionLayerMetricSchema),
    primaryInsight: z.string().nullable(),
    primaryAction: z.object({
      code: userActionStepSchema.shape.code,
      label: z.string(),
      target: z.string().nullable(),
    }).nullable(),
  }).nullable().optional(),
  personalizedPricing: personalizedPricingSchema.nullable().optional(),
  categoryFit: z.object({
    title: z.string().nullable(),
    subtitle: z.string().nullable(),
    hasReliableItems: z.boolean(),
    items: z.array(categoryFitItemSchema),
  }).nullable().optional(),
  cityComparison: z.object({
    title: z.string().nullable(),
    subtitle: z.string().nullable(),
    hasReliableItems: z.boolean(),
    items: z.array(cityComparisonItemSchema),
  }).nullable().optional(),
  risks: recommendationSectionSchema.nullable().optional(),
  opportunities: recommendationSectionSchema.nullable().optional(),
  nextSteps: recommendationSectionSchema.nullable().optional(),
  activityComparison: z.object({
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    peakTimestamp: z.string().nullable().optional(),
    bestWindowTimestamp: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
    hasReliableSeries: z.boolean(),
    points: z.array(activityComparisonPointSchema),
  }).nullable().optional(),
  funnelComparison: z.object({
    comparisonLabel: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    largestGapStage: z.enum(['requests', 'offers', 'responses', 'contracts', 'completed']).nullable(),
    largestDropOffStage: z.enum(['requests', 'offers', 'responses', 'contracts', 'completed']).nullable(),
    primaryBottleneck: z.string().nullable(),
    nextAction: z.string().nullable(),
    stages: z.array(funnelComparisonStageSchema),
  }).nullable().optional(),
  userIntelligence: z.object({
    comparisonLabel: z.string().nullable().optional(),
    formulaMetrics: z.array(userFormulaMetricSchema),
    decisionMetrics: z.array(userComparisonMetricSchema),
    signals: z.array(userSignalSchema),
    performancePosition: userPerformancePositionSchema,
    profileGap: userProfileGapSchema.nullable(),
    risks: z.array(userPriorityItemSchema),
    opportunities: z.array(userPriorityItemSchema),
    pricing: userPricingSchema.nullable(),
    nextSteps: z.array(userActionStepSchema),
  }).nullable().optional(),
});

export type WorkspaceStatisticsDecisionDashboardSchema = z.infer<typeof workspaceStatisticsDecisionDashboardSchema>;
