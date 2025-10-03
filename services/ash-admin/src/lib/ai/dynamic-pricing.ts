// Dynamic Pricing AI
// Uses machine learning to recommend optimal pricing based on multiple factors

interface PricingFactors {
  order_id?: string;
  client_id: string;
  product_type: string;
  quantity: number;
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'VERY_COMPLEX';
  material_cost: number;
  labor_hours_estimate: number;
  deadline_days: number;
  season?: 'PEAK' | 'NORMAL' | 'LOW';
  client_history?: {
    total_orders: number;
    total_revenue: number;
    average_margin: number;
    payment_reliability: number; // 0-100
  };
}

interface PricingRecommendation {
  recommended_price: number;
  minimum_price: number;
  optimal_price: number;
  maximum_price: number;
  confidence: number; // 0-100%
  margin_percentage: number;
  expected_profit: number;
  pricing_factors: Array<{
    factor: string;
    impact: 'INCREASE' | 'DECREASE' | 'NEUTRAL';
    weight: number;
    value: string;
  }>;
  recommendations: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  competitor_benchmark?: number;
}

interface MarketConditions {
  demand_level: 'LOW' | 'NORMAL' | 'HIGH' | 'VERY_HIGH';
  capacity_utilization: number; // 0-100%
  material_price_trend: 'FALLING' | 'STABLE' | 'RISING';
  competitor_avg_price?: number;
  seasonal_multiplier: number; // 0.8-1.5
}

export class DynamicPricingAI {
  // Base pricing constants (can be configured per workspace)
  private readonly BASE_LABOR_RATE = 500; // PHP per hour
  private readonly OVERHEAD_PERCENTAGE = 0.20; // 20% overhead
  private readonly TARGET_MARGIN = 0.30; // 30% target margin
  private readonly RUSH_FEE_MULTIPLIER = 1.15; // 15% rush fee

  // Calculate recommended pricing
  async calculatePricing(
    factors: PricingFactors,
    marketConditions: MarketConditions
  ): Promise<PricingRecommendation> {
    // 1. Calculate base cost
    const baseCost = this.calculateBaseCost(factors);

    // 2. Apply complexity multiplier
    const complexityMultiplier = this.getComplexityMultiplier(factors.complexity);

    // 3. Apply quantity discount
    const quantityAdjustment = this.getQuantityAdjustment(factors.quantity);

    // 4. Client relationship factor
    const clientFactor = this.getClientRelationshipFactor(factors.client_history);

    // 5. Market demand factor
    const demandFactor = this.getMarketDemandFactor(marketConditions);

    // 6. Urgency factor
    const urgencyFactor = this.getUrgencyFactor(factors.deadline_days);

    // 7. Seasonal factor
    const seasonalFactor = marketConditions.seasonal_multiplier;

    // Calculate recommended price
    const basePrice = baseCost / (1 - this.TARGET_MARGIN);
    const adjustedPrice =
      basePrice *
      complexityMultiplier *
      quantityAdjustment *
      clientFactor *
      demandFactor *
      urgencyFactor *
      seasonalFactor;

    // Calculate price range
    const minimumPrice = baseCost / (1 - 0.15); // 15% minimum margin
    const optimalPrice = adjustedPrice;
    const maximumPrice = adjustedPrice * 1.25; // 25% above recommended

    // Calculate margins
    const expectedProfit = optimalPrice - baseCost;
    const marginPercentage = (expectedProfit / optimalPrice) * 100;

    // Determine confidence based on data quality
    const confidence = this.calculateConfidence(factors, marketConditions);

    // Generate pricing factors analysis
    const pricingFactors = this.analyzePricingFactors(
      factors,
      marketConditions,
      {
        complexityMultiplier,
        quantityAdjustment,
        clientFactor,
        demandFactor,
        urgencyFactor,
        seasonalFactor,
      }
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      factors,
      marketConditions,
      optimalPrice,
      marginPercentage
    );

    // Assess risk level
    const riskLevel = this.assessPricingRisk(
      marginPercentage,
      factors.client_history,
      marketConditions
    );

    return {
      recommended_price: Math.round(adjustedPrice * 100) / 100,
      minimum_price: Math.round(minimumPrice * 100) / 100,
      optimal_price: Math.round(optimalPrice * 100) / 100,
      maximum_price: Math.round(maximumPrice * 100) / 100,
      confidence: Math.round(confidence),
      margin_percentage: Math.round(marginPercentage * 100) / 100,
      expected_profit: Math.round(expectedProfit * 100) / 100,
      pricing_factors: pricingFactors,
      recommendations,
      risk_level: riskLevel,
      competitor_benchmark: marketConditions.competitor_avg_price,
    };
  }

  // Calculate base cost from materials and labor
  private calculateBaseCost(factors: PricingFactors): number {
    const materialCost = factors.material_cost;
    const laborCost = factors.labor_hours_estimate * this.BASE_LABOR_RATE;
    const overhead = (materialCost + laborCost) * this.OVERHEAD_PERCENTAGE;

    return materialCost + laborCost + overhead;
  }

  // Get complexity multiplier
  private getComplexityMultiplier(complexity: PricingFactors['complexity']): number {
    const multipliers = {
      SIMPLE: 1.0,
      MODERATE: 1.15,
      COMPLEX: 1.35,
      VERY_COMPLEX: 1.60,
    };
    return multipliers[complexity];
  }

  // Get quantity adjustment (bulk discount)
  private getQuantityAdjustment(quantity: number): number {
    if (quantity >= 10000) return 0.85; // 15% bulk discount
    if (quantity >= 5000) return 0.90; // 10% discount
    if (quantity >= 1000) return 0.95; // 5% discount
    if (quantity >= 500) return 0.97; // 3% discount
    if (quantity < 100) return 1.05; // 5% small order fee
    return 1.0; // No adjustment
  }

  // Get client relationship factor
  private getClientRelationshipFactor(
    history?: PricingFactors['client_history']
  ): number {
    if (!history) return 1.0;

    let factor = 1.0;

    // Long-term client discount
    if (history.total_orders >= 50) {
      factor *= 0.92; // 8% loyalty discount
    } else if (history.total_orders >= 20) {
      factor *= 0.95; // 5% loyalty discount
    } else if (history.total_orders >= 10) {
      factor *= 0.97; // 3% loyalty discount
    }

    // Payment reliability adjustment
    if (history.payment_reliability < 70) {
      factor *= 1.10; // 10% risk premium for unreliable payers
    } else if (history.payment_reliability > 95) {
      factor *= 0.98; // 2% discount for reliable payers
    }

    // High-value client discount
    if (history.total_revenue >= 1000000) {
      factor *= 0.95; // 5% VIP discount
    }

    return factor;
  }

  // Get market demand factor
  private getMarketDemandFactor(market: MarketConditions): number {
    let factor = 1.0;

    // Demand level
    switch (market.demand_level) {
      case 'VERY_HIGH':
        factor *= 1.20; // Premium pricing when demand is high
        break;
      case 'HIGH':
        factor *= 1.10;
        break;
      case 'LOW':
        factor *= 0.95; // Discount to attract orders
        break;
      default:
        factor *= 1.0;
    }

    // Capacity utilization
    if (market.capacity_utilization > 90) {
      factor *= 1.15; // Premium when at capacity
    } else if (market.capacity_utilization < 50) {
      factor *= 0.90; // Discount to fill capacity
    }

    // Material price trends
    if (market.material_price_trend === 'RISING') {
      factor *= 1.08; // Pass through rising costs
    }

    return factor;
  }

  // Get urgency factor (rush orders)
  private getUrgencyFactor(deadlineDays: number): number {
    if (deadlineDays <= 3) return 1.30; // 30% rush fee
    if (deadlineDays <= 7) return 1.15; // 15% rush fee
    if (deadlineDays <= 14) return 1.05; // 5% rush fee
    if (deadlineDays >= 60) return 0.95; // 5% discount for flexible timeline
    return 1.0; // Standard timeline
  }

  // Calculate confidence score
  private calculateConfidence(
    factors: PricingFactors,
    market: MarketConditions
  ): number {
    let confidence = 100;

    // Reduce confidence if missing data
    if (!factors.client_history) confidence -= 15;
    if (!market.competitor_avg_price) confidence -= 10;
    if (factors.labor_hours_estimate === 0) confidence -= 20;
    if (factors.material_cost === 0) confidence -= 20;

    // Reduce confidence for very complex or unusual orders
    if (factors.complexity === 'VERY_COMPLEX') confidence -= 10;
    if (factors.quantity > 50000 || factors.quantity < 10) confidence -= 5;

    // Increase confidence if we have client history
    if (factors.client_history && factors.client_history.total_orders > 10) {
      confidence += 10;
    }

    return Math.max(Math.min(confidence, 100), 0);
  }

  // Analyze individual pricing factors
  private analyzePricingFactors(
    factors: PricingFactors,
    market: MarketConditions,
    multipliers: Record<string, number>
  ): PricingRecommendation['pricing_factors'] {
    const analysis: PricingRecommendation['pricing_factors'] = [];

    // Complexity
    if (multipliers.complexityMultiplier > 1.0) {
      analysis.push({
        factor: 'Product Complexity',
        impact: 'INCREASE',
        weight: (multipliers.complexityMultiplier - 1.0) * 100,
        value: factors.complexity,
      });
    }

    // Quantity
    if (multipliers.quantityAdjustment !== 1.0) {
      analysis.push({
        factor: 'Order Quantity',
        impact: multipliers.quantityAdjustment < 1.0 ? 'DECREASE' : 'INCREASE',
        weight: Math.abs(1.0 - multipliers.quantityAdjustment) * 100,
        value: `${factors.quantity} units`,
      });
    }

    // Client relationship
    if (multipliers.clientFactor !== 1.0) {
      analysis.push({
        factor: 'Client Relationship',
        impact: multipliers.clientFactor < 1.0 ? 'DECREASE' : 'INCREASE',
        weight: Math.abs(1.0 - multipliers.clientFactor) * 100,
        value: factors.client_history
          ? `${factors.client_history.total_orders} previous orders`
          : 'New client',
      });
    }

    // Market demand
    if (multipliers.demandFactor !== 1.0) {
      analysis.push({
        factor: 'Market Demand',
        impact: multipliers.demandFactor > 1.0 ? 'INCREASE' : 'DECREASE',
        weight: Math.abs(1.0 - multipliers.demandFactor) * 100,
        value: `${market.demand_level} demand, ${market.capacity_utilization}% capacity`,
      });
    }

    // Urgency
    if (multipliers.urgencyFactor !== 1.0) {
      analysis.push({
        factor: 'Timeline Urgency',
        impact: multipliers.urgencyFactor > 1.0 ? 'INCREASE' : 'DECREASE',
        weight: Math.abs(1.0 - multipliers.urgencyFactor) * 100,
        value: `${factors.deadline_days} days deadline`,
      });
    }

    // Seasonal
    if (multipliers.seasonalFactor !== 1.0) {
      analysis.push({
        factor: 'Seasonal Adjustment',
        impact: multipliers.seasonalFactor > 1.0 ? 'INCREASE' : 'DECREASE',
        weight: Math.abs(1.0 - multipliers.seasonalFactor) * 100,
        value: factors.season || 'NORMAL',
      });
    }

    return analysis;
  }

  // Generate pricing recommendations
  private generateRecommendations(
    factors: PricingFactors,
    market: MarketConditions,
    price: number,
    margin: number
  ): string[] {
    const recommendations: string[] = [];

    // Margin recommendations
    if (margin < 20) {
      recommendations.push('⚠️ Low margin detected - Consider negotiating higher price or reducing costs');
    } else if (margin > 50) {
      recommendations.push('💰 High margin opportunity - Price is competitive, client likely to accept');
    }

    // Market conditions
    if (market.capacity_utilization > 85) {
      recommendations.push('🔥 High capacity utilization - Premium pricing justified');
    } else if (market.capacity_utilization < 60) {
      recommendations.push('📉 Low capacity - Consider competitive pricing to win order');
    }

    // Client relationship
    if (factors.client_history) {
      if (factors.client_history.total_orders > 20) {
        recommendations.push('🤝 Long-term client - Loyalty discount applied');
      }
      if (factors.client_history.payment_reliability < 80) {
        recommendations.push('⚠️ Payment risk detected - Risk premium added or consider advance payment');
      }
    } else {
      recommendations.push('🆕 New client - Standard pricing with deposit required');
    }

    // Urgency
    if (factors.deadline_days <= 7) {
      recommendations.push('⏰ Rush order - Premium pricing applied for tight deadline');
    }

    // Quantity
    if (factors.quantity >= 5000) {
      recommendations.push('📦 Bulk order - Volume discount applied to remain competitive');
    } else if (factors.quantity < 100) {
      recommendations.push('🔧 Small order - Minimum order fee applied to cover setup costs');
    }

    // Material trends
    if (market.material_price_trend === 'RISING') {
      recommendations.push('📈 Rising material costs - Price includes cost escalation buffer');
    }

    // Competitor benchmark
    if (market.competitor_avg_price && market.competitor_avg_price > 0) {
      const diff = ((price - market.competitor_avg_price) / market.competitor_avg_price) * 100;
      if (diff > 15) {
        recommendations.push(`💡 Price is ${Math.abs(diff).toFixed(0)}% above market - Justify with quality/service`);
      } else if (diff < -15) {
        recommendations.push(`💡 Price is ${Math.abs(diff).toFixed(0)}% below market - Opportunity to increase margin`);
      } else {
        recommendations.push('✅ Price is competitive with market average');
      }
    }

    return recommendations;
  }

  // Assess pricing risk
  private assessPricingRisk(
    margin: number,
    clientHistory?: PricingFactors['client_history'],
    market?: MarketConditions
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;

    // Low margin = high risk
    if (margin < 15) riskScore += 3;
    else if (margin < 25) riskScore += 1;

    // Payment reliability
    if (clientHistory && clientHistory.payment_reliability < 80) {
      riskScore += 2;
    }

    // Market conditions
    if (market) {
      if (market.capacity_utilization < 50) riskScore += 1; // Desperate for orders
      if (market.material_price_trend === 'RISING') riskScore += 1; // Cost volatility
    }

    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  // Batch pricing analysis for multiple scenarios
  async analyzePricingScenarios(
    baseFactors: PricingFactors,
    market: MarketConditions
  ): Promise<{
    conservative: PricingRecommendation;
    recommended: PricingRecommendation;
    aggressive: PricingRecommendation;
  }> {
    // Conservative: Lower risk, lower margin
    const conservative = await this.calculatePricing(
      {
        ...baseFactors,
        deadline_days: baseFactors.deadline_days + 14, // More time
      },
      {
        ...market,
        demand_level: 'NORMAL',
        capacity_utilization: 70,
      }
    );

    // Recommended: Balanced
    const recommended = await this.calculatePricing(baseFactors, market);

    // Aggressive: Higher risk, higher margin
    const aggressive = await this.calculatePricing(
      {
        ...baseFactors,
        complexity: 'VERY_COMPLEX', // Justify premium
      },
      {
        ...market,
        demand_level: 'HIGH',
        capacity_utilization: 85,
      }
    );

    return { conservative, recommended, aggressive };
  }

  // Historical pricing analysis
  async analyzeHistoricalPricing(orders: Array<{
    client_id: string;
    product_type: string;
    quantity: number;
    quoted_price: number;
    actual_cost: number;
    accepted: boolean;
  }>): Promise<{
    average_margin: number;
    acceptance_rate: number;
    price_elasticity: number;
    optimal_margin_range: { min: number; max: number };
    insights: string[];
  }> {
    const totalOrders = orders.length;
    const acceptedOrders = orders.filter(o => o.accepted);

    // Calculate average margin
    const margins = orders.map(o => ((o.quoted_price - o.actual_cost) / o.quoted_price) * 100);
    const averageMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;

    // Calculate acceptance rate
    const acceptanceRate = (acceptedOrders.length / totalOrders) * 100;

    // Analyze price elasticity (simplified)
    const avgAcceptedPrice = acceptedOrders.reduce((sum, o) => sum + o.quoted_price, 0) / acceptedOrders.length;
    const avgRejectedPrice = orders
      .filter(o => !o.accepted)
      .reduce((sum, o) => sum + o.quoted_price, 0) / (totalOrders - acceptedOrders.length || 1);

    const priceElasticity = ((avgRejectedPrice - avgAcceptedPrice) / avgAcceptedPrice) * 100;

    // Find optimal margin range
    const acceptedMargins = acceptedOrders.map(
      o => ((o.quoted_price - o.actual_cost) / o.quoted_price) * 100
    );
    acceptedMargins.sort((a, b) => a - b);
    const optimalMarginRange = {
      min: acceptedMargins[Math.floor(acceptedMargins.length * 0.25)],
      max: acceptedMargins[Math.floor(acceptedMargins.length * 0.75)],
    };

    // Generate insights
    const insights: string[] = [];

    if (acceptanceRate > 80) {
      insights.push('✅ High acceptance rate - Pricing is competitive');
    } else if (acceptanceRate < 60) {
      insights.push('⚠️ Low acceptance rate - Consider more competitive pricing');
    }

    if (averageMargin < 25) {
      insights.push('📊 Average margin is low - Opportunity to increase profitability');
    } else if (averageMargin > 40) {
      insights.push('💰 Strong margins - Pricing strategy is effective');
    }

    if (priceElasticity > 20) {
      insights.push('📉 High price sensitivity - Small price changes significantly impact acceptance');
    }

    insights.push(
      `🎯 Optimal margin range: ${optimalMarginRange.min.toFixed(1)}% - ${optimalMarginRange.max.toFixed(1)}%`
    );

    return {
      average_margin: averageMargin,
      acceptance_rate: acceptanceRate,
      price_elasticity: priceElasticity,
      optimal_margin_range,
      insights,
    };
  }
}

// Export singleton
export const dynamicPricingAI = new DynamicPricingAI();
