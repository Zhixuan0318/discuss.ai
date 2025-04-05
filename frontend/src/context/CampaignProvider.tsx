'use client';

import { createContext, Dispatch, useReducer } from 'react';

import reducer from './campaign-reducer';

const emptyCampaign: CampaignCreation = {
    name: '',
    title: '',
    lightLore: '',
    expectation: '',
    rules: '',
    scoring: [{ criteria: '', description: '', weightage: 0 }],
    references: [''],
    poolAmount: '',
    poolAddress: '',
    walletId: '',
    owner: '',
    blockchain: 'ETH-SEPOLIA',
};

export const CampaignContext = createContext<{
    campaign: CampaignCreation;
    dispatch: Dispatch<Action>;
}>({
    campaign: emptyCampaign,
    dispatch: () => {},
});

export function CampaignProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [campaign, dispatch] = useReducer(reducer, emptyCampaign);

    return (
        <CampaignContext.Provider value={{ campaign, dispatch }}>
            {children}
        </CampaignContext.Provider>
    );
}
