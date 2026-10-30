// Tiny inline icon set (decorative: aria-hidden). Keeps the bundle free of icon libraries.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

const make = (paths) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {paths}
      </svg>
    );
  };

export const IconSeat = make(<><path d="M7 4h4a2 2 0 0 1 2 2v6h4a2 2 0 0 1 2 2v3H7z" /><path d="M5 20h14" /></>);
export const IconGear = make(<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" /></>);
export const IconPin = make(<><path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>);
export const IconBell = make(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></>);
export const IconMenu = make(<><path d="M4 6h16M4 12h16M4 18h16" /></>);
export const IconClose = make(<><path d="M6 6l12 12M18 6L6 18" /></>);
export const IconCar = make(<><path d="M5 16l1.5-5a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 16" /><rect x="3" y="16" width="18" height="4" rx="1.5" /><circle cx="7.5" cy="18" r=".5" /><circle cx="16.5" cy="18" r=".5" /></>);
export const IconCheck = make(<><path d="M5 12.5l4.5 4.5L19 7.5" /></>);
export const IconShield = make(<><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>);
export const IconCalendar = make(<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>);
export const IconWallet = make(<><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z" /><circle cx="16.5" cy="14.5" r="1.2" /></>);
export const IconHome = make(<><path d="M4 11l8-7 8 7v9H4z" /><path d="M10 20v-6h4v6" /></>);
export const IconList = make(<><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></>);
export const IconChart = make(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>);
export const IconUsers = make(<><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.3c2 .7 3.5 2.9 3.5 5.7" /></>);
export const IconStar = make(<><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z" fill="currentColor" /></>);
export const IconAlert = make(<><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></>);
export const IconDownload = make(<><path d="M12 4v11M7 11l5 5 5-5M4 20h16" /></>);
export const IconMegaphone = make(<><path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z" /><path d="M19 9a4 4 0 0 1 0 6" /></>);
export const IconSearch = make(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>);
export const IconFile = make(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>);
export const IconMessage = make(<><path d="M4 5h16v11H9l-5 4z" /></>);

/** Brand mark: a stylised wheel. */
export function LogoMark(props) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <circle cx="20" cy="20" r="19" fill="#0b1f3a" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#f0a202" strokeWidth="3" />
      <circle cx="20" cy="20" r="3.2" fill="#f0a202" />
      <path d="M20 7.5v9M20 23.5v9M7.5 20h9M23.5 20h9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
    </svg>
  );
}
