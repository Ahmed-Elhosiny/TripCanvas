/* Curated photo set used across trips, places and memories */
export const IMG = {
  hero: 'https://image.qwenlm.ai/generated-images/be67ea76-444b-42ea-8b2c-69d873eb393f/_result.png',
  rome: 'https://image.qwenlm.ai/generated-images/bcf67c90-038b-4e0c-9bea-e7237327e046/_result.png',
  kyoto: 'https://image.qwenlm.ai/generated-images/35c88fea-bcdf-459b-b714-84619be901b9/_result.png',
  paris: 'https://image.qwenlm.ai/generated-images/21154554-5154-48e4-9b3c-a38597eaf88e/_result.png',
  vatican: 'https://image.qwenlm.ai/generated-images/eb50d8d8-a471-45e2-b3ad-f1e3567ea783/_result.png',
  trevi: 'https://image.qwenlm.ai/generated-images/7ecfb535-c452-407f-9203-c4d42c56785b/_result.png',
  pantheon: 'https://image.qwenlm.ai/generated-images/2b5ce41e-3b21-40c2-bb49-f01f938bf727/_result.png',
  florence: 'https://image.qwenlm.ai/generated-images/527a749b-8d61-481d-85d7-0dcdb920dcb4/_result.png',
  venice: 'https://image.qwenlm.ai/generated-images/b97b374b-3a56-4d6d-8b0c-cf82cd98c4a3/_result.png',
  trattoria: 'https://image.qwenlm.ai/generated-images/856e3d7c-3329-40c0-9d85-482c58790f60/_result.png',
} as const;

export const COVER_CHOICES: { id: string; label: string; src: string }[] = [
  { id: 'rome', label: 'Rome', src: IMG.rome },
  { id: 'kyoto', label: 'Kyoto', src: IMG.kyoto },
  { id: 'paris', label: 'Paris', src: IMG.paris },
  { id: 'venice', label: 'Venice', src: IMG.venice },
  { id: 'florence', label: 'Florence', src: IMG.florence },
  { id: 'coast', label: 'Coast', src: IMG.hero },
];

/* Images available for a trip's memory journal */
export function galleryFor(covers: (string | undefined)[]): string[] {
  const set = new Set<string>();
  covers.forEach((c) => c && set.add(c));
  return [...set];
}
