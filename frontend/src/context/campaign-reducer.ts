export default function reducer(state: CampaignCreation, action: Action): CampaignCreation {
    return {
        ...state,
        ...action,
    };
}
