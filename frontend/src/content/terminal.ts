export const messages = [
    'Built with provided lore',
    'Discussion campaign created',
    'Understood all the expectations',
    'Noted down the rules',
    'Memorized the rubric',
    'Digested all the references',
    'Gained access to the pool',
    'Equipped with necessary tools',
];

export const ensDomain = 'registered and setup ens subdomain';

export const photoUpload = (name: string, picture: string) => {
    return `${name} uploaded one file -${picture}.jpg`;
};

export const finish = (name: string) => {
    return `Success! ${name} initialization complete. Discussion is now ongoing`;
};
