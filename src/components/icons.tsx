import type { ReactNode, SVGProps } from 'react';
import type { ActivityCategory } from '../types';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function make(children: ReactNode, viewBox = '0 0 24 24') {
  return function Icon({ size = 18, ...rest }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
      >
        {children}
      </svg>
    );
  };
}

/* Brand mark — compass rose on a rounded tile */
export const LogoMark = ({ size = 28, ...rest }: IconProps) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...rest}>
    <rect width="32" height="32" rx="9" fill="var(--color-pine)" />
    <circle cx="16" cy="16" r="9.5" fill="none" stroke="var(--color-chalk)" strokeWidth="1.6" opacity="0.9" />
    <path d="M20.8 11.2l-2.7 6.9-6.9 2.7 2.7-6.9z" fill="var(--color-persimmon)" />
    <circle cx="16" cy="16" r="1.4" fill="var(--color-chalk)" />
  </svg>
);

export const CompassIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </>,
);
export const MapIcon = make(
  <>
    <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </>,
);
export const RouteIcon = make(
  <>
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="6" r="2.2" />
    <path d="M8.2 17.2c4.2-.6 3.4-4.6 5.4-6.4 1.5-1.4 3-1.2 4.2-2.4" strokeDasharray="2.6 2.4" />
  </>,
);
export const TicketIcon = make(
  <>
    <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2.5a2 2 0 0 0 0 3V16a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2.5a2 2 0 0 0 0-3z" />
    <path d="M14 6v12" strokeDasharray="2 2.4" />
  </>,
);
export const CalendarIcon = make(
  <>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
  </>,
);
export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);
export const PinIcon = make(
  <>
    <path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10z" />
    <circle cx="12" cy="10.6" r="2.2" />
  </>,
);
export const StarIcon = make(<path d="M12 3.5l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6L3.8 9.4l5.7-.7z" />);
export const WalletIcon = make(
  <>
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
    <path d="M4 7.5V17a2.5 2.5 0 0 0 2.5 2.5H20V8H6.5A2.5 2.5 0 0 1 4 7.5z" />
    <circle cx="16.5" cy="13.8" r="1" fill="currentColor" stroke="none" />
  </>,
);
export const CameraIcon = make(
  <>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2.5h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" />
    <circle cx="12" cy="13" r="3.4" />
  </>,
);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const XIcon = make(<path d="M6 6l12 12M18 6L6 18" />);
export const CheckIcon = make(<path d="M4.5 12.5l5 5L19.5 7" />);
export const ChevronDownIcon = make(<path d="M6 9.5l6 6 6-6" />);
export const ChevronLeftIcon = make(<path d="M14.5 6l-6 6 6 6" />);
export const ChevronRightIcon = make(<path d="M9.5 6l6 6-6 6" />);
export const ArrowRightIcon = make(<path d="M4 12h15M13.5 6l6 6-6 6" />);
export const TrashIcon = make(
  <>
    <path d="M4.5 6.5h15M9.5 6V4.5A1.5 1.5 0 0 1 11 3h2a1.5 1.5 0 0 1 1.5 1.5V6" />
    <path d="M6.5 6.5l.8 12A2 2 0 0 0 9.3 20.5h5.4a2 2 0 0 0 2-1.9l.8-12.1" />
    <path d="M10 10.5v6M14 10.5v6" />
  </>,
);
export const PencilIcon = make(
  <>
    <path d="M4 20l.8-3.4L16.2 5.2a1.8 1.8 0 0 1 2.6 0l.1.1a1.8 1.8 0 0 1 0 2.6L7.4 19.2z" />
    <path d="M14.5 6.8l2.7 2.7" />
  </>,
);
export const SearchIcon = make(
  <>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15.2 15.2L20 20" />
  </>,
);
export const DownloadIcon = make(
  <>
    <path d="M12 4v10M8 10.5l4 4 4-4" />
    <path d="M4.5 16.5V18A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-1.5" />
  </>,
);
export const GearIcon = make(
  <>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8l1.2 2.3 2.6.5 1.8-1.8 1.5 1.5-1.8 1.8.5 2.6 2.3 1.2-2.3 1.2-.5 2.6 1.8 1.8-1.5 1.5-1.8-1.8-2.6.5L12 21.2l-1.2-2.3-2.6-.5-1.8 1.8-1.5-1.5 1.8-1.8-.5-2.6L3.9 12l2.3-1.2.5-2.6-1.8-1.8 1.5-1.5 1.8 1.8 2.6-.5z" strokeWidth={1.4} />
  </>,
);
export const GripIcon = make(
  <>
    <circle cx="9" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="17.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="17.5" r="1" fill="currentColor" stroke="none" />
  </>,
);
export const CoffeeIcon = make(
  <>
    <path d="M4.5 9h11v7a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z" />
    <path d="M15.5 10h1.6a2.4 2.4 0 0 1 0 4.8h-1.6" />
    <path d="M8 6c0-1 .8-1 .8-2M11.5 6c0-1 .8-1 .8-2" />
  </>,
);
export const MuseumIcon = make(
  <>
    <path d="M3.5 9L12 4l8.5 5" />
    <path d="M5.5 9.5V17M9.8 9.5V17M14.2 9.5V17M18.5 9.5V17" />
    <path d="M3.5 17h17M3 20h18" />
  </>,
);
export const BagIcon = make(
  <>
    <path d="M5.5 8h13l-1 12h-11z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </>,
);
export const LeafIcon = make(
  <>
    <path d="M5 19C4 8 12 4 20 4c0 8-4 16-15 15z" />
    <path d="M5 19c3-5 6-8 10-10" />
  </>,
);
export const ForkIcon = make(
  <>
    <path d="M7 3.5V9a2.5 2.5 0 0 0 5 0V3.5M9.5 3.5V20.5" />
    <path d="M16.5 3.5c-1.4 1-2 3-2 5.5v2h2.5v9.5M17 3.5V11" />
  </>,
);
export const LandmarkIcon = make(
  <>
    <path d="M12 3.5l7 4.5H5z" />
    <path d="M6 8v9M10 8v9M14 8v9M18 8v9" />
    <path d="M4 20.5h16M5 17h14" />
  </>,
);
export const SparkIcon = make(
  <>
    <path d="M12 3.5l1.8 5.4 5.4 1.8-5.4 1.8L12 18l-1.8-5.5-5.4-1.8 5.4-1.8z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" strokeWidth={1.3} />
  </>,
);
export const InfoIcon = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
  </>,
);
export const AlertIcon = make(
  <>
    <path d="M12 4L2.8 19.5h18.4z" />
    <path d="M12 10v4.2" />
    <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
  </>,
);
export const LayersIcon = make(
  <>
    <path d="M12 3.5l8.5 4.5L12 12.5 3.5 8z" />
    <path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5" />
  </>,
);
export const EyeIcon = make(
  <>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </>,
);
export const BedIcon = make(
  <>
    <path d="M3 6v13M3 15h18v4M3 12h18v3" />
    <path d="M6.5 9.5A1.8 1.8 0 0 1 8.3 8h3.4v4" />
  </>,
);
export const TrainIcon = make(
  <>
    <rect x="5" y="3.5" width="14" height="13" rx="3" />
    <path d="M5 10h14M9.5 3.5V10M14.5 3.5V10" />
    <circle cx="9" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <path d="M7.5 17l-2 3.5M16.5 17l2 3.5M6.5 20.5h11" />
  </>,
);
export const NoteIcon = make(
  <>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5v15A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5z" />
    <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
  </>,
);
export const ShuffleIcon = make(
  <>
    <path d="M3.5 7h3.2c5.3 0 6 10 11.3 10h2.5" />
    <path d="M3.5 17h3.2c1.9 0 3.2-1.2 4.3-2.8M20.5 7H18c-1.9 0-3.2 1.2-4.3 2.8" />
    <path d="M17.5 4.5L20.5 7l-3 2.5M17.5 14.5l3 2.5-3 2.5" />
  </>,
);
export const HomeIcon = make(
  <>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-6h4v6" />
  </>,
);
export const EuroIcon = make(
  <>
    <path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5" />
    <path d="M4.5 10.5h9M4.5 13.5h8" />
  </>,
);
export const QuoteIcon = make(
  <path d="M5 13.5c0-4.5 2.5-7.5 6-9l.8 1.6c-2.2 1.2-3.4 2.8-3.6 4.4.4-.2.8-.3 1.3-.3 1.9 0 3.2 1.4 3.2 3.3S11.2 17 9.2 17c-2.6 0-4.2-1.4-4.2-3.5zm9 0c0-4.5 2.5-7.5 6-9l.8 1.6c-2.2 1.2-3.4 2.8-3.6 4.4.4-.2.8-.3 1.3-.3 1.9 0 3.2 1.4 3.2 3.3S20.2 17 18.2 17c-2.6 0-4.2-1.4-4.2-3.5z" fill="currentColor" stroke="none" />,
);

/* ---------------- category mapping ---------------- */

export function CategoryIcon({ category, size = 16, ...rest }: IconProps & { category: ActivityCategory }) {
  switch (category) {
    case 'restaurant': return <ForkIcon size={size} {...rest} />;
    case 'cafe': return <CoffeeIcon size={size} {...rest} />;
    case 'museum': return <MuseumIcon size={size} {...rest} />;
    case 'shopping': return <BagIcon size={size} {...rest} />;
    case 'nature': return <LeafIcon size={size} {...rest} />;
    case 'other': return <TrainIcon size={size} {...rest} />;
    default: return <LandmarkIcon size={size} {...rest} />;
  }
}
