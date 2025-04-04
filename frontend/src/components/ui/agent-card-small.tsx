import Image from 'next/image';

interface Props {
    name: string;
    description: string;
}

export default function AgentCardSmall({ name, description }: Props) {
    return (
        <figure className='max-w-[370px] p-2 flex items-center gap-x-4 border border-quaternary rounded-3xl'>
            <Image
                src={`/images/agent/${name.toLocaleLowerCase().replaceAll(' ', '-')}.png`}
                alt='agent'
                width={100}
                height={100}
            />
            <div className='text-left'>
                <h4>{description}</h4>
                <h5 className='text-xs font-rubik font-light'>Judge by {name}</h5>
            </div>
        </figure>
    );
}
