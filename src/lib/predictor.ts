import { BookingInput, PredictionResult } from '@/types';
import forestModelData from '@/data/forest_model.json';

interface TreeNode {
  left: number[];
  right: number[];
  feature: number[];
  threshold: number[];
  prob: number[];
}

interface ForestModel {
  num_features: string[];
  cat_features: string[];
  categories: string[][];
  trees: TreeNode[];
}

const model = forestModelData as ForestModel;

export function predictCancellation(input: BookingInput): PredictionResult {
  const inputRecord = input as unknown as Record<string, unknown>;

  // 1. Build numerical features
  const features: number[] = [];
  for (const numCol of model.num_features) {
    const val = Number(inputRecord[numCol]) || 0;
    features.push(val);
  }

  // 2. Build one-hot encoded categorical features
  for (let i = 0; i < model.cat_features.length; i++) {
    const colName = model.cat_features[i];
    const userVal = String(inputRecord[colName] || '');
    const validCats = model.categories[i];

    for (const cat of validCats) {
      features.push(userVal === String(cat) ? 1.0 : 0.0);
    }
  }

  // 3. Traverse Random Forest Decision Trees
  const treeProbs: number[] = [];
  for (const tree of model.trees) {
    let node = 0;
    while (tree.left[node] !== -1) {
      const featIdx = tree.feature[node];
      const threshold = tree.threshold[node];
      if (features[featIdx] <= threshold) {
        node = tree.left[node];
      } else {
        node = tree.right[node];
      }
    }
    treeProbs.push(tree.prob[node]);
  }

  const rawProb = treeProbs.reduce((acc, p) => acc + p, 0) / treeProbs.length;
  // Format probability percentage (rounded to 1 decimal)
  const cancelProb = Math.min(Math.max(Math.round(rawProb * 1000) / 10, 0.5), 99.5);
  const confirmProb = Math.round((100 - cancelProb) * 10) / 10;
  const isCanceled = cancelProb >= 50 ? 1 : 0;
  const riskLevel = isCanceled === 1 ? 'HIGH RISK' : 'LOW RISK';

  // 4. Financial Calculations
  const totalNights = Math.max(1, (input.stays_in_weekend_nights || 0) + (input.stays_in_week_nights || 0));
  const estimatedRevenue = Math.round((input.adr || 0) * totalNights * 100) / 100;

  // 5. Dynamic Risk Drivers Analysis
  const riskFactors: { factor: string; impact: 'high' | 'medium' | 'low'; description: string }[] = [];

  if (input.deposit_type === 'Non Refund') {
    riskFactors.push({
      factor: 'Non-Refundable Deposit Pattern',
      impact: 'high',
      description: 'Historical records show strong correlation with corporate/third-party cancellations.',
    });
  } else if (input.deposit_type === 'No Deposit') {
    riskFactors.push({
      factor: 'Zero Financial Commitment',
      impact: 'medium',
      description: 'Guest has no deposit collateral, increasing propensity to no-show.',
    });
  }

  if (input.lead_time > 150) {
    riskFactors.push({
      factor: `Extreme Lead Time (${input.lead_time} days)`,
      impact: 'high',
      description: 'Bookings placed >5 months in advance experience over 60% cancellation rates.',
    });
  } else if (input.lead_time > 60) {
    riskFactors.push({
      factor: `Moderate Lead Time (${input.lead_time} days)`,
      impact: 'medium',
      description: 'Extended lead time allows schedule uncertainty and alternative options.',
    });
  }

  if (input.previous_cancellations > 0) {
    riskFactors.push({
      factor: `Prior Cancellation History (${input.previous_cancellations})`,
      impact: 'high',
      description: 'Guest has previously canceled reservations at this property.',
    });
  }

  if (input.total_of_special_requests === 0) {
    riskFactors.push({
      factor: 'No Special Requests',
      impact: 'medium',
      description: 'Guests without specific room/amenity preferences have lower engagement.',
    });
  }

  if (input.country === 'PRT') {
    riskFactors.push({
      factor: 'Domestic Market Dynamic (Portugal)',
      impact: 'low',
      description: 'Local travelers exhibit distinct flexibility and seasonal cancellation shifts.',
    });
  }

  if (input.adr > 180) {
    riskFactors.push({
      factor: `High Daily Room Rate ($${input.adr}/night)`,
      impact: 'low',
      description: 'Higher nightly price increases sensitivity to budget changes.',
    });
  }

  // 6. Actionable Managerial Recommendations
  const recommendations: string[] = [];
  if (isCanceled === 1) {
    recommendations.push('Require an advance credit card pre-authorization or 20% refundable deposit.');
    recommendations.push('Schedule an automated SMS / email reconfirmation 7 days and 48 hours prior to arrival.');
    recommendations.push('Offer an early check-in or complimentary breakfast perk in exchange for a guaranteed stay commitment.');
    recommendations.push('Maintain an active waitlist or overbooking threshold (+3%) for this room category.');
  } else {
    recommendations.push('Booking exhibits low cancellation risk; assign preferred room tier promptly.');
    recommendations.push('Send pre-arrival concierge welcome message with airport transfer or dining reservation options.');
    recommendations.push('Present relevant upsell opportunities (spa package, room view upgrade).');
  }

  return {
    prediction: isCanceled,
    risk_level: riskLevel,
    cancellation_probability: cancelProb,
    confirmation_probability: confirmProb,
    confidence_score: isCanceled ? cancelProb : confirmProb,
    estimated_revenue: estimatedRevenue,
    total_nights: totalNights,
    risk_factors: riskFactors,
    recommendations,
  };
}
