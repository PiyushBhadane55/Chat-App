import { Client, Databases, Account } from 'appwrite';

export const PROJECT_ID='66eada5c002a2c42053e'
export const DATABASES_ID='66eadbfb002c6b5ee86e'
export const COLLECTION_ID_MESSAGES='66eadc0d0000e58d688c'

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('66eada5c002a2c42053e');

    export const account = new Account(client);
     export const databases = new Databases(client);



    export default client;