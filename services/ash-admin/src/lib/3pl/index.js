"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.threePLService = exports.ThreePLService = void 0;
const lalamove_1 = require("./providers/lalamove");
const jnt_1 = require("./providers/jnt");
class ThreePLService {
    constructor(config) {
        this.config = config || {};
    }
    /**
     * Get provider instance
     */
    getProvider(provider) {
        switch (provider) {
            case "LALAMOVE":
                return new lalamove_1.LalamoveProvider(this.config.lalamove || {});
            case "JNT":
                return new jnt_1.JNTProvider(this.config.jnt || {});
            case "GRAB":
                // TODO: Implement GrabExpress provider
                throw new Error("Grab Express integration coming soon");
            case "LBC":
                // TODO: Implement LBC provider
                throw new Error("LBC integration coming soon");
            case "NINJAVAN":
                // TODO: Implement Ninja Van provider
                throw new Error("Ninja Van integration coming soon");
            case "FLASH":
                // TODO: Implement Flash Express provider
                throw new Error("Flash Express integration coming soon");
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    /**
     * Get quotes from all providers or specific provider
     */
    async getQuotes(request) {
        const providers = request.provider
            ? [request.provider]
            : ["LALAMOVE", "JNT"]; // Add more as implemented
        const quotes = await Promise.allSettled(providers.map(async (provider) => {
            try {
                const instance = this.getProvider(provider);
                return await instance.getQuote(request.shipment);
            }
            catch (error) {
                return {
                    provider,
                    service_type: "STANDARD",
                    price: 0,
                    currency: "PHP",
                    available: false,
                    error: error.message,
                };
            }
        }));
        return quotes
            .filter(result => result.status === "fulfilled")
            .map(result => result.value)
            .sort((a, b) => a.price - b.price); // Sort by price (cheapest first)
    }
    /**
     * Book shipment with specific provider
     */
    async bookShipment(request) {
        try {
            const provider = this.getProvider(request.provider);
            return await provider.bookShipment(request.shipment, request.reference_number);
        }
        catch (error) {
            return {
                success: false,
                provider: request.provider,
                booking_id: "",
                tracking_number: "",
                total_amount: 0,
                currency: "PHP",
                error: error.message,
            };
        }
    }
    /**
     * Track shipment
     */
    async trackShipment(provider, trackingNumber) {
        const instance = this.getProvider(provider);
        return await instance.trackShipment(trackingNumber);
    }
    /**
     * Cancel shipment
     */
    async cancelShipment(request) {
        try {
            const provider = this.getProvider(request.provider);
            return await provider.cancelShipment(request.booking_id, request.reason);
        }
        catch (error) {
            return {
                success: false,
                provider: request.provider,
                booking_id: request.booking_id,
                cancelled_at: new Date().toISOString(),
                error: error.message,
            };
        }
    }
    /**
     * Get recommended provider based on price and availability
     */
    async getRecommendedProvider(shipment) {
        const quotes = await this.getQuotes({ shipment });
        const availableQuotes = quotes.filter(q => q.available);
        if (availableQuotes.length === 0) {
            return null;
        }
        // Return cheapest available option
        return availableQuotes[0];
    }
    /**
     * Compare all providers side by side
     */
    async compareProviders(shipment) {
        const quotes = await this.getQuotes({ shipment });
        const availableQuotes = quotes.filter(q => q.available);
        if (availableQuotes.length === 0) {
            return { cheapest: null, fastest: null, all: quotes };
        }
        const cheapest = availableQuotes.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
        const fastest = availableQuotes.reduce((prev, curr) => (prev.transit_time_hours || 999) < (curr.transit_time_hours || 999)
            ? prev
            : curr);
        return {
            cheapest,
            fastest,
            all: quotes,
        };
    }
}
exports.ThreePLService = ThreePLService;
// Export singleton instance
exports.threePLService = new ThreePLService();
// Export types
__exportStar(require("./types"), exports);
