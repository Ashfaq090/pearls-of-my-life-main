export type LegacyCard = {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  route?: string;
};

export const LEGACY_CARDS: LegacyCard[] = [
  {
    title: 'Written Notes',
    description: 'Write your memories here',
    icon: 'assets/icons/side-bar/notes.svg ',
    gradient: 'yellow-green',
  },
  {
    title: 'Video Box',
    description: 'Record your memories here',
    icon: 'assets/icons/side-bar/videos.svg',
    gradient: 'purple-orange',
  },
  {
    title: 'Photos for Home Going Program',
    description:
      'Click here to upload photos to be used as part of your home going program',
    icon: 'assets/icons/side-bar/memories.svg',
    gradient: 'red-green',
    route: '/memories',
  },
];
