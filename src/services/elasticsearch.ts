// src/services/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://elasticsearch:9200' });

const indexName = 'emails';

const createIndexIfNotExists = async () => {
  const indexExists = await client.indices.exists({ index: indexName });
  if (!indexExists) {
    await client.indices.create({ index: indexName });
    console.log(`Created Elasticsearch index: "${indexName}"`);
  }
};

export const indexEmail = async (email: any) => {
  await createIndexIfNotExists();
  try {
    await client.index({
      index: indexName,
      id: email.messageId,
      body: {
        from: email.from.text,
        to: email.to.text,
        subject: email.subject,
        date: email.date,
        body: email.text,
      },
    });
    console.log(`Indexed email with Message-ID: ${email.messageId}`);
  } catch (error) {
    console.error('Error indexing email:', error);
  }
};

export const searchEmails = async (query: string) => {
  try {
    const { body } = await client.search({
      index: indexName,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['from', 'to', 'subject', 'body'],
          },
        },
      },
    });
    return body.hits.hits.map((hit: any) => hit._source);
  } catch (error) {
    console.error('Error searching emails:', error);
    return [];
  }
};