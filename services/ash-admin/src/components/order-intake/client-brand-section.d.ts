import React from 'react';
interface Client {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    brands: Array<{
        id: string;
        name: string;
        code: string;
    }>;
}
interface ClientBrandSectionProps {
    clients: Client[];
    selectedClientId: string;
    selectedBrandId: string;
    channel: string;
    onClientChange: (clientId: string) => void;
    onBrandChange: (brandId: string) => void;
    onChannelChange: (channel: string) => void;
    onClientCreated: (client: Client) => void;
}
export declare function ClientBrandSection({ clients, selectedClientId, selectedBrandId, channel, onClientChange, onBrandChange, onChannelChange, onClientCreated }: ClientBrandSectionProps): React.JSX.Element;
export {};
