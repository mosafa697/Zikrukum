import azkarData from '../dataset/azkar-sample.json';

export type AzkarPhrase = {
  id: number;
  text: string;
  count: number;
  subtext: string;
};

export type AzkarCategory = {
  id: number;
  title: string;
  phrases: AzkarPhrase[];
};

export const azkar: AzkarCategory[] = (
  azkarData as {
    id: number;
    category: string;
    array: { id: number; text: string; count: number; subtext: string }[];
  }[]
).map((category) => ({
  id: category.id,
  title: category.category,
  phrases: category.array.map((phrase) => ({
    id: phrase.id,
    text: phrase.text,
    count: phrase.count,
    subtext: phrase.subtext,
  })),
}));
