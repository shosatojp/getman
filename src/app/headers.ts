export interface KeyValuePair {
    key: string;
    value: string;
    enable: boolean;
}

export interface IEndPoint {
    requestId: string;
    name: string;
    url: string;
    method: string;
    headers: KeyValuePair[];
    params: KeyValuePair[];
    preScript: string;
    postScript: string;
    body: string;
}

export interface ICollection {
    name: string;
    collectionId: string;
    endpoints: IEndPoint[];

}

export interface IEnvironment {
    environmentId: string;
    name: string;
    variables: KeyValuePair[];
    cookies: KeyValuePair[];
}

export const HttpMethods = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTION',
];

export const CommonHttpHeaders = [
    'Content-Type',
    'User-Agent',
    'Referer',
];

export const ContentTypes = [
    'application/json',
    'plain/text',
];

export const MethodColor = {
    GET: '#448AFF',
    POST: '#00796B',
    DELETE: '#FF4081',
    OPTION: '#4CAF50',
    PUT: '#FFA000',
    PATCH: '#607D8B',
};


export function generateId(n: number) {
    let result = '';
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < n; i++) {
        result += str[Math.floor(Math.random() * str.length)];
    }
    return result;
}
