'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Handshake, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Tier {
    id: string;
    name: string;
    commission: number;
    services: string[];
    recommended?: boolean;
}

interface NegotiationCardProps {
    tiers: Tier[];
    onSelectTier: (tier: Tier) => void;
    onNegotiate: (offer?: {
        tierId: string;
        tierName: string;
        offeredCommission: number;
        message: string;
    }) => void;
    status?: string;
}

const NegotiationCard: React.FC<NegotiationCardProps> = ({ tiers, onSelectTier, onNegotiate, status }) => {
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [selectedTierId, setSelectedTierId] = useState('');
    const [commissionChoice, setCommissionChoice] = useState('');
    const [customCommission, setCustomCommission] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [messageDirty, setMessageDirty] = useState(false);

    const commissionOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    tiers
                        .map((tier) => Number(tier.commission))
                        .filter((value) => Number.isFinite(value))
                )
            ).sort((a, b) => a - b),
        [tiers]
    );

    const defaultTier = useMemo(() => {
        return tiers.find((tier) => tier.recommended) || tiers[tiers.length - 1] || tiers[0] || null;
    }, [tiers]);

    const selectedTier = useMemo(
        () => tiers.find((tier) => tier.id === selectedTierId) || defaultTier,
        [defaultTier, selectedTierId, tiers]
    );

    const resolvedCommission = useMemo(() => {
        if (commissionChoice === 'custom') {
            const parsed = Number.parseFloat(customCommission);
            return Number.isFinite(parsed) ? parsed : NaN;
        }
        const parsed = Number.parseFloat(commissionChoice);
        return Number.isFinite(parsed) ? parsed : NaN;
    }, [commissionChoice, customCommission]);

    useEffect(() => {
        if (!isOfferOpen) return;
        if (!selectedTier) return;
        if (messageDirty) return;
        if (!Number.isFinite(resolvedCommission)) return;
        setOfferMessage(`I want ${selectedTier.name} services at ${resolvedCommission}% commission.`);
    }, [isOfferOpen, messageDirty, resolvedCommission, selectedTier]);

    const openOfferDialog = () => {
        const preferredTier = defaultTier;
        const defaultCommission = preferredTier?.commission ?? commissionOptions[0] ?? 0;
        setSelectedTierId(preferredTier?.id || '');
        setCommissionChoice(String(defaultCommission));
        setCustomCommission('');
        setMessageDirty(false);
        setOfferMessage(
            preferredTier
                ? `I want ${preferredTier.name} services at ${defaultCommission}% commission.`
                : ''
        );
        setIsOfferOpen(true);
    };

    const submitOffer = () => {
        if (!selectedTier) return;
        if (!Number.isFinite(resolvedCommission)) return;
        const message = offerMessage.trim().length
            ? offerMessage.trim()
            : `I want ${selectedTier.name} services at ${resolvedCommission}% commission.`;
        onNegotiate({
            tierId: selectedTier.id,
            tierName: selectedTier.name,
            offeredCommission: Number(resolvedCommission.toFixed(2)),
            message,
        });
        setIsOfferOpen(false);
    };

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 sm:text-base">Option A - Accept a Tier</p>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {tiers.map((tier, index) => (
                    <div
                        key={tier.id}
                        className={`rounded-2xl border p-4 shadow-sm ${tier.recommended ? 'border-orange-300 bg-orange-50/40' : 'border-gray-200 bg-white'}`}
                    >
                        <div className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                            Tier {index + 1}
                        </div>
                        <h4 className="mt-3 text-xl font-semibold text-gray-900">{tier.name}</h4>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600">
                            {tier.services.map((service, serviceIndex) => (
                                <li key={`${tier.id}-${serviceIndex}`} className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                                    <span>{service}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="my-4 border-t border-gray-200" />
                        <p className="text-3xl font-semibold text-gray-900">
                            {tier.commission}%
                            <span className="ml-2 text-xl font-normal text-gray-500">commission</span>
                        </p>
                        <Button
                            className="mt-4 w-full bg-[#10245a] text-white hover:bg-[#0d1d49]"
                            onClick={() => onSelectTier(tier)}
                        >
                            Accept Tier {index + 1}
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-center">
                <h4 className="text-xl font-semibold text-gray-900">Option B - Negotiate Terms</h4>
                <p className="mt-2 text-sm text-gray-600">
                    Want premium services at a different rate? Make an offer.
                </p>
                <Button
                    className="mt-4 bg-amber-500 text-gray-900 hover:bg-amber-400"
                    onClick={openOfferDialog}
                >
                    <Handshake className="mr-2 h-4 w-4" />
                    Negotiate Offer
                </Button>
            </div>

            <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-gray-900">Make Your Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-800">Requested Services</p>
                            <select
                                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-700"
                                value={selectedTier?.id || ''}
                                onChange={(event) => {
                                    setSelectedTierId(event.target.value);
                                    setMessageDirty(false);
                                }}
                            >
                                {tiers.map((tier, index) => (
                                    <option key={tier.id} value={tier.id}>
                                        Tier {index + 1} - {tier.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-800">Offer Commission</p>
                            <div className="space-y-2">
                                {commissionOptions.map((commission) => {
                                    const optionValue = String(commission);
                                    return (
                                        <label
                                            key={optionValue}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800"
                                        >
                                            <input
                                                type="radio"
                                                name="commission-option"
                                                value={optionValue}
                                                checked={commissionChoice === optionValue}
                                                onChange={(event) => {
                                                    setCommissionChoice(event.target.value);
                                                    setMessageDirty(false);
                                                }}
                                            />
                                            <span>{commission}%</span>
                                        </label>
                                    );
                                })}
                                <label className="space-y-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="commission-option"
                                            value="custom"
                                            checked={commissionChoice === 'custom'}
                                            onChange={(event) => {
                                                setCommissionChoice(event.target.value);
                                                setMessageDirty(false);
                                            }}
                                        />
                                        <span>Custom %</span>
                                    </div>
                                    {commissionChoice === 'custom' && (
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            placeholder="Enter custom commission"
                                            value={customCommission}
                                            onChange={(event) => {
                                                setCustomCommission(event.target.value);
                                                setMessageDirty(false);
                                            }}
                                        />
                                    )}
                                </label>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-800">Message</p>
                            <textarea
                                className="min-h-[140px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                                value={offerMessage}
                                onChange={(event) => {
                                    setOfferMessage(event.target.value);
                                    setMessageDirty(true);
                                }}
                            />
                        </div>

                        <Button
                            className="w-full bg-[#10245a] text-white hover:bg-[#0d1d49]"
                            disabled={!selectedTier || !Number.isFinite(resolvedCommission)}
                            onClick={submitOffer}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Send Offer
                        </Button>
                        <p className="text-center text-xs text-gray-500">
                            <Sparkles className="mr-1 inline h-3 w-3" />
                            Current status: {(status || 'NEGOTIATION_PENDING').replace(/_/g, ' ')}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NegotiationCard;
